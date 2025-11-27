# Production Deployment Fix

## Problem
The For You page, video uploading, and inbox sections don't work on the live Vercel deployment because the frontend is trying to make API calls to `localhost:4000` instead of the deployed serverless functions.

## Root Cause
The `VITE_API_BASE_URL` environment variable in Vercel is pointing to localhost or is incorrectly configured.

## Solution

### Step 1: Configure Environment Variable in Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Find or add the `VITE_API_BASE_URL` variable
4. Set it to **EMPTY** (blank/empty string) for all environments (Production, Preview, Development)
   - **Why empty?** When empty, the frontend automatically uses the same domain for API calls (e.g., `https://yourdomain.com/api/...`)

OR

3. Set `VITE_API_BASE_URL` to your production domain:
   - For Production: `https://your-app-name.vercel.app`
   - For Preview: `https://your-app-name.vercel.app`

### Step 2: Configure Other Required Environment Variables

Make sure these are set in Vercel (Production environment):

**Database & Auth:**
```
DATABASE_URL=postgres://postgres:TRcvMYUvzEs-2-7YR-gb@postgresql-godlyme-u57058.vm.elestio.app:25432/postgres?sslmode=require
REDIS_URL=redis://default:YAi-Jr6OdEDXAgG0Vdjp@redis-godlyme-u57058.vm.elestio.app:26379/0
JWT_SECRET=2f3a567c595d25921cd7c7156becf6f33a4844b0cf8c9ea1d0178e0f8a9b293ef05d276e16773bf1c6fce2410e1ab9e2b065a68a8b000f4211bf0e97755cf245
PGSSLMODE=require
```

**Email (SMTP):**
```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=verification@godlyme.com
SMTP_PASS=BoboandPhiwoRock2025!
EMAIL_FROM="Godly Me Verification <verification@godlyme.com>"
```

**App Configuration:**
```
PORT=4000
UPLOAD_MAX_BYTES=209715200
APP_BASE_URL=https://your-app-name.vercel.app
```

### Step 3: Redeploy

After updating environment variables:
1. Go to **Deployments** tab in Vercel
2. Click on the latest deployment
3. Click **Redeploy** button
4. Wait for the build to complete

## Why This Fixes the Issues

### For You Page
- Calls `/api/feed/for-you` to fetch videos
- With correct `VITE_API_BASE_URL`, this resolves to `https://yourdomain.com/api/feed/for-you`

### Upload Functionality
- Calls `/api/feed/videos` (POST) to upload videos
- Requires authentication token and correct API endpoint

### Inbox Section
- Calls `/api/messages/threads` for messages
- Calls `/api/notifications` for notifications
- Calls `/api/connections/suggested` for suggested connections

All these endpoints are serverless functions in the `/api` directory that are deployed to Vercel.

## Verification

After redeployment, test these features:
1. **For You Page**: Should load videos from the database
2. **Upload**: Sign in, try uploading a video
3. **Inbox**:
   - Notifications tab should show activity
   - Messages tab should show conversations
   - Suggested tab should show connection suggestions

## Files Created

- `vessel-app/frontend/.env.production` - Production environment config with empty VITE_API_BASE_URL

## Technical Details

The `resolveApiBaseUrl()` function in `contentService.ts`:
- Checks `import.meta.env.VITE_API_BASE_URL`
- If empty/undefined, uses `window.location.origin` (same domain as frontend)
- This allows frontend and API to be deployed together on Vercel

## Common Mistakes to Avoid

❌ **Don't** set `VITE_API_BASE_URL=http://localhost:4000` in production
❌ **Don't** forget to redeploy after changing environment variables
❌ **Don't** mix up Production vs Preview vs Development environments

✅ **Do** leave `VITE_API_BASE_URL` empty in Vercel
✅ **Do** set all database and email credentials
✅ **Do** redeploy after any environment variable changes
