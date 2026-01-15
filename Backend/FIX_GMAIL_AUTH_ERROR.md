# 🔧 Fix Gmail Authentication Error

## The Error
```
535-5.7.8 Username and Password not accepted
Email authentication failed
```

## ✅ Step-by-Step Fix

### Step 1: Verify 2-Step Verification is Enabled

1. Go to: https://myaccount.google.com/security
2. Scroll to **"How you sign in to Google"**
3. Check if **"2-Step Verification"** shows **"On"**
4. If it says **"Off"**, click it and **enable it first** (this is required for App Passwords)

### Step 2: Generate a NEW App Password

1. Go to: https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → 2-Step Verification → App passwords
2. If you see "App passwords aren't available for your account":
   - Make sure 2-Step Verification is enabled (Step 1)
   - Wait a few minutes after enabling 2-Step Verification
3. Select:
   - **App:** Mail
   - **Device:** Other (Custom name)
   - **Name:** Type "Cloud Drive"
   - Click **Generate**
4. **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)
   - **Important:** Copy it immediately - you can't see it again!
   - **Remove all spaces** when using it (should be 16 characters with no spaces)

### Step 3: Update Backend/.env

Open `Backend/.env` and make sure you have:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Cloud Drive
```

**Critical Checks:**
- ✅ `SMTP_USER` = Your **full Gmail address** (e.g., `john@gmail.com`)
- ✅ `SMTP_PASS` = The **16-character App Password** (no spaces, no quotes)
- ✅ `SMTP_PASS` does NOT have quotes around it
- ✅ `SMTP_PASS` does NOT have spaces
- ✅ You're using the **App Password**, NOT your regular Gmail password

### Step 4: Common Mistakes to Avoid

❌ **Wrong:**
```env
SMTP_PASS="abcd efgh ijkl mnop"  # Has quotes and spaces
SMTP_PASS=MyRegularPassword123    # Using regular password
SMTP_PASS=abcd efgh ijkl mnop     # Has spaces
```

✅ **Correct:**
```env
SMTP_PASS=abcdefghijklmnop        # 16 characters, no spaces, no quotes
```

### Step 5: Restart Backend Server

1. **Stop** the server (Ctrl+C)
2. **Start** it again:
   ```bash
   cd Backend
   npm run dev
   ```

### Step 6: Test Again

1. Share a file from the frontend
2. Check backend console for:
   - ✅ `Email sent successfully` = Working!
   - ❌ `Email authentication failed` = Still wrong credentials

---

## 🔍 Still Not Working?

### Option A: Try Port 465 (SSL)

If port 587 doesn't work, try SSL:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Cloud Drive
```

### Option B: Verify App Password Format

The App Password should be:
- Exactly 16 characters
- No spaces
- No special characters (just letters and numbers)
- Example: `abcd1234efgh5678`

### Option C: Generate a New App Password

Sometimes App Passwords can be corrupted. Try:
1. Delete the old App Password (in Google Account → App passwords)
2. Generate a brand new one
3. Update `.env` with the new password
4. Restart server

### Option D: Use a Different Email Service

If Gmail continues to fail, try:

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@outlook.com
FROM_NAME=Cloud Drive
```

**SendGrid (Free tier - 100 emails/day):**
1. Sign up at https://sendgrid.com
2. Create API key
3. Use:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
FROM_EMAIL=your-verified-email@domain.com
FROM_NAME=Cloud Drive
```

---

## 🧪 Debug Checklist

Before asking for help, verify:

- [ ] 2-Step Verification is **enabled** in Google Account
- [ ] App Password was generated **after** enabling 2-Step Verification
- [ ] App Password is exactly **16 characters** (no spaces)
- [ ] `SMTP_USER` is your **full Gmail address** (with @gmail.com)
- [ ] `SMTP_PASS` has **no quotes** around it in `.env`
- [ ] `SMTP_PASS` has **no spaces**
- [ ] You're using **App Password**, not regular password
- [ ] Backend server was **restarted** after updating `.env`
- [ ] No typos in `.env` file

---

## 📝 Quick Test

To verify your credentials are correct, you can test with this command (after setting up `.env`):

```bash
cd Backend
node -e "
import('nodemailer').then(nm => {
  const transporter = nm.default.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  transporter.verify((err, success) => {
    if (err) console.error('❌ Error:', err.message);
    else console.log('✅ SMTP credentials are valid!');
  });
});
"
```

---

## 💡 Pro Tip

If you're still having issues, try using **Outlook** instead - it's often easier to set up:
1. Go to https://account.microsoft.com/security
2. Create App Password
3. Use Outlook SMTP settings (see Option D above)
