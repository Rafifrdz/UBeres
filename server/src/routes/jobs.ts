import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { connectMongo } from '../db/mongo';
import { generateAIInsight } from '../lib/ai';

type JobStatus = 'open' | 'assigned' | 'paid' | 'working' | 'submitting' | 'completed' | 'disputed' | 'refunded';

const validStatuses: JobStatus[] = ['open', 'assigned', 'paid', 'working', 'submitting', 'completed', 'disputed', 'refunded'];
const allowedTransitions: Record<JobStatus, JobStatus[]> = {
  open: ['assigned'],
  assigned: ['paid'],
  paid: ['working', 'completed', 'disputed'],
  working: ['submitting', 'completed', 'disputed'],
  submitting: ['completed', 'disputed'],
  disputed: ['refunded', 'completed'],
  refunded: [],
  completed: [],
};

const router = Router();

function toJobResponse(doc: Record<string, unknown> | null) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return {
    id: _id instanceof ObjectId ? _id.toHexString() : String(_id),
    ...rest,
  };
}

function toDocResponse(doc: Record<string, unknown> | null) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return {
    id: _id instanceof ObjectId ? _id.toHexString() : String(_id),
    ...rest,
  };
}

async function getJobOr404(jobId: string) {
  if (!ObjectId.isValid(jobId)) {
    return { error: { status: 400, message: 'jobId tidak valid' } };
  }

  const db = await connectMongo();
  const jobs = db.collection('jobs');
  const job = await jobs.findOne({ _id: new ObjectId(jobId) });

  if (!job) {
    return { error: { status: 404, message: 'Job tidak ditemukan' } };
  }

  return { db, jobs, job };
}

router.get('/', async (req, res) => {
  const db = await connectMongo();

  const status = String(req.query.status ?? '');
  const category = String(req.query.category ?? '').trim();
  const q = String(req.query.q ?? '').trim();
  const clientId = String(req.query.clientId ?? '').trim();
  const workerId = String(req.query.workerId ?? '').trim();
  const limit = Math.min(Number(req.query.limit ?? 50), 200);

  const filter: Record<string, unknown> = {};

  if (status && validStatuses.includes(status as JobStatus)) {
    filter.status = status;
  }

  if (clientId) {
    filter.clientId = clientId;
  }

  if (workerId) {
    filter.workerId = workerId;
  }

  if (category) {
    filter.category = category;
  }

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { keywords: { $regex: q, $options: 'i' } },
    ];
  }

  const sortParam = String(req.query.sort ?? '');
  let sort: Record<string, any> = { createdAt: -1 };
  if (sortParam === 'trending') {
    sort = { bidCount: -1, createdAt: -1 };
  }

  const jobs = await db.collection('jobs').find(filter).sort(sort).limit(limit).toArray();

  res.json({ data: jobs.map((job) => toJobResponse(job as Record<string, unknown>)) });
});

router.get('/bids', async (req, res) => {
  const db = await connectMongo();
  const workerId = String(req.query.workerId ?? req.header('x-user-id') ?? '').trim();
  const status = String(req.query.status ?? '').trim();

  if (!workerId) {
    return res.status(400).json({ error: 'workerId atau header x-user-id wajib diisi' });
  }

  const filter: Record<string, unknown> = { workerId };
  if (status) {
    filter.status = status;
  }

  const bids = await db
    .collection('bids')
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  return res.json({ data: bids.map((bid) => toDocResponse(bid as Record<string, unknown>)) });
});

router.get('/:jobId', async (req, res) => {
  const db = await connectMongo();
  const { jobId } = req.params;

  if (!ObjectId.isValid(jobId)) {
    return res.status(400).json({ error: 'jobId tidak valid' });
  }

  const job = await db.collection('jobs').findOne({ _id: new ObjectId(jobId) });
  if (!job) {
    return res.status(404).json({ error: 'Job tidak ditemukan' });
  }

  return res.json({ data: toJobResponse(job as Record<string, unknown>) });
});

