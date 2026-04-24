import { ObjectId } from 'mongodb';
import { connectMongo } from '../server/src/db/mongo';

async function migrate() {
  try {
    const db = await connectMongo();
    const bidsCollection = db.collection('bids');
    const jobsCollection = db.collection('jobs');

    const bids = await bidsCollection.find({}).toArray();
    console.log(`Found ${bids.length} bids to check...`);

    for (const bid of bids) {
      const updates: any = {};
      
      if (!bid.status) {
        updates.status = 'pending';
      }

      if (!bid.jobTitle || !bid.clientName) {
        const job = await jobsCollection.findOne({ _id: new ObjectId(bid.jobId) });
        if (job) {
          updates.jobTitle = job.title;
          updates.clientName = job.clientName || 'User UBeres';
        }
      }

      if (Object.keys(updates).length > 0) {
        await bidsCollection.updateOne({ _id: bid._id }, { $set: updates });
        console.log(`Updated bid ${bid._id}:`, updates);
      }
    }

    console.log("Migration complete!");

  } catch (e: any) {
    console.error(e.message);
  } finally {
    process.exit();
  }
}

migrate();
