import { connectMongo } from '../server/src/db/mongo';
import { ObjectId } from 'mongodb';

async function check(id: string) {
  try {
    const db = await connectMongo();
    let job;
    if (id === 'latest') {
        job = await db.collection('jobs').find().sort({ createdAt: -1 }).limit(1).toArray();
        job = job[0];
    } else {
        job = await db.collection('jobs').findOne({ _id: new ObjectId(id) });
    }
    console.log("Job Data:", JSON.stringify(job, null, 2));
  } catch (e: any) {
    console.error(e.message);
  } finally {
    process.exit();
  }
}

const id = process.argv[2];
check(id);
