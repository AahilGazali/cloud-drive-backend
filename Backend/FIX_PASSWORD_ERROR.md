# Fix Password Authentication Error

## ❌ Current Error
```
password authentication failed for user "postgres"
```

This means your database connection is working, but the **password is incorrect**.

---

## ✅ Solution: Get and Update Your Database Password

### **Step 1: Get Your Database Password from Supabase**

1. **Go to Supabase Dashboard** → Your Project
2. **Click "Settings"** (gear icon) → **"Database"**
3. **Scroll down** to find **"Reset your database password"** section
4. **Click "Database Settings"** link (or go to: Settings → Database → Database Settings)
5. You'll see your database password there, OR you can reset it

### **Step 2: Update Your .env File**

1. **Open** `Backend/.env` file
2. **Find** the line: `SUPABASE_DB_URL=...`
3. **Look for** the password in the connection string:
   ```
   postgresql://postgres.nkpcdutkswbxrauqjsmf:[PASSWORD-HERE]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
4. **Replace** `[PASSWORD-HERE]` (or whatever placeholder is there) with your **actual database password**
5. **Save** the file

### **Step 3: Important - Password Formatting**

If your password contains special characters, you may need to **URL-encode** them:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- Space → `%20`

**Example:**
- Password: `My@Pass#123`
- URL-encoded: `My%40Pass%23123`
- Connection string: `postgresql://postgres.nkpcdutkswbxrauqjsmf:My%40Pass%23123@aws-0-[REGION].pooler.supabase.com:6543/postgres`

### **Step 4: Test the Connection**

```bash
cd Backend
npm run check-db
```

You should see: ✅ **Database connection successful!**

### **Step 5: Restart Your Backend**

```bash
npm run dev
```

You should now see: ✅ **Database connection successful** in the startup logs!

---

## 🔍 Quick Check

Your `SUPABASE_DB_URL` should look like:
```
SUPABASE_DB_URL=postgresql://postgres.nkpcdutkswbxrauqjsmf:YOUR_ACTUAL_PASSWORD@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**NOT:**
- ❌ `postgresql://postgres.nkpcdutkswbxrauqjsmf:[YOUR-PASSWORD]@...` (with brackets)
- ❌ `postgresql://postgres.nkpcdutkswbxrauqjsmf:@...` (empty password)
- ❌ `postgresql://postgres.nkpcdutkswbxrauqjsmf:password@...` (if "password" is not your actual password)

---

## 💡 Pro Tip

If you're not sure what your password is:
1. Go to Supabase Dashboard → Settings → Database → Database Settings
2. Click **"Reset database password"**
3. Set a new password (make it simple for now, like `MyPassword123`)
4. Update your `.env` file with the new password
5. Test the connection
