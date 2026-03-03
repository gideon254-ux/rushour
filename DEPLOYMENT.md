# rushour - Cloudflare Deployment Guide

## Current Status
- Frontend: ✅ Building successfully on Cloudflare Pages
- Worker API: ⚠️ Needs D1 database setup

---

## What You Need to Do:

### Step 1: Create D1 Database
1. Go to Cloudflare Dashboard → **D1**
2. Click **"Create Database"**
3. Name: `rushour-db`
4. Click **Create**

### Step 2: Get Database ID
1. In D1, click on your new database
2. Copy the **Database ID** (something like `abc12345-6789-...`)
3. Paste it in `wrangler.toml` replacing `REPLACE_WITH_YOUR_D1_DATABASE_ID`

### Step 3: Run Database Schema
In Cloudflare Dashboard → D1 → your database → **Console**, run:
```sql
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'book',
  image_url TEXT,
  r2_key TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  product_id TEXT,
  payment_method TEXT,
  paypal_order_id TEXT,
  amount_paid REAL,
  status TEXT DEFAULT 'pending',
  download_token TEXT,
  token_expiry DATETIME,
  downloads_count INTEGER DEFAULT 0,
  mpesa_code TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Step 4: Update R2 Account ID
1. Go to Cloudflare Dashboard → **R2**
2. Copy your **Account ID**
3. Paste in `wrangler.toml` replacing `REPLACE_WITH_YOUR_R2_ACCOUNT_ID`

### Step 5: Re-deploy
```bash
git add .
git commit -m "Add D1 database ID"
git push
```

---

## Environment Variables for Frontend

In Cloudflare Pages settings, add:
```
VITE_API_URL=https://rushour.your-subdomain.workers.dev
VITE_R2_ACCOUNT_ID=your-r2-account-id
VITE_R2_ACCESS_KEY_ID=your-r2-access-key
VITE_R2_SECRET_ACCESS_KEY=your-r2-secret-key
VITE_R2_BUCKET_NAME=rushour-files
```

---

## Quick Fix for Now

Since Worker needs D1, you can also **deploy just the frontend first** without the Worker:

1. Go to Cloudflare Pages → Your project
2. Go to **Settings** → **Build & deployments**
3. Remove the `npx wrangler deploy` from the deploy command
4. Just keep: `npm run build`

This will deploy the frontend only. The API calls won't work until you set up D1.
