import 'dotenv/config';
import { Db, MongoClient } from 'mongodb';

type CollectionName = 'users' | 'jobs' | 'bids' | 'messages';

const REQUIRED_COLLECTIONS: CollectionName[] = ['users', 'jobs', 'bids', 'messages'];

function getEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

async function ensureCollections(db: Db) {
  const existing = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name));

  for (const name of REQUIRED_COLLECTIONS) {
    if (!existing.has(name)) {
      await db.createCollection(name);
      console.log(`Created collection: ${name}`);
    } else {
      console.log(`Collection exists: ${name}`);
    }
  }
}

async function ensureIndexes(db: Db) {
  await db.collection('users').createIndex({ uid: 1 }, { unique: true, name: 'uniq_uid' });
  await db.collection('users').createIndex(
    { email: 1 },
    { unique: true, sparse: true, name: 'uniq_email' }
  );

  await db.collection('jobs').createIndex(
    { legacyJobId: 1 },
    { unique: true, sparse: true, name: 'uniq_legacy_job_id' }
  );
  await db.collection('jobs').createIndex(
    { status: 1, createdAt: -1 },
    { name: 'idx_jobs_status_createdAt' }
  );
  await db.collection('jobs').createIndex(
    { clientId: 1, createdAt: -1 },
    { name: 'idx_jobs_client_createdAt' }
  );
  await db.collection('jobs').createIndex(
    { workerId: 1, updatedAt: -1 },
    { name: 'idx_jobs_worker_updatedAt' }
  );

  await db.collection('bids').createIndex(
    { jobId: 1, createdAt: 1 },
    { name: 'idx_bids_job_createdAt' }
  );
  await db.collection('bids').createIndex(
    { jobId: 1, workerId: 1 },
    { unique: true, name: 'uniq_bid_per_worker_per_job' }
  );

  await db.collection('messages').createIndex(
    { jobId: 1, createdAt: 1 },
    { name: 'idx_messages_job_createdAt' }
  );

  console.log('All indexes ensured.');
}

async function main() {
  const mongoUri = getEnv('MONGODB_URI');
  const dbName = getEnv('MONGODB_DB_NAME', 'uberes');

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db(dbName);

    console.log(`Connected to MongoDB. Target DB: ${dbName}`);
    await ensureCollections(db);
    await ensureIndexes(db);

    console.log('MongoDB setup completed successfully.');
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error('MongoDB setup failed:', error.message);
  process.exitCode = 1;
});