router.post('/', async (req, res) => {
  const db = await connectMongo();

  const title = String(req.body?.title ?? '').trim();
  const description = String(req.body?.description ?? '').trim();
  let category = String(req.body?.category ?? '').trim();
  if (!category) category = 'Umum';
  const budget = Number(req.body?.budget ?? 0);
  const deadline = req.body?.deadline ? new Date(req.body.deadline) : null;

  const clientId = String(req.body?.clientId ?? req.header('x-user-id') ?? '').trim();
  const clientName = String(req.body?.clientName ?? '').trim();
  const clientPhotoURL = String(req.body?.clientPhotoURL ?? '').trim();
  const keywordsStr = String(req.body?.keywords ?? '').trim();
  const isAnonymous = Boolean(req.body?.isAnonymous);
  const isFixedPrice = Boolean(req.body?.isFixedPrice);
  const images = Array.isArray(req.body?.images) ? req.body.images : [];

  // Convert "Skill 1, Skill 2" to ["Skill 1", "Skill 2"]
  const keywords = keywordsStr.split(',').map(s => s.trim()).filter(s => s);

  if (!clientId) {
    return res.status(400).json({ error: 'clientId atau header x-user-id wajib diisi' });
  }

  if (!title || !description) {
    return res.status(400).json({ error: 'title dan description wajib diisi' });
  }

  if (Number.isNaN(budget) || budget < 0) {
    return res.status(400).json({ error: 'budget tidak valid' });
  }

  if (deadline && Number.isNaN(deadline.getTime())) {
    return res.status(400).json({ error: 'deadline tidak valid' });
  }

  const now = new Date();
  const payload = {
    title,
    description,
    category,
    budget,
    deadline,
    clientId,
    clientName,
    clientPhotoURL,
    keywords,
    isAnonymous,
    isFixedPrice,
    workerId: null,
    status: 'open' as JobStatus,
    bidCount: 0,
    images,
    createdAt: now,
    updatedAt: now,
    aiInsight: '',
  };

  const result = await db.collection('jobs').insertOne(payload);

  // Generate AI Insight in background (non-blocking)
  generateAIInsight(title, description, budget, deadline).then(insight => {
    if (insight) {
      console.log(`💾 Saving AI Insight to Job ${result.insertedId}...`);
      db.collection('jobs').updateOne(
        { _id: result.insertedId },
        { $set: { aiInsight: insight } }
      ).then(() => console.log("✨ AI Insight saved successfully!"))
       .catch(err => console.error('❌ Failed to update job with AI insight:', err));
    }
  }).catch(err => console.error('❌ AI Insight background task failed:', err));

  const created = await db.collection('jobs').findOne({ _id: new ObjectId(result.insertedId) });

  return res.status(201).json({ data: toJobResponse(created as Record<string, unknown>) });
});

router.patch('/:jobId/status', async (req, res) => {
  const db = await connectMongo();
  const { jobId } = req.params;
  const nextStatus = String(req.body?.status ?? '').trim() as JobStatus;
  const actorId = String(req.body?.actorId ?? req.header('x-user-id') ?? '').trim();
  const workerId = req.body?.workerId ? String(req.body.workerId).trim() : undefined;

  if (!ObjectId.isValid(jobId)) {
    return res.status(400).json({ error: 'jobId tidak valid' });
  }

  if (!validStatuses.includes(nextStatus)) {
    return res.status(400).json({ error: 'status tujuan tidak valid' });
  }

  if (!actorId) {
    return res.status(400).json({ error: 'actorId atau header x-user-id wajib diisi' });
  }

  const jobs = db.collection('jobs');
  const existing = await jobs.findOne({ _id: new ObjectId(jobId) });

  if (!existing) {
    return res.status(404).json({ error: 'Job tidak ditemukan' });
  }

  const currentStatus = String(existing.status) as JobStatus;
  const currentClientId = String(existing.clientId ?? '');
  const currentWorkerId = existing.workerId ? String(existing.workerId) : '';

  if (!allowedTransitions[currentStatus].includes(nextStatus)) {
    return res.status(400).json({
      error: `Transisi status tidak valid: ${currentStatus} -> ${nextStatus}`,
    });
  }

  if (nextStatus === 'assigned') {
    if (actorId !== currentClientId) {
      return res.status(403).json({ error: 'Hanya client pemilik job yang boleh assign worker' });
    }
    if (!workerId) {
      return res.status(400).json({ error: 'workerId wajib saat assign worker' });
    }
  }

  if (nextStatus === 'paid' || nextStatus === 'completed' || nextStatus === 'disputed') {
    if (actorId !== currentClientId) {
      return res.status(403).json({ error: 'Aksi ini hanya boleh dilakukan client' });
    }
  }

  if (nextStatus === 'working' || nextStatus === 'submitting') {
    if (!currentWorkerId || actorId !== currentWorkerId) {
      return res.status(403).json({ error: 'Aksi ini hanya boleh dilakukan worker terpilih' });
    }
  }

  const updatePayload: Record<string, unknown> = {
    status: nextStatus,
    updatedAt: new Date(),
  };

  if (nextStatus === 'assigned') {
    updatePayload.workerId = workerId;
    
    // Ambil harga dari bid yang dipilih untuk jadi budget final
    const bid = await db.collection('bids').findOne({ jobId, workerId });
    if (bid && typeof bid.price === 'number') {
      updatePayload.budget = bid.price;
    }
    
    // Update bid statuses for this job
    await db.collection('bids').updateMany(
      { jobId, workerId: { $ne: workerId } },
      { $set: { status: 'rejected' } }
    );
    await db.collection('bids').updateOne(
      { jobId, workerId },
      { $set: { status: 'accepted' } }
    );
  }

  if (nextStatus === 'paid') {
    // Client membayar, dana masuk ke escrow worker
    const amount = existing.budget || 0;
    await db.collection('users').updateOne(
      { uid: currentClientId },
      { $inc: { balance: -amount } }
    );
    await db.collection('users').updateOne(
      { uid: currentWorkerId },
      { $inc: { escrow: amount } }
    );
  }

  if (nextStatus === 'completed') {
    // Pekerjaan selesai, dana escrow worker cair ke balance
    const amount = existing.budget || 0;
    await db.collection('users').updateOne(
      { uid: currentWorkerId },
      { 
        $inc: { escrow: -amount, balance: amount },
        $push: { 
          transactions: {
            type: 'in',
            title: `Hasil Jasa: ${existing.title}`,
            amount: amount,
            date: new Date()
          } as any
        }
      }
    );
  }

  await jobs.updateOne({ _id: new ObjectId(jobId) }, { $set: updatePayload });
  const updated = await jobs.findOne({ _id: new ObjectId(jobId) });

  return res.json({ data: toJobResponse(updated as Record<string, unknown>) });
});

