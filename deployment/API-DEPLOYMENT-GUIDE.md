# AstraCMS API - Step-by-Step Railway Deployment Guide

## Overview

This guide will walk you through deploying **ONLY the API** to Railway first, including all required infrastructure (PostgreSQL, Redis, Minio). Once the API is working, you can deploy CMS and Web apps.

**Estimated Time**: 30-45 minutes

---

## Prerequisites

- [ ] Railway account ([sign up free](https://railway.app))
- [ ] GitHub account (for repo connection)
- [ ] Domain name (optional, Railway provides free subdomain)
- [ ] Command line access

---

## Part 1: Install Railway CLI

### macOS
```bash
brew install railway
```

### Linux/WSL
```bash
npm i -g @railway/cli
```

### Windows
```bash
npm i -g @railway/cli
```

### Verify Installation
```bash
railway --version
```

### Login to Railway
```bash
railway login
```

This will open a browser window for authentication.

---

## Part 2: Create Railway Project

### Option A: Using CLI (Recommended)

```bash
cd /Users/kalana/dev/netronk/astracms

# Initialize Railway project
railway init

# Follow the prompts:
# - Project name: astracms
# - Environment: production
```

### Option B: Using Dashboard

1. Go to [railway.app/new](https://railway.app/new)
2. Click "New Project"
3. Select "Empty Project"
4. Name it: `astracms`

### Link Your Local Project

```bash
# If using dashboard, link your local project
railway link
```

Select your newly created project from the list.

---

## Part 3: Provision PostgreSQL Database

### Using CLI

```bash
# Add PostgreSQL to your project
railway add --database postgres
```

Wait for provisioning (usually 30-60 seconds).

### Using Dashboard

1. Open your project in Railway dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Wait for provisioning

### Get Database Credentials

```bash
# View all environment variables
railway variables
```

Look for:
- `DATABASE_URL` or
- `POSTGRES_URL`

Copy this URL, you'll need it later.

**Example format:**
```
postgresql://postgres:password@hostname.railway.internal:5432/railway
```

---

## Part 4: Provision Redis (Upstash)

### Using CLI

```bash
# Add Redis to your project
railway add --database redis
```

### Using Dashboard

1. Click "New" → "Database" → "Redis"
2. Railway will provision Upstash Redis automatically

### Get Redis Credentials

```bash
railway variables
```

Look for:
- `REDIS_URL` - Redis endpoint (https://...)
- `REDIS_TOKEN` - Redis authentication token

**Copy both values**, you'll need them.

---

## Part 5: Provision Minio (S3 Storage)

Minio provides S3-compatible storage for media uploads.

### Using Dashboard

1. Click "New" → "Template"
2. Search for "Minio"
3. Click "Deploy"
4. Or use this template: [Minio Template](https://railway.app/template/minio)

### Manual Setup (Alternative)

1. Click "New" → "Empty Service"
2. Name it: `minio`
3. Add these environment variables:
   ```
   MINIO_ROOT_USER=admin
   MINIO_ROOT_PASSWORD=<generate-strong-password>
   ```
4. Deploy from Docker Hub: `minio/minio`

### Get Minio Credentials

After deployment, note:
- `MINIO_ENDPOINT` - Internal hostname (e.g., `minio.railway.internal:9000`)
- `MINIO_ROOT_USER` - Access key
- `MINIO_ROOT_PASSWORD` - Secret key

---

## Part 6: Create API Service

### Connect GitHub Repository

1. Go to Railway dashboard
2. Click "New" → "GitHub Repo"
3. Select your `astracms` repository
4. Railway will detect it's a monorepo

### Configure Root Directory

Since we're in a monorepo, we need to tell Railway where the API is:

1. Click on the new service
2. Go to "Settings"
3. Set **Root Directory**: `apps/api`
4. Set **Name**: `astracms-api`

### Set Build Configuration

Railway should auto-detect Node.js, but verify:

1. Go to "Settings" → "Build"
2. **Builder**: NIXPACKS (auto-detected)
3. **Build Command**: Leave empty (not needed with tsx)
4. **Install Command**: `pnpm install` (auto-detected)

### Set Start Command

1. Go to "Settings" → "Deploy"
2. **Start Command**: `pnpm start`
3. **Restart Policy**: `ON_FAILURE`
4. **Max Retries**: `10`

---

## Part 7: Configure Environment Variables

### Get Service References

In Railway, you can reference other services using this syntax:
```
${{ServiceName.VARIABLE_NAME}}
```

### Add Environment Variables

Go to your API service → "Variables" tab and add:

```env
NODE_ENV=production
PORT=8000
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
REDIS_TOKEN=${{Redis.REDIS_TOKEN}}
API_VERSION=v1
```

### Add CORS Origins (Initial)

For now, allow all origins during testing:
```env
CORS_ORIGINS=*
```

**Later**, update this to your actual domains:
```env
CORS_ORIGINS=https://astracms.com,https://blog.astracms.com
```

### Add Minio Variables (If Using Media)

```env
MINIO_ENDPOINT=${{minio.RAILWAY_PRIVATE_DOMAIN}}:9000
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=${{minio.MINIO_ROOT_USER}}
MINIO_SECRET_KEY=${{minio.MINIO_ROOT_PASSWORD}}
MINIO_BUCKET=astracms-media
```

---

## Part 8: Deploy the API

### Trigger Deployment

Railway will automatically deploy when you push to your connected branch, but you can also trigger manually:

#### Using CLI
```bash
# Deploy current branch
railway up
```

#### Using Dashboard
1. Go to your API service
2. Click "Deploy" → "Redeploy"

### Monitor Deployment

Watch the build logs:

#### Using CLI
```bash
railway logs
```

#### Using Dashboard
1. Go to "Deployments" tab
2. Click on the active deployment
3. Watch the build and deploy logs

### Expected Output

You should see:
```
🚀 AstraCMS API Server
====================
Environment: production
Port: 8000
Version: v1
====================
✨ Server is running on port 8000
```

---

## Part 9: Generate Public Domain

### Generate Railway Domain

1. Go to API service → "Settings" → "Networking"
2. Click "Generate Domain"
3. Railway will create: `astracms-api-production.up.railway.app`

**Copy this URL** - you'll need it for testing.

### Test the API

```bash
# Health check
curl https://astracms-api-production.up.railway.app/status

# Expected response:
# {"status":"ok"}

# Hello endpoint
curl https://astracms-api-production.up.railway.app/

# Expected response:
# Hello from AstraCMS
```

✅ **If you see these responses, your API is working!**

---

## Part 10: Run Database Migrations

Now that the API is deployed, we need to set up the database schema.

### Using Railway CLI

```bash
# Connect to your API service
railway shell --service astracms-api

# Inside the shell, run migrations
cd /app
pnpm prisma migrate deploy

# Exit shell
exit
```

### Alternative: Run Locally with Production DB

```bash
# Set production database URL locally (temporary)
export DATABASE_URL="<your-railway-postgres-url>"

# Run migrations from your local machine
cd apps/api
pnpm prisma migrate deploy

# Unset the variable
unset DATABASE_URL
```

### Verify Migrations

```bash
railway shell --service astracms-api

# Check database
psql $DATABASE_URL -c "\dt"

# You should see tables like:
# Post, Author, Category, Tag, User, etc.
```

---

## Part 11: Configure Custom Domain (Optional)

### Add Custom Domain

1. Go to API service → "Settings" → "Networking"
2. Click "Custom Domain"
3. Enter: `api.astracms.com`

### Configure DNS

Railway will provide DNS records. Add to your DNS provider:

**CNAME Record:**
```
Type: CNAME
Name: api
Value: astracms-api-production.up.railway.app
TTL: 3600
```

### Wait for SSL

Railway automatically provisions SSL certificates (1-5 minutes).

### Test Custom Domain

```bash
curl https://api.astracms.com/status
```

---

## Part 12: Test API Endpoints

Now test the actual API functionality:

### Create Test Data

First, you need to create a workspace in your database. We'll do this via Railway shell:

```bash
railway shell --service astracms-api

# Start Node REPL
node

# Run this in Node:
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a test workspace
const workspace = await prisma.workspace.create({
  data: {
    name: 'Test Workspace',
    slug: 'test-workspace',
    domain: 'blog.astracms.com'
  }
});

console.log('Workspace ID:', workspace.id);

// Exit Node
process.exit();
```

**Copy the Workspace ID** (you'll need it for API calls).

### Test API Endpoints

Replace `{workspaceId}` with your actual workspace ID:

```bash
# Get posts
curl "https://api.astracms.com/v1/{workspaceId}/posts?limit=10"

# Get authors
curl "https://api.astracms.com/v1/{workspaceId}/authors"

# Get categories
curl "https://api.astracms.com/v1/{workspaceId}/categories"

# Get tags
curl "https://api.astracms.com/v1/{workspaceId}/tags"
```

### Test Rate Limiting

```bash
# Check rate limit headers
curl -I "https://api.astracms.com/v1/{workspaceId}/posts"

# Look for these headers:
# X-RateLimit-Limit: 200
# X-RateLimit-Remaining: 199
# X-RateLimit-Reset: 1234567890
```

---

## Part 13: Monitoring & Logs

### View Logs

#### Using CLI (Real-time)
```bash
railway logs --tail
```

#### Using Dashboard
1. Go to API service
2. Click "Observability" tab
3. View logs in real-time

### Set Up Health Checks

1. Go to API service → "Settings" → "Health Checks"
2. Enable health checks
3. Set endpoint: `/status`
4. Set interval: `30 seconds`
5. Set timeout: `5 seconds`

---

## Part 14: Environment-Specific Configuration

### Update Variables for Production

Now that everything is working, lock down your configuration:

```env
# Update CORS to only allow your domains
CORS_ORIGINS=https://astracms.com,https://blog.astracms.com

# Ensure production mode
NODE_ENV=production
```

### Create Staging Environment (Optional)

1. Go to project settings
2. Create new environment: `staging`
3. Duplicate services and variables
4. Use different domain: `api-staging.astracms.com`

---

## Part 15: Verification Checklist

Before moving to CMS deployment, verify:

- [ ] API service is running (green status in Railway)
- [ ] PostgreSQL database is connected
- [ ] Redis is connected (rate limiting works)
- [ ] Health check returns `{"status":"ok"}`
- [ ] Database migrations completed successfully
- [ ] Test workspace created in database
- [ ] API endpoints return data (even if empty)
- [ ] Rate limiting headers appear in responses
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (green lock)
- [ ] Logs show no errors

---

## Troubleshooting

### Issue: Service Won't Start

**Symptom**: Deployment fails, service crashes

**Solution**:
```bash
# Check logs
railway logs --service astracms-api

# Common fixes:
# 1. Verify DATABASE_URL is set
# 2. Check NODE_ENV=production
# 3. Ensure PORT is set to 8000
```

### Issue: Database Connection Error

**Symptom**: `ECONNREFUSED` or timeout errors

**Solution**:
```bash
# Test database connection
railway shell --service astracms-api
psql $DATABASE_URL -c "SELECT 1;"

# If fails, check:
# 1. DATABASE_URL format
# 2. Database service is running
# 3. Network connectivity
```

### Issue: Redis Connection Error

**Symptom**: Rate limiting doesn't work, analytics fail

**Solution**:
```bash
# Verify Redis variables are set
railway variables | grep REDIS

# Test Redis connection
railway shell --service astracms-api
node
> const { Redis } = require('@upstash/redis');
> const redis = new Redis({ url: process.env.REDIS_URL, token: process.env.REDIS_TOKEN });
> await redis.ping();
```

### Issue: 404 on API Routes

**Symptom**: Endpoints return 404

**Solution**:
- Verify URL structure: `/v1/{workspaceId}/posts`
- Check workspace ID is correct
- Ensure content exists in database

### Issue: Build Fails

**Symptom**: Deployment fails during build

**Solution**:
```bash
# Check package.json scripts
# Ensure these exist:
# "start": "NODE_ENV=production tsx src/server.ts"
# "dev": "tsx watch src/server.ts"

# Check Root Directory setting in Railway:
# Should be: apps/api
```

---

## Success Criteria

Your API is successfully deployed when:

✅ **Service Status**: Green/Running in Railway dashboard
✅ **Health Check**: `curl https://api.astracms.com/status` returns `{"status":"ok"}`
✅ **Database**: Tables created via migrations
✅ **Redis**: Rate limiting headers appear in responses
✅ **Endpoints**: All API routes return valid JSON (200 status)
✅ **Logs**: No error messages in Railway logs
✅ **Domain**: SSL certificate active (HTTPS working)

---

## What's Next?

Once your API is deployed and working:

1. **Save Your URLs**: 
   ```
   API_URL=https://api.astracms.com
   DATABASE_URL=<from Railway>
   REDIS_URL=<from Railway>
   REDIS_TOKEN=<from Railway>
   ```

2. **Deploy CMS**: 
   - CMS will connect to this API
   - Uses the same database
   - Needs OAuth setup (Google/GitHub)

3. **Deploy Web**:
   - Web blog will fetch from API
   - Uses Astro for SSG/SSR
   - Connects to same workspace

---

## Quick Reference

### Important URLs

- Railway Dashboard: https://railway.app/dashboard
- API Service: https://railway.app/project/{your-project-id}
- API Endpoint: https://api.astracms.com (or Railway subdomain)
- Health Check: https://api.astracms.com/status

### Important Commands

```bash
# View logs
railway logs --tail

# Connect to shell
railway shell --service astracms-api

# View variables
railway variables

# Deploy
railway up

# Restart service
railway restart --service astracms-api
```

### Service References

In Railway environment variables, use:
```
${{Postgres.DATABASE_URL}}
${{Redis.REDIS_URL}}
${{Redis.REDIS_TOKEN}}
${{minio.MINIO_ROOT_USER}}
```

---

## Cost Estimate

### Railway Free Tier
- **Included**: $5 credit/month
- **API Service**: ~$2-3/month
- **PostgreSQL**: ~$1-2/month
- **Redis**: ~$1/month
- **Minio**: ~$1/month
- **Total**: ~$5-7/month

### Hobby Plan ($5/month)
- **Included**: $5 credit + better limits
- Same costs as above, more headroom

---

## Support

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **AstraCMS API Docs**: See `apps/api/README.md`
- **Troubleshooting**: See `apps/api/DEPLOYMENT.md`

---

**Status**: Ready to deploy API ✅
**Next Step**: Run through this guide step-by-step
**Time Required**: 30-45 minutes
**Difficulty**: Beginner-friendly

---

**Last Updated**: 2024
**Version**: 1.0.0