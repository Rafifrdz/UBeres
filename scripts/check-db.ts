import { connectMongo } from '../server/src/db/mongo';

async function check() {
  try {
    const db = await connectMongo();
    const bids = await db.collection('bids').find({}).toArray();
    console.log("Total Bids in DB:", bids.length);
    if (bids.length > 0) {
      console.log("Sample Bid:", JSON.stringify(bids[0], null, 2));
    }
    
    const jobs = await db.collection('jobs').find({}).toArray();
    console.log("\nTotal Jobs in DB:", jobs.length);

  } catch (e: any) {
    console.error(e.message);
  } finally {
    process.exit();
  }
}

check();
