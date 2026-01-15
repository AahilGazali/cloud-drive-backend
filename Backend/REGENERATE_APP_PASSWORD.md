# 🔄 Regenerate Gmail App Password (Step-by-Step)

If your Gmail App Password is not working, follow these steps to generate a fresh one:

## Step 1: Delete Old App Password (Optional but Recommended)

1. Go to: https://myaccount.google.com/apppasswords
2. Find the App Password you created for "Cloud Drive" (or "Mail")
3. Click the **trash/delete icon** next to it
4. Confirm deletion

## Step 2: Verify 2-Step Verification is ON

1. Go to: https://myaccount.google.com/security
2. Scroll to **"How you sign in to Google"**
3. Check **"2-Step Verification"** status
4. If it says **"Off"**:
   - Click on it
   - Follow the setup wizard
   - You'll need your phone to verify
5. **Wait 5-10 minutes** after enabling (Google needs time to activate App Passwords)

## Step 3: Generate New App Password

1. Go to: https://myaccount.google.com/apppasswords
   - **Direct link:** https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → 2-Step Verification → App passwords

2. If you see **"App passwords aren't available for your account"**:
   - ⚠️ This means 2-Step Verification is not enabled or not fully activated
   - Go back to Step 2 and wait a few more minutes
   - Try refreshing the page

3. Select options:
   - **Select app:** Choose **"Mail"**
   - **Select device:** Choose **"Other (Custom name)"**
   - **Type name:** Enter **"Cloud Drive"** (or any name you prefer)
   - Click **"Generate"**

4. **Copy the password immediately:**
   - You'll see a 16-character password like: `abcd efgh ijkl mnop`
   - **Important:** You can only see this once!
   - Copy it to your clipboard

## Step 4: Format the Password Correctly

The App Password will look like this:
```
abcd efgh ijkl mnop
```

**You MUST remove all spaces:**
```
abcdefghijklmnop
```

## Step 5: Update Backend/.env

1. Open `Backend/.env` in a text editor
2. Find the line: `SMTP_PASS=...`
3. **Replace it** with:
   ```env
   SMTP_PASS=abcdefghijklmnop
   ```
   (Use your actual 16-character password, no spaces, no quotes)

4. **Double-check:**
   - ✅ No spaces in the password
   - ✅ No quotes around the password
   - ✅ Exactly 16 characters
   - ✅ `SMTP_USER` is your full Gmail address (e.g., `aahil6@gmail.com`)

5. **Save the file**

## Step 6: Test the Configuration

Run the test script:

```bash
cd Backend
npm run test-email
```

You should see:
- ✅ `SMTP Authentication Successful!` = Working!
- ❌ `SMTP Authentication Failed!` = Still wrong credentials

## Step 7: Restart Backend Server

1. **Stop** the server (Ctrl+C)
2. **Start** it again:
   ```bash
   npm run dev
   ```

## Step 8: Test Email Sending

1. Go to your frontend
2. Share a file
3. Add an email address
4. Click "Done"
5. Check backend console for: ✅ `Email sent successfully`

---

## 🔍 Still Not Working?

### Try Port 465 (SSL)

Sometimes port 587 has issues. Try SSL:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Cloud Drive
```

Then run `npm run test-email` again.

### Common Issues

1. **"App passwords aren't available"**
   - 2-Step Verification not enabled
   - Wait 5-10 minutes after enabling
   - Try refreshing the page

2. **Password still rejected**
   - Make sure you copied the password correctly
   - Check for hidden characters (copy to Notepad first, then copy from there)
   - Try generating a completely new App Password

3. **"Invalid login" error persists**
   - Verify `SMTP_USER` is your full email (with @gmail.com)
   - Make sure there are no extra spaces in `.env` file
   - Try using a different Gmail account for testing

### Alternative: Use Outlook

If Gmail continues to fail, Outlook is often easier:

1. Go to: https://account.microsoft.com/security
2. Create App Password
3. Update `.env`:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-outlook-app-password
FROM_EMAIL=your-email@outlook.com
FROM_NAME=Cloud Drive
```

---

## ✅ Success Checklist

- [ ] 2-Step Verification is **ON** in Google Account
- [ ] Generated a **NEW** App Password
- [ ] Copied password **without spaces** (16 characters)
- [ ] Updated `SMTP_PASS` in `Backend/.env` (no quotes, no spaces)
- [ ] `SMTP_USER` is full Gmail address
- [ ] Ran `npm run test-email` and got ✅ success
- [ ] Restarted backend server
- [ ] Tested sharing a file

If all checked, emails should work! 🎉
