/**
 * Update App Password in .env file
 * Usage: node scripts/update-app-password.js YOUR_NEW_16_CHAR_PASSWORD
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env');

// Get password from command line
const newPassword = process.argv[2];

if (!newPassword) {
  console.error('❌ Please provide the new App Password');
  console.error('\nUsage:');
  console.error('   node scripts/update-app-password.js YOUR_16_CHAR_PASSWORD');
  console.error('\nExample:');
  console.error('   node scripts/update-app-password.js abcdefghijklmnop\n');
  process.exit(1);
}

// Validate password
const cleanPassword = newPassword.trim().replace(/\s/g, ''); // Remove all spaces

if (cleanPassword.length !== 16) {
  console.error(`❌ Password must be exactly 16 characters (you provided ${cleanPassword.length})`);
  console.error('   Make sure you removed all spaces from the App Password\n');
  process.exit(1);
}

// Read .env file
let envContent = fs.readFileSync(envPath, 'utf8');

// Update SMTP_PASS
if (envContent.includes('SMTP_PASS=')) {
  envContent = envContent.replace(/SMTP_PASS=.*/, `SMTP_PASS=${cleanPassword}`);
} else {
  envContent += `\nSMTP_PASS=${cleanPassword}`;
}

// Write back
fs.writeFileSync(envPath, envContent, 'utf8');

console.log('✅ Updated SMTP_PASS in .env file');
console.log(`   Password length: ${cleanPassword.length} characters\n`);
console.log('🧪 Testing configuration...\n');

// Test the configuration
import('nodemailer').then(nodemailer => {
  const transporter = nodemailer.default.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER || 'aahil6@gmail.com',
      pass: cleanPassword,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Authentication still failing');
      console.error(`   Error: ${error.message}\n`);
      console.error('The password might still be incorrect.');
      console.error('Please verify:');
      console.error('1. You copied the App Password correctly');
      console.error('2. You removed all spaces');
      console.error('3. 2-Step Verification is enabled');
      console.error('4. The App Password was generated for "Mail"\n');
      process.exit(1);
    } else {
      console.log('✅ SUCCESS! Email configuration is working!\n');
      console.log('You can now send emails from your application.');
      console.log('Restart your backend server and try sharing a file.\n');
      process.exit(0);
    }
  });
});
