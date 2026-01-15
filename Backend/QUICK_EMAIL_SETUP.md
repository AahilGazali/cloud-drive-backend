# 🚀 Quick Email Setup (5 minutes)

## For Gmail (Easiest)

### Step 1: Get Gmail App Password

1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already enabled)
3. Go to **App passwords** → Select **Mail** → Select **Other (Custom name)** → Type "Cloud Drive" → **Generate**
4. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

### Step 2: Add to Backend/.env

Open `Backend/.env` and add these lines:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Cloud Drive
```

**Important:** 
- Replace `your-email@gmail.com` with your actual Gmail address
- Replace `your-16-char-app-password` with the app password you just generated (remove spaces)
- Use the **App Password**, NOT your regular Gmail password

### Step 3: Restart Backend

```bash
cd Backend
# Stop the server (Ctrl+C if running)
npm run dev
```

### Step 4: Test It!

1. Go to your frontend
2. Click "Share" on any file
3. Add your email address
4. Click "Done"
5. Check your inbox! 📧

---

## For Outlook/Hotmail

1. Go to: https://account.microsoft.com/security
2. Click **Advanced security options** → **App passwords** → **Create a new app password**
3. Copy the password

Add to `Backend/.env`:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@outlook.com
FROM_NAME=Cloud Drive
```

---

## Troubleshooting

**"Email authentication failed"**
- Make sure you're using an **App Password**, not your regular password
- For Gmail: The app password should be 16 characters (no spaces)

**"Cannot connect to SMTP server"**
- Check `SMTP_HOST` and `SMTP_PORT` are correct
- Try port `465` with `SMTP_SECURE=true` if `587` doesn't work

**Emails not arriving?**
- Check spam folder
- Check backend console for error messages
- Make sure backend server was restarted after updating `.env`

---

For more options (Yahoo, SendGrid, custom SMTP), see `EMAIL_SETUP.md`
