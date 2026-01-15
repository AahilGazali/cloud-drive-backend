# 🚀 Quick Fix: Email Not Working

## The Problem
Gmail is rejecting your App Password. You need to generate a **NEW** one.

## ✅ 3-Step Fix (Takes 2 minutes)

### Step 1: Get New App Password

1. **Open this link:** https://myaccount.google.com/apppasswords
2. **Delete** the old "Cloud Drive" App Password (if it exists)
3. **Generate new one:**
   - Select **"Mail"**
   - Select **"Other (Custom name)"**
   - Type: **"Cloud Drive"**
   - Click **"Generate"**
4. **Copy the password** (looks like: `abcd efgh ijkl mnop`)
   - **Remove all spaces** → should be 16 characters

### Step 2: Update Password

**Option A: Use the update script (Easiest)**
```bash
cd Backend
node scripts/update-app-password.js YOUR_16_CHAR_PASSWORD
```

**Example:**
```bash
node scripts/update-app-password.js abcdefghijklmnop
```

**Option B: Manual update**
1. Open `Backend/.env`
2. Find `SMTP_PASS=...`
3. Replace with: `SMTP_PASS=your16charpassword` (no spaces, no quotes)
4. Save file

### Step 3: Test

```bash
npm run test-email
```

You should see: ✅ `SMTP Authentication Successful!`

---

## 🎉 Done!

Restart your backend server:
```bash
npm run dev
```

Then try sharing a file - emails should work now!

---

## ❓ Still Not Working?

1. **Make sure 2-Step Verification is ON:**
   - Go to: https://myaccount.google.com/security
   - Check "2-Step Verification" is enabled

2. **Wait 5 minutes** after enabling 2-Step Verification before generating App Password

3. **Try a different Gmail account** for testing

4. **Use Outlook instead** (often easier):
   - Go to: https://account.microsoft.com/security
   - Create App Password
   - Update `.env`:
   ```env
   SMTP_HOST=smtp-mail.outlook.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@outlook.com
   SMTP_PASS=your-outlook-app-password
   FROM_EMAIL=your-email@outlook.com
   ```
