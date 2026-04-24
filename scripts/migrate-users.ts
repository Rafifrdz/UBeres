import { connectMongo } from '../server/src/db/mongo';

async function migrate() {
  try {
    const db = await connectMongo();
    const usersCollection = db.collection('users');

    const result = await usersCollection.updateMany(
      { balance: { $exists: false } },
      { 
        $set: { 
          balance: 0, 
          escrow: 0,
          bio: "",
          skills: [],
          portfolio: [],
          transactions: []
        } 
      }
    );

    console.log(`Updated ${result.modifiedCount} users with initial wallet and profile fields.`);

  } catch (e: any) {
    console.error(e.message);
  } finally {
    process.exit();
  }
}

migrate();
