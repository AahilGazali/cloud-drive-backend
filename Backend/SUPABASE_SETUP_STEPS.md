# Step-by-Step Guide: Fix Database Connection in Supabase

## 🎯 Goal
Switch from "Direct connection" (IPv4 incompatible) to "Session pooler" (IPv4 compatible) to fix the connection error.

---

## 📋 Step-by-Step Instructions

### **Step 1: Open Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Log in to your account
3. Click on your project (the one with project ref: `nkpcdutkswbxrauqjsmf`)

### **Step 2: Navigate to Database Settings**
1. In the left sidebar, click **"Settings"** (gear icon at the bottom)
2. Click **"Database"** in the settings menu
3. You should see tabs: "Connection String", "App Frameworks", etc.

### **Step 3: Switch to Session Pooler**
1. Click on the **"Connection String"** tab (if not already selected)
2. Look for the **"Method"** dropdown (it currently says "Direct connection")
3. **Click the "Method" dropdown** and select **"Session pooler"**
4. The connection string will automatically update below

### **Step 4: Copy the Session Pooler Connection String**
1. You'll see a new connection string that looks like:
   ```
   postgresql://postgres.nkpcdutkswbxrauqjsmf:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   OR
   ```
   postgresql://postgres.nkpcdutkswbxrauqjsmf:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```
2. **Click the copy button** next to the connection string (or select all and copy)

### **Step 5: Get Your Database Password**
1. Still in the Database settings page
2. Scroll down to find **"Reset your database password"** section
3. If you don't know your password:
   - Click **"Database Settings"** link
   - Or go to: Settings → Database → Database Settings
   - You can reset your password there if needed
4. **Note your password** - you'll need to replace `[YOUR-PASSWORD]` in the connection string

### **Step 6: Update Your .env File**
1. Open `Backend/.env` file in your code editor
2. Find the line that starts with `SUPABASE_DB_URL=`
3. **Replace the entire line** with the Session Pooler connection string you copied
4. **Important**: Replace `[YOUR-PASSWORD]` with your actual database password
   - Example: If your password is `MyPassword123`, replace `[YOUR-PASSWORD]` with `MyPassword123`
5. **Save the file**

### **Step 7: Test the Connection**
1. Open terminal/command prompt
2. Navigate to Backend folder:
   ```bash
   cd Backend
   ```
3. Run the connection test:
   ```bash
   npm run check-db
   ```
4. You should see: ✅ **Database connection successful!**

### **Step 8: Restart Your Backend Server**
1. If your backend is running, stop it (Ctrl+C)
2. Start it again:
   ```bash
   npm run dev
   ```
3. You should now see: ✅ **Database connection successful** in the startup logs

---

## 🔍 What Changed?

**Before (Direct - Not Working):**
```
postgresql://postgres:[PASSWORD]@db.nkpcdutkswbxrauqjsmf.supabase.co:5432/postgres
```
- Hostname: `db.nkpcdutkswbxrauqjsmf.supabase.co`
- Port: `5432`
- ❌ Not IPv4 compatible

**After (Session Pooler - Working):**
```
postgresql://postgres.nkpcdutkswbxrauqjsmf:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```
- Hostname: `aws-0-[REGION].pooler.supabase.com` (different format)
- Port: `6543` (or sometimes `5432`)
- ✅ IPv4 compatible

---

## ⚠️ Common Issues

### Issue 1: Password has special characters
If your password contains special characters like `@`, `#`, `%`, etc., you need to **URL-encode** them:
- `@` becomes `%40`
- `#` becomes `%23`
- `%` becomes `%25`
- Space becomes `%20`

### Issue 2: Still getting connection error
1. Double-check you copied the **Session pooler** connection string (not Direct)
2. Verify the password is correct
3. Make sure you saved the `.env` file
4. Restart your backend server after updating `.env`

### Issue 3: Can't find Session pooler option
- Make sure you're in: **Settings → Database → Connection String tab**
- The "Method" dropdown should be visible
- If not, try refreshing the page

---

## ✅ Success Checklist

- [ ] Changed "Method" to "Session pooler" in Supabase dashboard
- [ ] Copied the Session pooler connection string
- [ ] Replaced `[YOUR-PASSWORD]` with actual password in the connection string
- [ ] Updated `SUPABASE_DB_URL` in `Backend/.env` file
- [ ] Saved the `.env` file
- [ ] Ran `npm run check-db` and got ✅ success message
- [ ] Restarted backend server and see ✅ connection successful

---

## 🎉 Once Connected

After the database connection works:
- ✅ Sharing feature will work
- ✅ Email notifications will be sent
- ✅ All database operations will function normally
