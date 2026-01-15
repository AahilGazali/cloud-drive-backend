# 📧 Email Setup Guide

This guide will help you configure email sending for the Cloud Drive sharing feature.

## Quick Setup Options

### Option 1: Gmail (Easiest for Testing)

1. **Enable App Password in Gmail:**
   - Go to your Google Account: https://myaccount.google.com/
   - Click **Security** → **2-Step Verification** (enable it if not already)
   - Click **App passwords** → **Select app** → **Mail** → **Select device** → **Generate**
   - Copy the 16-character password (you'll use this, not your regular Gmail password)

2. **Add to Backend/.env:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   FROM_EMAIL=your-email@gmail.com
   FROM_NAME=Cloud Drive
   ```

### Option 2: Outlook/Hotmail

1. **Enable App Password:**
   - Go to https://account.microsoft.com/security
   - Click **Advanced security options** → **App passwords**
   - Generate a new app password

2. **Add to Backend/.env:**
   ```env
   SMTP_HOST=smtp-mail.outlook.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@outlook.com
   SMTP_PASS=your-app-password
   FROM_EMAIL=your-email@outlook.com
   FROM_NAME=Cloud Drive
   ```

### Option 3: Custom SMTP Server

If you have your own email server or use a service like SendGrid, Mailgun, etc.:

```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Cloud Drive
```

## Common SMTP Settings

### Gmail
- **Host:** `smtp.gmail.com`
- **Port:** `587` (TLS) or `465` (SSL)
- **Secure:** `false` for 587, `true` for 465

### Outlook/Hotmail
- **Host:** `smtp-mail.outlook.com`
- **Port:** `587`
- **Secure:** `false`

### Yahoo Mail
- **Host:** `smtp.mail.yahoo.com`
- **Port:** `587` or `465`
- **Secure:** `false` for 587, `true` for 465

### SendGrid
- **Host:** `smtp.sendgrid.net`
- **Port:** `587`
- **Secure:** `false`
- **User:** `apikey`
- **Pass:** Your SendGrid API key

### Mailgun
- **Host:** `smtp.mailgun.org`
- **Port:** `587`
- **Secure:** `false`
- **User:** Your Mailgun SMTP username
- **Pass:** Your Mailgun SMTP password

## Environment Variables

Add these to your `Backend/.env` file:

```env
# Required
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# Optional
SMTP_SECURE=false          # true for port 465 (SSL), false for port 587 (TLS)
FROM_EMAIL=your-email@gmail.com  # Defaults to SMTP_USER if not set
FROM_NAME=Cloud Drive      # Defaults to "Cloud Drive" if not set
```

## Testing

1. **Restart your backend server** after updating `.env`:
   ```bash
   cd Backend
   npm run dev
   ```

2. **Try sharing a file** from the frontend:
   - Click "Share" on any file
   - Add an email address
   - Click "Done"
   - Check the recipient's inbox (and spam folder)

3. **Check backend logs** for email status:
   - ✅ `Email sent successfully` = Working!
   - ❌ `Failed to send email` = Check your SMTP settings

## Troubleshooting

### "Email authentication failed"
- **Gmail/Outlook:** Make sure you're using an **App Password**, not your regular password
- **Other services:** Verify your username and password are correct

### "Cannot connect to SMTP server"
- Check your `SMTP_HOST` and `SMTP_PORT` are correct
- Make sure your firewall isn't blocking the connection
- Try port `465` with `SMTP_SECURE=true` if `587` doesn't work

### "Email not configured" warning
- Make sure all required variables (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`) are set in `.env`
- Restart the server after updating `.env`

### Emails going to spam
- Use a proper `FROM_EMAIL` from your domain (not a free email service)
- Set up SPF and DKIM records for your domain
- For testing, check the spam folder

## Security Notes

- **Never commit your `.env` file** to git (it's already in `.gitignore`)
- **Use App Passwords** for Gmail/Outlook instead of your main password
- **For production**, consider using a dedicated email service (SendGrid, Mailgun, AWS SES)

## Production Recommendations

For production applications, consider:

1. **SendGrid** - Free tier: 100 emails/day
2. **Mailgun** - Free tier: 5,000 emails/month
3. **AWS SES** - Very cheap, pay per email
4. **Resend** - Modern API, good developer experience

These services provide better deliverability and don't require SMTP configuration.
