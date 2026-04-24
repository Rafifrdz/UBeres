import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('uberes');
    
    // Fix all users where totalRatings is 0 or missing, set rating to 0
    const result = await db.collection('users').updateMany(
      { $or: [{ totalRatings: 0 }, { totalRatings: { $exists: false } }] },
      { $set: { rating: 0, totalRatings: 0 } }
    );
    
    console.log(`Berhasil mereset rating untuk ${result.modifiedCount} user.`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

run();
