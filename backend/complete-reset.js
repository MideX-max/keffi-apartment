import 'dotenv/config';
import { storage } from './store/storage.js';

async function completeReset() {
  try {
    console.log('Starting complete database reset...');
    await storage.init();

    // Drop and recreate collections
    console.log('Dropping collections...');
    await storage.dropAllTables();

    console.log('Recreating indexes...');
    await storage.migrate();

    console.log('Seeding data...');
    await storage.seedFlats();
    await storage.seedAdmin();

    console.log('Complete reset successful!');
    await storage.close();
    process.exit(0);
  } catch (error) {
    console.error('Complete reset failed:', error.message);
    process.exit(1);
  }
}

completeReset();
