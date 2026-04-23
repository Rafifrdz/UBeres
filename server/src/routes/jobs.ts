import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { connectMongo } from '../db/mongo';

type JobStatus = 'open' | 'assigned' | 'paid' | 'working' | 'submitting' | 'completed';

const validStatuses: JobStatus[] = ['open', 'assigned', 'paid', 'working', 'submitting', 'completed'];
const allowedTransitions: Record<JobStatus, JobStatus[]> = {
  open: ['assigned'],
  assigned: ['paid'],
  paid: ['working'],
  working: ['submitting'],
  submitting: ['completed'],
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

  const status = String(req.query.status ?? 'open');
  const category = String(req.query.category ?? '').trim();
  const q = String(req.query.q ?? '').trim();
  const limit = Math.min(Number(req.query.limit ?? 50), 200);

  const filter: Record<string, unknown> = {};

  if (validStatuses.includes(status as JobStatus)) {
    filter.status = status;
  }

  if (category) {
    filter.category = category;
  }

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
  }

  const jobs = await db.collection('jobs').find(filter).sort({ createdAt: -1 }).limit(limit).toArray();

  res.json({ data: jobs.map((job) => toJobResponse(job as Record<string, unknown>)) });
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
  const category = String(req.body?.category ?? 'Tugas').trim();
  const budget = Number(req.body?.budget ?? 0);
  const deadline = req.body?.deadline ? new Date(req.body.deadline) : null;

  const clientId = String(req.body?.clientId ?? req.header('x-user-id') ?? '').trim();

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
    workerId: null,
    status: 'open' as JobStatus,
    bidCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection('jobs').insertOne(payload);
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

  if (nextStatus === 'paid' || nextStatus === 'completed') {
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

  const actorId = String(req.body?.workerId ?? req.header('x-user-id') ?? '').trim();
  const workerName = String(req.body?.workerName ?? '').trim();
  const workerRating = req.body?.workerRating ? Number(req.body.workerRating) : undefined;
  const price = Number(req.body?.price ?? 0);
  const pitch = String(req.body?.pitch ?? '').trim();

  if (!actorId || !workerName || !pitch || Number.isNaN(price) || price <= 0) {
    return res.status(400).json({ error: 'Data bid tidak valid' });
  }

  if (String(resolved.job.status) !== 'open') {
    return res.status(400).json({ error: 'Bid hanya bisa dibuat saat status job open' });
  }

  const now = new Date();
  const payload = {
    jobId,
    workerId: actorId,
    workerName,
    workerRating,
    price,
    pitch,
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

export default router;