router.get('/:jobId/bids', async (req, res) => {
  const { jobId } = req.params;
  const resolved = await getJobOr404(jobId);
  if ('error' in resolved) {
    return res.status(resolved.error.status).json({ error: resolved.error.message });
  }

  const bids = await resolved.db
    .collection('bids')
    .find({ jobId })
    .sort({ createdAt: -1 })
    .toArray();

  return res.json({ data: bids.map((bid) => toDocResponse(bid as Record<string, unknown>)) });
});

router.post('/:jobId/bids', async (req, res) => {
  const { jobId } = req.params;
  const resolved = await getJobOr404(jobId);
  if ('error' in resolved) {
    return res.status(resolved.error.status).json({ error: resolved.error.message });
  }

  let actorId = String(req.body?.workerId ?? req.header('x-user-id') ?? '').trim();
  let workerName = String(req.body?.workerName ?? '').trim();
  let workerRating = req.body?.workerRating ? Number(req.body.workerRating) : undefined;
  const price = Number(req.body?.price ?? 0);
  const pitch = String(req.body?.pitch ?? '').trim();

  // Jika workerName kosong, coba ambil dari database users
  if (actorId && !workerName) {
    const worker = await resolved.db.collection('users').findOne({ uid: actorId });
    if (worker) {
      workerName = worker.displayName || 'Worker UB';
      workerRating = worker.rating;
    } else {
      // Fallback jika user belum terdaftar di koleksi users
      workerName = 'Worker Terverifikasi';
    }
  }

  if (!actorId || !workerName || !pitch || Number.isNaN(price) || price <= 0) {
    return res.status(400).json({ error: 'Data bid tidak valid. Pastikan profil Anda sudah lengkap.' });
  }

  if (String(resolved.job.status) !== 'open') {
    return res.status(400).json({ error: 'Bid hanya bisa dibuat saat status job open' });
  }

  const now = new Date();
  const payload = {
    jobId,
    jobTitle: resolved.job.title,
    clientName: resolved.job.clientName,
    workerId: actorId,
    workerName,
    workerRating,
    price,
    pitch,
    status: 'pending',
    createdAt: now,
  };

  const existingBid = await resolved.db.collection('bids').findOne({ jobId, workerId: actorId });
  if (existingBid) {
    return res.status(409).json({ error: 'Worker sudah pernah bid di job ini' });
  }

  const inserted = await resolved.db.collection('bids').insertOne(payload);
  await resolved.jobs.updateOne({ _id: resolved.job._id }, { $inc: { bidCount: 1 }, $set: { updatedAt: now } });
  const bid = await resolved.db.collection('bids').findOne({ _id: inserted.insertedId });

  return res.status(201).json({ data: toDocResponse(bid as Record<string, unknown>) });
});

