/**
 * Email Service for Sharing
 * Sends email notifications when files/folders are shared
 */

import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

/**
 * Create email transporter based on environment variables
 */
const createTransporter = () => {
  // Check if email is configured
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.warn('⚠️ Email not configured. SMTP_HOST, SMTP_USER, and SMTP_PASS must be set in .env file.');
    console.warn('   Emails will be logged to console instead of being sent.');
    return null;
  }

  const port = parseInt(env.SMTP_PORT || '587', 10);
  const secure = env.SMTP_SECURE || port === 465;

  // Debug: Log configuration (but hide password)
  const maskedPassword = env.SMTP_PASS ? 
    (env.SMTP_PASS.length > 4 ? 
      env.SMTP_PASS.substring(0, 2) + '***' + env.SMTP_PASS.substring(env.SMTP_PASS.length - 2) : 
      '***') : 
    'NOT SET';
  
  console.log('📧 Email Configuration:');
  console.log(`   Host: ${env.SMTP_HOST}`);
  console.log(`   Port: ${port} (secure: ${secure})`);
  console.log(`   User: ${env.SMTP_USER}`);
  console.log(`   Pass: ${maskedPassword} (length: ${env.SMTP_PASS?.length || 0})`);

  // Check for common Gmail issues
  if (env.SMTP_HOST === 'smtp.gmail.com' && env.SMTP_PASS) {
    const passLength = env.SMTP_PASS.length;
    const hasSpaces = env.SMTP_PASS.includes(' ');
    const hasQuotes = env.SMTP_PASS.startsWith('"') || env.SMTP_PASS.startsWith("'");
    
    if (passLength !== 16) {
      console.warn(`⚠️ Gmail App Password should be 16 characters, but yours is ${passLength}`);
      console.warn('   Make sure you removed all spaces from the App Password');
    }
    if (hasSpaces) {
      console.warn('⚠️ App Password contains spaces - remove them!');
    }
    if (hasQuotes) {
      console.warn('⚠️ App Password has quotes - remove them from .env file!');
    }
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: port,
    secure: secure, // true for 465, false for other ports
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    // For Gmail and other services that require TLS
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  });
};

/**
 * Send share notification email
 * @param {string} recipientEmail - Email address of the recipient
 * @param {string} senderName - Name of the person sharing
 * @param {string} itemName - Name of the file/folder being shared
 * @param {string} itemType - 'file' or 'folder'
 * @param {string} shareLink - Link to access the shared item
 * @param {string} role - Access role (Viewer, Editor, etc.)
 */
export const sendShareEmail = async (recipientEmail, senderName, itemName, itemType, shareLink, role = 'Viewer') => {
  try {
    const emailSubject = `${senderName} shared ${itemType === 'file' ? 'a file' : 'a folder'} with you: ${itemName}`;
    const htmlContent = generateEmailTemplate(senderName, itemName, itemType, shareLink, role);
    const textContent = `
Hello,

${senderName} has shared ${itemType === 'file' ? 'a file' : 'a folder'} with you.

Item: ${itemName}
Access Level: ${role}

You can access it using this link:
${shareLink}

Best regards,
${env.FROM_NAME}
    `.trim();

    const transporter = createTransporter();

    if (!transporter) {
      // Email not configured - log to console
      console.log('📧 Email would be sent (SMTP not configured):');
      console.log('To:', recipientEmail);
      console.log('Subject:', emailSubject);
      console.log('Text Body:', textContent);
      console.log('\n⚠️ To enable email sending, configure SMTP settings in Backend/.env file');
      console.log('   See EMAIL_SETUP.md for instructions\n');
      return { success: true, message: 'Email logged (SMTP not configured)' };
    }

    // Send the email
    const mailOptions = {
      from: `"${env.FROM_NAME}" <${env.FROM_EMAIL}>`,
      to: recipientEmail,
      subject: emailSubject,
      text: textContent,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', {
      to: recipientEmail,
      messageId: info.messageId,
    });

    return { success: true, message: 'Email sent successfully', messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send share email:', error);
    
    // Provide helpful error messages
    if (error.code === 'EAUTH') {
      let errorMsg = 'Email authentication failed. ';
      
      if (env.SMTP_HOST === 'smtp.gmail.com') {
        errorMsg += '\n\nFor Gmail, you MUST use an App Password, not your regular password.\n';
        errorMsg += 'Steps:\n';
        errorMsg += '1. Go to: https://myaccount.google.com/apppasswords\n';
        errorMsg += '2. Generate a new App Password for "Mail"\n';
        errorMsg += '3. Copy the 16-character password (remove spaces)\n';
        errorMsg += '4. Update SMTP_PASS in Backend/.env\n';
        errorMsg += '5. Make sure 2-Step Verification is enabled\n';
        errorMsg += '\nSee FIX_GMAIL_AUTH_ERROR.md for detailed instructions.';
      } else {
        errorMsg += 'Please check your SMTP_USER and SMTP_PASS in .env file.';
      }
      
      throw new Error(errorMsg);
    } else if (error.code === 'ECONNECTION') {
      throw new Error(`Cannot connect to SMTP server (${env.SMTP_HOST}:${env.SMTP_PORT}). Please check your SMTP_HOST and SMTP_PORT.`);
    } else if (error.message) {
      throw new Error(`Failed to send email: ${error.message}`);
    } else {
      throw new Error('Failed to send email notification');
    }
  }
};

/**
 * Generate HTML email template
 */
const generateEmailTemplate = (senderName, itemName, itemType, shareLink, role) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4285f4; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .button { display: inline-block; padding: 12px 24px; background: #4285f4; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>File Shared with You</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p><strong>${senderName}</strong> has shared ${itemType === 'file' ? 'a file' : 'a folder'} with you.</p>
          <p><strong>Item:</strong> ${itemName}</p>
          <p><strong>Access Level:</strong> ${role}</p>
          <a href="${shareLink}" class="button">Open ${itemType === 'file' ? 'File' : 'Folder'}</a>
        </div>
        <div class="footer">
          <p>This email was sent from Cloud Drive</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
