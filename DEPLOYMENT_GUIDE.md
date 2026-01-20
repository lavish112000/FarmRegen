# FarmRegen Deployment Guide

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup (Neon)](#database-setup-neon)
3. [Backend Deployment (Render)](#backend-deployment-render)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Google Earth Engine Setup](#google-earth-engine-setup)
6. [Environment Variables](#environment-variables)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### Required Accounts

- [ ] GitHub account
- [ ] Neon account (<https://neon.tech>)
- [ ] Render account (<https://render.com>)
- [ ] Vercel account (<https://vercel.com>)
- [ ] Google Cloud Platform account
- [ ] Google Earth Engine access

### Required Software

- Node.js ≥18.0.0
- npm ≥9.0.0
- Git
- PostgreSQL client (for local testing)

---

## 🗄️ Database Setup (Neon)

### Step 1: Create Neon Project

1. Go to <https://neon.tech> and sign in
2. Click **"New Project"**
3. Configure project:
   - **Name**: `FarmRegen`
   - **Region**: Choose closest to your users
   - **PostgreSQL Version**: 15 or later
4. Click **"Create Project"**

### Step 2: Enable PostGIS Extension

1. In Neon dashboard, go to **SQL Editor**
2. Run the following command:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

3. Verify installation:

```sql
SELECT PostGIS_Version();
```

### Step 3: Create Database Schema

1. In SQL Editor, paste the contents of `backend/schema.sql`
2. Execute the script
3. Apply the vegetation indices migration:

```sql
-- Run from backend/src/db/migrations/001_add_vegetation_indices.sql
ALTER TABLE field_analyses ADD COLUMN IF NOT EXISTS ndvi_stddev NUMERIC;
ALTER TABLE field_analyses ADD COLUMN IF NOT EXISTS ndmi_mean NUMERIC;
ALTER TABLE field_analyses ADD COLUMN IF NOT EXISTS evi_mean NUMERIC;
ALTER TABLE field_analyses ADD COLUMN IF NOT EXISTS savi_mean NUMERIC;
ALTER TABLE field_analyses ADD COLUMN IF NOT EXISTS moisture_status VARCHAR(50);
ALTER TABLE field_analyses ADD COLUMN IF NOT EXISTS indices_data JSONB;
```
4. Verify tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Expected output:

- `users`
- `fields`
- `field_analyses`

### Step 4: Get Connection String

1. In Neon dashboard, go to **Connection Details**
2. Copy the connection string (it should look like):

```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
```

3. **Important**: Ensure `?sslmode=require` is at the end

### Step 5: Test Connection (Optional)

```bash
# Install PostgreSQL client
npm install -g pg

# Test connection
psql "postgresql://username:password@host/database?sslmode=require"
```

---

## 🖥️ Backend Deployment (Render)

### Step 1: Prepare Repository

1. Ensure your code is pushed to GitHub
2. Verify `backend/package.json` has correct scripts:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

### Step 2: Create Render Web Service

1. Go to <https://render.com> and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure service:
   - **Name**: `farmregen`
   - **Region**: Same as Neon database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for production)

### Step 3: Configure Environment Variables

In Render dashboard, go to **Environment** tab and add:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
FRONTEND_URL=https://farm-regen.vercel.app
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n
```

**Important Notes:**

- For `GOOGLE_PRIVATE_KEY`, use `\\n` (double backslash) for newlines in Render
- Generate a strong `JWT_SECRET` (min 32 characters)
- `FRONTEND_URL` will be updated after Vercel deployment

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Run `npm install`
   - Start the server with `npm start`
3. Monitor deployment logs for errors

### Step 5: Verify Deployment

1. Once deployed, note your backend URL (e.g., `https://farmregen.onrender.com`)
2. Test health endpoint:

```bash
curl https://farmregen.onrender.com/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2026-01-19T10:00:00.000Z"
}
```

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Prepare Repository

1. Ensure frontend code is in `frontend/` directory
2. Verify `frontend/package.json` has build script:

```json
{
  "scripts": {
    "build": "vite build",
    "dev": "vite",
    "preview": "vite preview"
  }
}
```

### Step 2: Create Vercel Project

1. Go to <https://vercel.com> and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Configure Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables**:

```env
VITE_API_URL=https://farmregen.onrender.com/api
```

**Important**: Vercel environment variables are available at build time, not runtime for Vite apps.

### Step 4: Deploy

1. Click **"Deploy"**
2. Vercel will automatically:
   - Install dependencies
   - Run `npm run build`
   - Deploy to CDN
3. Monitor build logs for errors

### Step 5: Update Backend CORS

1. Go back to Render dashboard
2. Update `FRONTEND_URL` environment variable with your Vercel URL:

```env
FRONTEND_URL=https://farm-regen.vercel.app
```

3. Render will automatically redeploy

### Step 6: Verify Deployment

1. Visit your Vercel URL (e.g., `https://farm-regen.vercel.app`)
2. Test signup/login flow
3. Verify API calls work (check browser Network tab)

---

## 🛰️ Google Earth Engine Setup

### Step 1: Create Google Cloud Project

1. Go to <https://console.cloud.google.com>
2. Create a new project: **"FarmRegen"**
3. Note the Project ID

### Step 2: Enable Earth Engine API

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for **"Earth Engine API"**
3. Click **"Enable"**

### Step 3: Create Service Account

1. Go to **IAM & Admin** → **Service Accounts**
2. Click **"Create Service Account"**
3. Configure:
   - **Name**: `farmregen-earth-engine`
   - **Description**: Service account for FarmRegen satellite analysis
4. Click **"Create and Continue"**
5. Grant role: **"Earth Engine Resource Viewer"**
6. Click **"Done"**

### Step 4: Generate Private Key

1. Click on the created service account
2. Go to **Keys** tab
3. Click **"Add Key"** → **"Create new key"**
4. Choose **JSON** format
5. Download the key file (keep it secure!)

### Step 5: Register with Earth Engine

1. Go to <https://code.earthengine.google.com>
2. Sign in with your Google account
3. Register your service account email (from the JSON file)

### Step 6: Format Private Key for Render

The JSON file contains a `private_key` field. You need to format it for Render:

**Original (from JSON):**

```json
{
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
}
```

**For Render (replace `\n` with `\\n`):**

```
-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBg...\\n-----END PRIVATE KEY-----\\n
```

**Helper Script** (`backend/format-key.js`):

```javascript
const fs = require('fs');
const keyFile = JSON.parse(fs.readFileSync('path/to/service-account.json'));
const formatted = keyFile.private_key.replace(/\n/g, '\\n');
console.log(formatted);
```

Run: `node format-key.js` and copy the output to Render.

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# CORS
FRONTEND_URL=https://farm-regen.vercel.app

# Google Earth Engine
GOOGLE_SERVICE_ACCOUNT_EMAIL=farmregen-earth-engine@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n
```

### Frontend (.env)

```env
# API URL
VITE_API_URL=https://farmregen.onrender.com/api
```

### Security Best Practices

1. **Never commit `.env` files** to Git
2. **Use different secrets** for development and production
3. **Rotate JWT secrets** periodically
4. **Keep service account keys** secure (never expose publicly)
5. **Use environment-specific URLs** (dev/staging/prod)

---

## ✅ Post-Deployment Verification

### 1. Backend Health Check

```bash
curl https://farmregen.onrender.com/health
```

Expected:

```json
{"status":"ok","timestamp":"..."}
```

### 2. Database Connection

```bash
curl https://farmregen.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

Expected: 201 status with user object and token

### 3. Frontend-Backend Integration

1. Visit `https://farm-regen.vercel.app`
2. Click **"Sign Up"**
3. Fill in the form and submit
4. Verify you're redirected to dashboard
5. Check browser console for errors

### 4. Earth Engine Integration

1. Log in to the app
2. Create a test field (draw a polygon)
3. Click **"Analyze"** button
4. Verify analysis completes without errors
5. Check soil health score is displayed

### 5. CORS Verification

Open browser console and check for CORS errors:

- ✅ No errors: CORS configured correctly
- ❌ CORS error: Check `FRONTEND_URL` in backend env vars

---

## 🐛 Troubleshooting

### Issue: Backend Crashes on Startup

**Symptoms:**

- Render logs show `Connection terminated unexpectedly`
- App crashes after a few minutes

**Solution:**

1. Verify `DATABASE_URL` includes `?sslmode=require`
2. Check `db.js` has SSL configuration:

```javascript
ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
```

3. Ensure using connection pool, not standalone client

---

### Issue: Google Earth Engine Authentication Fails

**Symptoms:**

- Analysis endpoint returns 500 error
- Logs show "Authentication failed"

**Solution:**

1. Verify `GOOGLE_PRIVATE_KEY` format:
   - Must use `\\n` (double backslash) in Render
   - Must include `-----BEGIN PRIVATE KEY-----` header
2. Check service account email is correct
3. Verify Earth Engine API is enabled
4. Ensure service account is registered with Earth Engine

**Test Script:**

```javascript
// backend/test-earth-engine.js
require('dotenv').config();
const ee = require('@google/earthengine');

const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

ee.data.authenticateViaPrivateKey(
    privateKey,
    () => {
        console.log('✅ Authentication successful');
        ee.initialize(null, null, 
            () => console.log('✅ Initialization successful'),
            (err) => console.error('❌ Initialization failed:', err)
        );
    },
    (err) => console.error('❌ Authentication failed:', err)
);
```

---

### Issue: Frontend Can't Connect to Backend

**Symptoms:**

- Network errors in browser console
- API calls fail with CORS errors

**Solution:**

1. Verify `VITE_API_URL` in Vercel env vars
2. Check `FRONTEND_URL` in Render env vars matches Vercel URL
3. Ensure backend CORS is configured:

```javascript
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
```

4. Rebuild frontend after changing env vars

---

### Issue: Database Connection Timeout

**Symptoms:**

- API calls hang for 30+ seconds
- Logs show "connection timeout"

**Solution:**

1. Check Neon database is running (not paused)
2. Verify connection string is correct
3. Ensure Render region is close to Neon region
4. Check connection pool settings:

```javascript
max: 20,
connectionTimeoutMillis: 2000,
```

---

### Issue: Rate Limiting Too Aggressive

**Symptoms:**

- Users getting "Too many requests" errors
- Testing is difficult

**Solution:**

1. Temporarily increase limits in `rateLimiter.js`:

```javascript
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,  // Increased from 100
});
```

2. For production, consider IP whitelisting for testing
2. Implement user-based rate limiting instead of IP-based

---

## 🔄 Continuous Deployment

### Automatic Deployments

Both Vercel and Render support automatic deployments:

1. **Push to `main` branch** → Automatic deployment
2. **Pull request** → Preview deployment (Vercel only)
3. **Manual deploy** → Click "Deploy" in dashboard

### Deployment Checklist

Before deploying:

- [ ] Run tests locally
- [ ] Check for console errors
- [ ] Verify environment variables are set
- [ ] Test database migrations (if any)
- [ ] Review code changes
- [ ] Update documentation

After deploying:

- [ ] Verify health check endpoint
- [ ] Test critical user flows
- [ ] Check error logs
- [ ] Monitor performance metrics

---

## 📊 Monitoring

### Render Monitoring

1. **Logs**: Real-time logs in Render dashboard
2. **Metrics**: CPU, memory, response time
3. **Alerts**: Configure email alerts for errors

### Vercel Monitoring

1. **Analytics**: Page views, performance metrics
2. **Logs**: Function logs (if using serverless functions)
3. **Insights**: Core Web Vitals, user experience

### Database Monitoring (Neon)

1. **Queries**: Slow query log
2. **Connections**: Active connections, pool usage
3. **Storage**: Database size, growth rate

---

## 🚀 Production Optimization

### Backend

1. **Enable compression**:

```javascript
const compression = require('compression');
app.use(compression());
```

1. **Add caching headers**:

```javascript
app.use((req, res, next) => {
    res.set('Cache-Control', 'public, max-age=300');
    next();
});
```

1. **Optimize database queries**:

- Add indexes for frequently queried fields
- Use connection pooling
- Implement query result caching

### Frontend

1. **Enable Vercel Analytics**
2. **Optimize images**: Use WebP format, lazy loading
3. **Code splitting**: Implement route-based code splitting
4. **Service worker**: Add offline support

---

## 📝 Rollback Procedure

### Vercel Rollback

1. Go to Vercel dashboard → **Deployments**
2. Find previous working deployment
3. Click **"..."** → **"Promote to Production"**

### Render Rollback

1. Go to Render dashboard → **Deploys**
2. Find previous working deploy
3. Click **"Rollback to this deploy"**

### Database Rollback

1. **Before schema changes**, create backup:

```sql
pg_dump $DATABASE_URL > backup.sql
```

1. **To restore**:

```sql
psql $DATABASE_URL < backup.sql
```

---

## 📞 Support

For deployment issues:

- **Email**: <lalitchoudhary112000@gmail.com>
- **GitHub Issues**: <https://github.com/lavish112000/FarmRegen/issues>

---

**Last Updated**: January 2026  
**Version**: 1.0.0
