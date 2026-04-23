import express from 'express';
import { env } from './config/env';
import { connectMongo, closeMongo } from './db/mongo';
import jobsRouter from './routes/jobs';

async function bootstrap() {
  await connectMongo();

  const app = express();
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, x-user-id');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'uberes-api' });
  });

  app.use('/api/jobs', jobsRouter);

  const server = app.listen(env.apiPort, () => {
    console.log(`UBeres API running on http://localhost:${env.apiPort}`);
  });

  const shutdown = async () => {
    server.close();
    await closeMongo();
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((error) => {
  console.error('Failed to start API:', error);
  process.exit(1);
});
