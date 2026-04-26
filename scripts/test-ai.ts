import 'dotenv/config';
import { connectMongo, getDb, closeMongo } from '../server/src/db/mongo';
import { generateAIInsight } from '../server/src/lib/ai';
import { ObjectId } from 'mongodb';

async function testAI() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectMongo();
    const db = getDb();

    console.log('🔍 Fetching latest job...');
    const job = await db.collection('jobs').findOne({}, { sort: { createdAt: -1 } });

    // DEBUG: List available models
    try {
      console.log('🧪 Debugging: Listing available models for your API Key...');
      const models = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`).then(res => res.json());
      console.log('📋 Available Models:', JSON.stringify(models.models?.slice(0, 50).map((m: any) => m.name)));
    } catch (e) {
      console.warn('Could not list models');
    }

    if (!job) {
      console.error('❌ No jobs found in database. Please create at least one job first.');
      await closeMongo();
      return;
    }

    console.log(`📝 Testing AI for Job: "${job.title}"`);
    console.log(`📄 Description: ${job.description.substring(0, 50)}...`);

    const insight = await generateAIInsight(job.title, job.description, job.budget, job.deadline);

    if (insight) {
      console.log(`✨ AI Insight Generated: ${insight}`);
      
      await db.collection('jobs').updateOne(
        { _id: job._id },
        { $set: { aiInsight: insight } }
      );
      
      console.log('✅ Database updated successfully!');
    } else {
      console.error('❌ Failed to generate insight. Check logs above.');
    }

    await closeMongo();
    console.log('👋 Done.');
  } catch (error) {
    console.error('❌ Error during test:', error);
    process.exit(1);
  }
}

testAI();
