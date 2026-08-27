import 'dotenv/config';
import { storage } from './store/storage.js';

async function completeReset() {
  try {
    console.log('Starting complete database reset...');
    await storage.init();
    
    // Drop and recreate tables
    console.log('Dropping tables...');
    await storage.pool.query('DROP TABLE IF EXISTS reservations CASCADE');
    await storage.pool.query('DROP TABLE IF EXISTS flats CASCADE');
    await storage.pool.query('DROP TABLE IF EXISTS admins CASCADE');
    
    console.log('Recreating tables...');
    await storage.migrate();
    
    console.log('Seeding data...');
    await storage.seedFlats();
    await storage.seedAdmin();
    
    console.log('Complete reset successful!');
    process.exit(0);
  } catch (error) {
    console.error('Complete reset failed:', error.message);
    process.exit(1);
  }
}

completeReset();