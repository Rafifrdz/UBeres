import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env';
import { getDb } from '../db/mongo';

const router = Router();
const client = new OAuth2Client(env.googleClientId);

router.post('/google', async (req, res) => {
  const { credential, role } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Missing credential token' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: env.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: 'Invalid token payload' });
    }

    const { sub: uid, email, name, picture } = payload;

    const db = getDb();
    const usersCollection = db.collection('users');

    // Find or create user
    let user = await usersCollection.findOne({ uid });

    if (!user) {
      user = {
        uid,
        email,
        displayName: name,
        photoURL: picture,
        role: role || 'client', // Use provided role or default
        rating: 5.0,
        totalRatings: 0,
        createdAt: new Date(),
      };
      await usersCollection.insertOne(user);
    }

    res.json({ user });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

export default router;