router.get('/:jobId/messages', async (req, res) => {
  const { jobId } = req.params;
  const resolved = await getJobOr404(jobId);
  if ('error' in resolved) {
    return res.status(resolved.error.status).json({ error: resolved.error.message });
  }

  const actorId = String(req.query.actorId ?? req.header('x-user-id') ?? '').trim();
  if (!actorId) {
    return res.status(400).json({ error: 'actorId atau header x-user-id wajib diisi' });
  }

  const clientId = String(resolved.job.clientId ?? '');
  const workerId = String(resolved.job.workerId ?? '');
  if (actorId !== clientId && actorId !== workerId) {
    return res.status(403).json({ error: 'Hanya client atau worker terpilih yang bisa lihat chat' });
  }

  const messages = await resolved.db
    .collection('messages')
    .find({ jobId })
    .sort({ createdAt: 1 })
    .toArray();

  return res.json({ data: messages.map((message) => toDocResponse(message as Record<string, unknown>)) });
});

router.post('/:jobId/messages', async (req, res) => {
  const { jobId } = req.params;
  const resolved = await getJobOr404(jobId);
  if ('error' in resolved) {
    return res.status(resolved.error.status).json({ error: resolved.error.message });
  }

  const senderId = String(req.body?.senderId ?? req.header('x-user-id') ?? '').trim();
  const text = String(req.body?.text ?? '').trim();

  if (!senderId || !text) {
    return res.status(400).json({ error: 'senderId dan text wajib diisi' });
  }

  const clientId = String(resolved.job.clientId ?? '');
  const workerId = String(resolved.job.workerId ?? '');
  if (senderId !== clientId && senderId !== workerId) {
    return res.status(403).json({ error: 'Hanya client atau worker terpilih yang bisa kirim chat' });
  }

  const payload = {
    jobId,
    senderId,
    text,
    createdAt: new Date(),
  };

  const inserted = await resolved.db.collection('messages').insertOne(payload);
  const message = await resolved.db.collection('messages').findOne({ _id: inserted.insertedId });
  return res.status(201).json({ data: toDocResponse(message as Record<string, unknown>) });
});

router.get('/:jobId/reviews', async (req, res) => {
  const { jobId } = req.params;
  const db = getDb();
  const reviews = await db.collection('reviews').find({ jobId }).toArray();
  return res.json({ data: reviews });
});

router.post('/:jobId/review', async (req, res) => {
  const { jobId } = req.params;
  const resolved = await getJobOr404(jobId);
  if ('error' in resolved) {
    return res.status(resolved.error.status).json({ error: resolved.error.message });
  }

  const clientId = String(req.body?.clientId ?? req.header('x-user-id') ?? '').trim();
  const workerId = String(resolved.job.workerId ?? '');
  const rating = Number(req.body?.rating ?? 0);
  const comment = String(req.body?.comment ?? '').trim();

  if (!clientId || rating < 1 || rating > 5 || !workerId) {
    return res.status(400).json({ error: 'Data review tidak valid' });
  }

  if (String(resolved.job.clientId) !== clientId) {
    return res.status(403).json({ error: 'Hanya client yang bisa merating worker' });
  }

  const reviewsCollection = resolved.db.collection('reviews');
  const existingReview = await reviewsCollection.findOne({ jobId, reviewerId: clientId });

  if (existingReview) {
    if (existingReview.edited) {
      return res.status(400).json({ error: 'Kamu hanya bisa mengedit review 1 kali' });
    }
    
    // Update existing review
    await reviewsCollection.updateOne(
      { _id: existingReview._id },
      { 
        $set: { 
          rating, 
          comment, 
          edited: true, 
          updatedAt: new Date() 
        } 
      }
    );
  } else {
    // Create new review
    await reviewsCollection.insertOne({
      jobId,
      reviewerId: clientId,
      targetId: workerId,
      rating,
      comment,
      edited: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // Recalculate worker rating
  const allReviews = await reviewsCollection.find({ targetId: workerId }).toArray();
  const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalRating / allReviews.length;

  await resolved.db.collection('users').updateOne(
    { uid: workerId },
    { $set: { rating: averageRating, totalRatings: allReviews.length } }
  );

  return res.json({ message: 'Review berhasil disimpan' });
});

export default router;
