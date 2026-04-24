import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('uberes');
    
    const workers = await db.collection('users').find({ role: 'worker' }).toArray();
    console.log(JSON.stringify(workers.map(w => ({ name: w.displayName, rating: w.rating, total: w.totalRatings })), null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

run();
