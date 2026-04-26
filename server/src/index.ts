import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { env } from './config/env';
import { connectMongo, closeMongo, getDb } from './db/mongo';
import { generateAIInsight } from './lib/ai';
import jobsRouter from './routes/jobs';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import aiRouter from './routes/ai';

async function bootstrap() {
  console.log('Connecting to MongoDB...');
  await connectMongo();
  console.log('Connected to MongoDB.');

  // Check AI Connection
  if (process.env.GEMINI_API_KEY) {
    console.log('🤖 AI Insight: Connected (Google Gemini)');
  } else {
    console.warn('⚠️ AI Insight: GEMINI_API_KEY not found in .env');
  }

  const app = express();
  const httpServer = createServer(app);
  
  // CORS Middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, x-user-id');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });
  
  app.use(express.json());

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'uberes-api' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/jobs', jobsRouter);
  app.use('/api/ai', aiRouter);

  // Real-time Chat Logic
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', (jobId) => {
      socket.join(jobId);
      console.log(`User ${socket.id} joined room: ${jobId}`);
    });

    socket.on('send_message', async (data) => {
      const { jobId, senderId, text } = data;
      const db = getDb();
      
      const message = {
        jobId,
        senderId,
        text,
        createdAt: new Date()
      };

      try {
        // Simpan ke MongoDB
        await db.collection('messages').insertOne(message);
        // Emit ke semua orang di room tersebut
        io.to(jobId).emit('receive_message', message);
      } catch (err) {
        console.error('Failed to save message:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  httpServer.listen(env.apiPort, () => {
    console.log(`UBeres API with WebSockets running on http://localhost:${env.apiPort}`);
  });

  const shutdown = async () => {
    httpServer.close();
    await closeMongo();
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((error) => {
  console.error('Failed to start API:', error);
  process.exit(1);
});
