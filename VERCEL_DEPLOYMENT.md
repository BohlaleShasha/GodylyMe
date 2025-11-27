# Vercel Deployment Guide for Godlyme

This guide will help you deploy your full-stack Godlyme application to Vercel.

## Prerequisites

Before deploying, you need to set up external services for:

1. **PostgreSQL Database** (Choose one):
   - [Supabase](https://supabase.com) - Free tier available
   - [Neon](https://neon.tech) - Generous free tier
   - [Railway](https://railway.app) - Good for databases
   - [Render](https://render.com) - PostgreSQL hosting

2. **Redis** (Choose one):
   - [Upstash](https://upstash.com) - Serverless Redis, perfect for Vercel
   - [Redis Cloud](https://redis.com/cloud) - Free tier available

3. **SMTP Email Service** (Optional but recommended):
   - [Hostinger](https://hostinger.com) - As configured
   - [SendGrid](https://sendgrid.com) - Free tier: 100 emails/day
   - [Mailgun](https://mailgun.com) - Free tier: 5,000 emails/month
   - [AWS SES](https://aws.amazon.com/ses/) - Very cheap

## Step 1: Set Up External Services

### PostgreSQL Setup (Example: Neon)

1. Go to [Neon](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:pass@host.neon.tech/dbname?sslmode=require`)
4. Save this for later - you'll need it as `DATABASE_URL`

### Redis Setup (Recommended: Upstash)

1. Go to [Upstash](https://upstash.com) and create a free account
2. Create a new Redis database
3. Copy the connection string (looks like: `rediss://default:password@host.upstash.io:6379`)
4. Save this for later - you'll need it as `REDIS_URL`

### Email Setup (Optional)

If you want to send verification emails:
1. Use your existing Hostinger SMTP or set up SendGrid
2. Get your SMTP credentials ready

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Navigate to your project:
```bash
cd c:\Users\bobo7\OneDrive\Desktop\Godlyme.v.1.2\vessel-app\vessel-app
```

3. Login to Vercel:
```bash
vercel login
```

4. Deploy:
```bash
vercel
```

5. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? Select your account
   - Link to existing project? **No**
   - What's your project's name? **godlyme** (or whatever you prefer)
   - In which directory is your code located? **./** (current directory)
   - Want to override the settings? **No**

### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your Git repository (GitHub, GitLab, or Bitbucket)
4. Vercel will auto-detect the configuration from `vercel.json`
5. Click "Deploy"

## Step 3: Configure Environment Variables

After deployment, add these environment variables in Vercel Dashboard:

1. Go to your project in Vercel
2. Click "Settings" → "Environment Variables"
3. Add the following variables:

### Required Variables:

| Variable | Value | Example |
|----------|-------|---------|
| `DATABASE_URL` | Your PostgreSQL connection string | `postgresql://user:pass@host.neon.tech/dbname` |
| `PGSSLMODE` | SSL mode for PostgreSQL | `require` |
| `REDIS_URL` | Your Redis connection string | `rediss://default:pass@host.upstash.io:6379` |
| `JWT_SECRET` | Random secure string (32+ characters) | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

### Optional Email Variables:

| Variable | Value |
|----------|-------|
| `SMTP_HOST` | `smtp.hostinger.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `verification@godlyme.com` |
| `SMTP_PASS` | Your SMTP password |
| `EMAIL_FROM` | `"Godly Me Verification <verification@godlyme.com>"` |
| `APP_BASE_URL` | Your Vercel deployment URL (e.g., `https://godlyme.vercel.app`) |

### Optional Variables:

| Variable | Value | Default |
|----------|-------|---------|
| `UPLOAD_MAX_BYTES` | Max upload size in bytes | `209715200` (200MB) |

## Step 4: Initialize Database Tables

After setting environment variables, you need to initialize your database tables.

### Option A: Use the Backend Locally

1. Create a `.env` file in the `backend` folder with your production credentials:
```bash
DATABASE_URL=your_production_database_url
PGSSLMODE=require
REDIS_URL=your_production_redis_url
JWT_SECRET=your_jwt_secret
```

2. Run the backend once to create tables:
```bash
cd backend
npm run dev
```

The server will automatically create all necessary tables on startup.

### Option B: Manual SQL Setup

Connect to your PostgreSQL database and run the table creation queries from:
- `backend/src/services/userService.ts` (ensureUsersTable)
- `backend/src/services/followService.ts` (ensureFollowPrereqs)
- `backend/src/services/videoEngagementService.ts` (ensureVideoEngagementTables)
- `backend/src/services/videoFeedService.ts` (ensureVideoFeedTables)
- `backend/src/services/messagingService.ts` (ensureMessagingTables)
- `backend/src/services/notificationService.ts` (ensureNotificationTables)

## Step 5: Test Your Deployment

1. Visit your Vercel deployment URL
2. Try the health check endpoint: `https://your-app.vercel.app/api/health`
3. Test signup/login functionality

## Step 6: Update Frontend API URL (if needed)

If your frontend has hardcoded API URLs, update them to use relative paths or environment variables.

Check files in `frontend/src` for API calls and ensure they use `/api/...` paths.

## Important Notes

### File Uploads

The current implementation uses local file storage in the `uploads/` directory. This **will not work** on Vercel's serverless platform.

For file uploads, you need to:
1. Use a cloud storage service (AWS S3, Cloudflare R2, Vercel Blob)
2. Update the upload routes to use the cloud service

### Database Connections

Serverless functions create new database connections for each request. The configuration uses:
- `max: 1` for PostgreSQL pool (prevents connection pooling issues)
- Connection reuse where possible

Consider using a connection pooler like:
- [Supabase Pooler](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Neon's built-in pooling](https://neon.tech/docs/connect/connection-pooling)

### Remaining Routes

The following routes still need to be converted to serverless functions:
- `/api/contacts/*` - Contact management
- `/api/follows/*` - Follow/unfollow functionality
- `/api/feed/*` - Video feed
- `/api/videos/*` - Video engagement (likes, comments)
- `/api/messages/*` - Messaging
- `/api/notifications/*` - Notifications

These follow the same pattern as the auth routes in the `api/` directory.

## Troubleshooting

### "Database connection failed"
- Check your `DATABASE_URL` is correct
- Ensure `PGSSLMODE=require` is set
- Verify your database allows connections from anywhere (0.0.0.0/0)

### "Redis connection failed"
- Check your `REDIS_URL` is correct
- Ensure your Redis instance is publicly accessible

### "JWT_SECRET not configured"
- Make sure you've added the `JWT_SECRET` environment variable
- Redeploy after adding the variable

### "Email not sending"
- Check all SMTP variables are set correctly
- Verify SMTP credentials are valid
- Check Vercel function logs for errors

## Monitoring

1. View logs: Vercel Dashboard → Your Project → "Logs" tab
2. Monitor function execution: "Functions" tab
3. Check analytics: "Analytics" tab

## Costs

- **Vercel**: Free tier includes:
  - 100 GB bandwidth/month
  - 100 GB-hours serverless function execution
  - Automatic SSL

- **Neon (PostgreSQL)**: Free tier includes:
  - 512 MB storage
  - 1 project

- **Upstash (Redis)**: Free tier includes:
  - 10,000 commands/day
  - 256 MB storage

## Next Steps

1. ✅ Set up custom domain in Vercel
2. ✅ Configure production environment variables
3. ✅ Test all authentication flows
4. ✅ Implement remaining API routes as serverless functions
5. ✅ Set up file upload to cloud storage
6. ✅ Monitor and optimize function performance

## Support

If you encounter issues:
1. Check Vercel function logs
2. Verify all environment variables are set
3. Test database and Redis connections separately
4. Review this guide for missing steps

Good luck with your deployment! 🚀
