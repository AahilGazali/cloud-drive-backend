/**
 * Test Email Configuration
 * This script tests your SMTP settings without sending an email
 */

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config({ path: './.env' });

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true' || SMTP_PORT === 465;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;

console.log('🧪 Testing Email Configuration...\n');

// Check if all required variables are set
if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.error('❌ Missing required environment variables:');
  if (!SMTP_HOST) console.error('   - SMTP_HOST');
  if (!SMTP_USER) console.error('   - SMTP_USER');
  if (!SMTP_PASS) console.error('   - SMTP_PASS');
  console.error('\nPlease set these in Backend/.env file');
  process.exit(1);
}

// Display configuration (mask password)
const maskedPass = SMTP_PASS.length > 4 
  ? SMTP_PASS.substring(0, 2) + '***' + SMTP_PASS.substring(SMTP_PASS.length - 2)
  : '***';

console.log('📧 Configuration:');
console.log(`   Host: ${SMTP_HOST}`);
console.log(`   Port: ${SMTP_PORT} (secure: ${SMTP_SECURE})`);
console.log(`   User: ${SMTP_USER}`);
console.log(`   Pass: ${maskedPass} (length: ${SMTP_PASS.length})`);
console.log(`   From: ${FROM_EMAIL}\n`);

// Check for common Gmail issues
if (SMTP_HOST === 'smtp.gmail.com') {
  console.log('📋 Gmail-specific checks:');
  
  if (SMTP_PASS.length !== 16) {
    console.warn(`   ⚠️  App Password should be 16 characters, but yours is ${SMTP_PASS.length}`);
  } else {
    console.log('   ✅ Password length is correct (16 characters)');
  }
  
  if (SMTP_PASS.includes(' ')) {
    console.error('   ❌ Password contains spaces - remove them!');
  } else {
    console.log('   ✅ Password has no spaces');
  }
  
  if (SMTP_PASS.startsWith('"') || SMTP_PASS.startsWith("'")) {
    console.error('   ❌ Password has quotes - remove them from .env file!');
  } else {
    console.log('   ✅ Password has no quotes');
  }
  
  // Check if password contains only alphanumeric characters
  if (!/^[a-zA-Z0-9]+$/.test(SMTP_PASS)) {
    console.warn('   ⚠️  Password contains special characters (this is unusual for Gmail App Passwords)');
  } else {
    console.log('   ✅ Password format looks correct');
  }
  
  console.log('');
}

// Create transporter
console.log('🔌 Connecting to SMTP server...\n');

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Test connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Authentication Failed!\n');
    console.error('Error details:');
    console.error(`   Code: ${error.code || 'N/A'}`);
    console.error(`   Message: ${error.message}\n`);
    
    if (error.code === 'EAUTH') {
      console.error('🔧 Troubleshooting Steps:\n');
      
      if (SMTP_HOST === 'smtp.gmail.com') {
        console.error('For Gmail, you MUST use an App Password:\n');
        console.error('1. Go to: https://myaccount.google.com/apppasswords');
        console.error('2. Make sure 2-Step Verification is enabled');
        console.error('3. Generate a NEW App Password for "Mail"');
        console.error('4. Copy the 16-character password (remove spaces)');
        console.error('5. Update SMTP_PASS in Backend/.env');
        console.error('6. Restart your backend server\n');
        console.error('See FIX_GMAIL_AUTH_ERROR.md for detailed instructions.\n');
      } else {
        console.error('1. Verify your SMTP_USER and SMTP_PASS are correct');
        console.error('2. Check if your email provider requires App Passwords');
        console.error('3. Make sure your account allows SMTP access\n');
      }
    } else if (error.code === 'ECONNECTION') {
      console.error('🔧 Connection Issue:\n');
      console.error(`Cannot connect to ${SMTP_HOST}:${SMTP_PORT}`);
      console.error('1. Check your internet connection');
      console.error('2. Verify SMTP_HOST and SMTP_PORT are correct');
      console.error('3. Check if your firewall is blocking the connection\n');
    } else {
      console.error('See the error message above for details.\n');
    }
    
    process.exit(1);
  } else {
    console.log('✅ SMTP Authentication Successful!\n');
    console.log('Your email configuration is working correctly.');
    console.log('You can now send emails from your application.\n');
    process.exit(0);
  }
});
