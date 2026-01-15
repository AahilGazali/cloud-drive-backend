/**
 * Email Configuration Fixer
 * Helps identify and fix email configuration issues
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const envPath = path.join(__dirname, '../.env');

console.log('🔧 Email Configuration Fixer\n');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found at:', envPath);
  console.error('   Please create a .env file in the Backend directory.');
  process.exit(1);
}

// Read current .env file
let envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

console.log('📋 Current Configuration Issues:\n');

let issues = [];
let needsUpdate = false;

// Check SMTP_USER
const smtpUserMatch = envContent.match(/SMTP_USER=(.+)/);
const smtpUser = smtpUserMatch ? smtpUserMatch[1].trim() : null;

if (!smtpUser || smtpUser === 'your-email@gmail.com') {
  issues.push('❌ SMTP_USER is not set or is a placeholder');
  console.log('   ❌ SMTP_USER should be your actual Gmail address (e.g., aahil6@gmail.com)');
} else if (!smtpUser.includes('@gmail.com')) {
  issues.push('⚠️  SMTP_USER might not be a Gmail address');
  console.log(`   ⚠️  SMTP_USER is: ${smtpUser}`);
} else {
  console.log(`   ✅ SMTP_USER is set: ${smtpUser}`);
}

// Check FROM_EMAIL
const fromEmailMatch = envContent.match(/FROM_EMAIL=(.+)/);
const fromEmail = fromEmailMatch ? fromEmailMatch[1].trim() : null;

if (!fromEmail || fromEmail === 'your-email@gmail.com') {
  issues.push('❌ FROM_EMAIL is not set or is a placeholder');
  console.log('   ❌ FROM_EMAIL should be your actual Gmail address');
  console.log('   💡 This will be fixed automatically');
  needsUpdate = true;
} else {
  console.log(`   ✅ FROM_EMAIL is set: ${fromEmail}`);
}

// Check SMTP_PASS
const smtpPassMatch = envContent.match(/SMTP_PASS=(.+)/);
const smtpPass = smtpPassMatch ? smtpPassMatch[1].trim() : null;

if (!smtpPass) {
  issues.push('❌ SMTP_PASS is not set');
  console.log('   ❌ SMTP_PASS is missing');
} else if (smtpPass.length !== 16) {
  issues.push('⚠️  SMTP_PASS length is incorrect');
  console.log(`   ⚠️  SMTP_PASS length is ${smtpPass.length}, should be 16`);
} else if (smtpPass.includes(' ')) {
  issues.push('❌ SMTP_PASS contains spaces');
  console.log('   ❌ SMTP_PASS contains spaces - remove them!');
} else {
  console.log(`   ✅ SMTP_PASS is set (length: ${smtpPass.length})`);
}

console.log('\n');

// Fix FROM_EMAIL if needed
if (needsUpdate && smtpUser && smtpUser.includes('@gmail.com')) {
  console.log('🔧 Fixing FROM_EMAIL...\n');
  
  // Replace FROM_EMAIL line
  const updatedLines = lines.map(line => {
    if (line.startsWith('FROM_EMAIL=')) {
      return `FROM_EMAIL=${smtpUser}`;
    }
    return line;
  });
  
  envContent = updatedLines.join('\n');
  fs.writeFileSync(envPath, envContent, 'utf8');
  
  console.log(`   ✅ Updated FROM_EMAIL to: ${smtpUser}\n`);
}

// Summary
console.log('📝 Summary:\n');

if (issues.length === 0 && !needsUpdate) {
  console.log('✅ All configuration looks good!');
  console.log('\nHowever, Gmail is still rejecting your credentials.');
  console.log('This usually means:\n');
  console.log('1. The App Password is incorrect or expired');
  console.log('2. 2-Step Verification is not enabled');
  console.log('3. You need to generate a NEW App Password\n');
  console.log('🔧 Next Steps:\n');
  console.log('1. Go to: https://myaccount.google.com/apppasswords');
  console.log('2. Delete the old "Cloud Drive" App Password');
  console.log('3. Generate a NEW App Password for "Mail"');
  console.log('4. Copy the 16-character password (remove spaces)');
  console.log('5. Update SMTP_PASS in Backend/.env');
  console.log('6. Run: npm run test-email\n');
} else {
  console.log('⚠️  Found configuration issues:');
  issues.forEach(issue => console.log(`   ${issue}`));
  console.log('\n');
  
  if (needsUpdate) {
    console.log('✅ Fixed FROM_EMAIL automatically');
    console.log('   Please regenerate your App Password and update SMTP_PASS\n');
  }
}

console.log('📖 For detailed instructions, see:');
console.log('   - REGENERATE_APP_PASSWORD.md');
console.log('   - FIX_GMAIL_AUTH_ERROR.md\n');
