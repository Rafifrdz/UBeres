import { Router } from 'express';
import { getDb } from '../db/mongo';

const router = Router();

// List & Search Users
router.get('/', async (req, res) => {
  const db = getDb();
  const { role, category, q, minRating, limit, sort } = req.query;

  const query: any = {};
  if (role) query.role = role;
  if (category) query.category = category;
  if (q) {
    query.displayName = { $regex: '^' + String(q), $options: 'i' };
  }
  if (minRating) {
    query.rating = { $gte: Number(minRating) };
  }

  const sortOption: any = {};
  if (sort === 'rating') sortOption.rating = -1;
  else if (sort === 'totalRatings') sortOption.totalRatings = -1;
  else sortOption.createdAt = -1;

  const users = await db.collection('users')
    .find(query)
    .sort(sortOption)
    .limit(Math.min(Number(limit ?? 20), 50))
    .toArray();

  res.json({ data: users });
});

// Get Top Workers
router.get('/top-workers', async (req, res) => {
  const db = getDb();
  const limit = Math.min(Number(req.query.limit ?? 5), 20);
  
  const workers = await db.collection('users')
    .find({ role: 'worker' })
    .sort({ rating: -1, totalRatings: -1 })
    .limit(limit)
    .toArray();

  res.json({ data: workers });
});

// Get User Profile & Wallet
router.get('/:uid', async (req, res) => {
  const { uid } = req.params;
  const db = getDb();
  const user = await db.collection('users').findOne({ uid });

  if (!user) {
    return res.status(404).json({ error: 'User tidak ditemukan' });
  }

  res.json({ data: user });
});

// Update Portfolio & Bio
router.patch('/:uid/portfolio', async (req, res) => {
  const { uid } = req.params;
  const { bio, skills, portfolio } = req.body;
  const db = getDb();

  const update: any = {};
  if (bio !== undefined) update.bio = bio;
  if (skills !== undefined) update.skills = skills;
  if (portfolio !== undefined) update.portfolio = portfolio;

  await db.collection('users').updateOne({ uid }, { $set: update });
  const updated = await db.collection('users').findOne({ uid });

  res.json({ data: updated });
});

// Withdraw Simulation
router.post('/:uid/withdraw', async (req, res) => {
  const { uid } = req.params;
  const amount = Number(req.body?.amount ?? 0);
  const db = getDb();

  if (amount <= 0) {
    return res.status(400).json({ error: 'Nominal tidak valid' });
  }

  const user = await db.collection('users').findOne({ uid });
  if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

  const currentBalance = user.balance || 0;
  if (currentBalance < amount) {
    return res.status(400).json({ error: 'Saldo tidak mencukupi' });
  }

  await db.collection('users').updateOne(
    { uid },
    { 
      $inc: { balance: -amount },
      $push: { 
        transactions: {
          type: 'out',
          title: 'Tarik Saldo',
          amount,
          date: new Date(),
          status: 'success'
        } as any
      }
    }
  );

  const updated = await db.collection('users').findOne({ uid });
  res.json({ data: updated });
});

// Top Up Simulation
router.post('/:uid/topup', async (req, res) => {
  const { uid } = req.params;
  const amount = Number(req.body?.amount ?? 0);
  const db = getDb();

  if (amount <= 0) {
    return res.status(400).json({ error: 'Nominal tidak valid' });
  }

  await db.collection('users').updateOne(
    { uid },
    { 
      $inc: { balance: amount },
      $push: { 
        transactions: {
          type: 'in',
          title: 'Top Up Saldo',
          amount,
          date: new Date(),
          status: 'success'
        } as any
      }
    }
  );

  const updated = await db.collection('users').findOne({ uid });
  res.json({ data: updated });
});

// Get User Reviews
router.get('/:uid/reviews', async (req, res) => {
  const { uid } = req.params;
  const db = getDb();
  
  const reviews = await db.collection('reviews')
    .find({ targetId: uid })
    .sort({ createdAt: -1 })
    .toArray();

  // Ambil info reviewer (nama & foto)
  const populated = await Promise.all(reviews.map(async (r) => {
    const reviewer = await db.collection('users').findOne({ uid: r.reviewerId });
    return {
      ...r,
      reviewerName: reviewer?.displayName || 'User UBeres',
      reviewerPhoto: reviewer?.photoURL
    };
  }));

  res.json({ data: populated });
});

export default router;
