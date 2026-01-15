import { pool } from '../src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Setting up database columns...\n');
    
    // Add is_deleted to folders
    console.log('Adding is_deleted column to folders table...');
    await client.query(`
      ALTER TABLE public.folders 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL;
    `);
    console.log('✅ Added is_deleted to folders\n');
    
    // Add is_deleted to files
    console.log('Adding is_deleted column to files table...');
    await client.query(`
      ALTER TABLE public.files 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL;
    `);
    console.log('✅ Added is_deleted to files\n');
    
    // Create indexes
    console.log('Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_folders_is_deleted ON public.folders(is_deleted) WHERE is_deleted = true;
      CREATE INDEX IF NOT EXISTS idx_files_is_deleted ON public.files(is_deleted) WHERE is_deleted = true;
      CREATE INDEX IF NOT EXISTS idx_folders_user_deleted ON public.folders(user_id, is_deleted);
      CREATE INDEX IF NOT EXISTS idx_files_user_deleted ON public.files(user_id, is_deleted);
    `);
    console.log('✅ Created indexes\n');
    
    console.log('🎉 Database setup completed successfully!');
    console.log('You can now refresh your application.\n');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
}

setupDatabase();
