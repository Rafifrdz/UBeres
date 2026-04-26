import 'dotenv/config';
import { connectMongo, getDb, closeMongo } from '../server/src/db/mongo';
import { generateAIInsight } from '../server/src/lib/ai';

async function updateAll() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectMongo();
    const db = getDb();

    console.log('🔍 Fetching all jobs...');
    const jobs = await db.collection('jobs').find({}).toArray();

    console.log(`📝 Found ${jobs.length} jobs. Starting AI generation...`);

    for (const job of jobs) {
      // Lewati jika sudah ada insight (biar hemat kuota)
      if (job.aiInsight && job.aiInsight.length > 20) {
        console.log(`⏩ Skipping "${job.title}" (Already has insight)`);
        continue;
      }

      console.log(`🤖 Processing: "${job.title}"...`);
      const insight = await generateAIInsight(job.title, job.description, job.budget, job.deadline);

      if (insight) {
        await db.collection('jobs').updateOne(
          { _id: job._id },
          { $set: { aiInsight: insight } }
        );
        console.log(`✅ Updated: ${insight}`);
        // Tunggu 2 detik antar request biar nggak kena rate limit lagi
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    await closeMongo();
    console.log('👋 All jobs updated!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateAll();
