import { MongoClient } from 'mongodb';

// Hardcode URI for quick script or load from dotenv
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('uberes');
    
    const result = await db.collection('jobs').deleteMany({
      category: { $in: ['IT', 'Tugas'] }
    });
    
    console.log(`Berhasil menghapus ${result.deletedCount} tugas dengan kategori tidak valid.`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

run();
