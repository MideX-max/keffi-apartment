import 'dotenv/config';
import { storage } from './store/storage.js';

async function resetDatabase() {
  try {
    console.log('Starting database reset...');
    await storage.init();
    const result = await storage.resetAllData();
    console.log('Database reset successful:', result);
    await storage.close();
    process.exit(0);
  } catch (error) {
    console.error('Database reset failed:', error.message);
    process.exit(1);
  }
}

resetDatabase();
