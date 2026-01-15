/**
 * Try SSL Port (465) for Gmail
 * Sometimes port 587 has issues, port 465 with SSL works better
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const envPath = path.join(__dirname, '../.env');

console.log('🔄 Trying SSL Port (465) for Gmail...\n');

// Read current .env
let envContent = fs.readFileSync(envPath, 'utf8');

// Update to use port 465 with SSL
envContent = envContent.replace(/SMTP_PORT=\d+/, 'SMTP_PORT=465');
envContent = envContent.replace(/SMTP_SECURE=(true|false)/, 'SMTP_SECURE=true');

// If SMTP_SECURE doesn't exist, add it
if (!envContent.includes('SMTP_SECURE=')) {
  envContent += '\nSMTP_SECURE=true';
}

// Write back
fs.writeFileSync(envPath, envContent, 'utf8');

console.log('✅ Updated .env to use:');
console.log('   SMTP_PORT=465');
console.log('   SMTP_SECURE=true\n');

// Reload env
dotenv.config({ path: path.join(__dirname, '../.env') });

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = 465;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

console.log('🧪 Testing with SSL (port 465)...\n');

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Still failing with port 465\n');
    console.error('The App Password itself is incorrect or expired.\n');
    console.error('🔧 You MUST generate a NEW App Password:\n');
    console.error('1. Go to: https://myaccount.google.com/apppasswords');
    console.error('2. Delete the old "Cloud Drive" App Password');
    console.error('3. Generate a NEW one for "Mail"');
    console.error('4. Copy the 16-character password (remove spaces)');
    console.error('5. Update SMTP_PASS in Backend/.env');
    console.error('6. Run: npm run test-email\n');
    process.exit(1);
  } else {
    console.log('✅ SUCCESS! Port 465 (SSL) works!\n');
    console.log('Your email configuration is now working.');
    console.log('You can now send emails from your application.\n');
    process.exit(0);
  }
});
