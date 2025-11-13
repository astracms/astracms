# AstraCMS API - Railway Deployment Guide

Complete guide for deploying the AstraCMS API to Railway.app with Node.js.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Railway Deployment](#railway-deployment)
4. [Environment Variables](#environment-variables)
5. [Domain Configuration](#domain-configuration)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts & Tools

- **Railway Account**: Sign up at [railway.app](https://railway.app)
- **Node.js**: Version 20 or higher
- **pnpm**: Package manager (or npm/yarn)
- **Git**: For version control

### Required Services

The API depends on these services (can be provisioned on Railway):

- **PostgreSQL**: Database for content storage
- **Redis (Upstash)**: For rate limiting and analytics
- **Minio** (optional): S3-compatible storage (if using media uploads)

---

## Local Development Setup

### 1. Install Dependencies

From the monorepo root:

```bash
pnpm install
```

### 2. Configure Environment

Create `.env` file in `apps/api/`:

```bash
cp .env.example .env
```

Edit `.env` with your local settings:

```env
NODE_ENV=development
PORT=8000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/astracms
REDIS_URL=https://your-redis.upstash.io
REDIS_TOKEN=your-redis-token
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
API_VERSION=v1
```

### 3. Start Development Server

```bash
cd apps/api
pnpm dev
```

The API will be available at `http://localhost:8000`

### 4. Test Endpoints

```bash
# Health check
curl http://localhost:8000/status

# Get posts (replace with your workspace ID)
curl http://localhost:8000/v1/YOUR_WORKSPACE_ID/posts?limit=10
```

---

## Railway Deployment

### Step 1: Create Railway Project

#### Option A: Using Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create new project
railway init

# Link to your project
railway link
```

#### Option B: Using Railway Dashboard

1. Go to [railway.app/new](https://railway.app/new)
2. Click "New Project"
3. Select "Empty Project"
4. Name it "astracms" or your preferred name

### Step 2: Provision Required Services

#### PostgreSQL Database

```bash
railway add --database postgres
```

Or via Dashboard:
1. Click "New" → "Database" → "PostgreSQL"
2. Wait for provisioning
3. Note the `DATABASE_URL` in variables tab

#### Redis (Upstash)

```bash
railway add --database redis
```

Or via Dashboard:
1. Click "New" → "Database" → "Redis"
2. Railway will provision Upstash Redis
3. Note `REDIS_URL` and `REDIS_TOKEN`

### Step 3: Create API Service

```bash
# Create new service
railway service create astracms-api
```

Or via Dashboard:
1. Click "New" → "GitHub Repo"
2. Select your repository
3. Set root directory to `apps/api` (if monorepo)

### Step 4: Configure Build & Start Commands

Railway should auto-detect Node.js, but you can configure explicitly:

**Build Command**: (leave empty - we use tsx runtime)
```
# No build needed
```

**Start Command**:
```bash
cd apps/api && pnpm start
```

Or set in `railway.toml` (at project root):

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "cd apps/api && pnpm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### Step 5: Configure Environment Variables

In Railway Dashboard → API Service → Variables:

```env
NODE_ENV=production
PORT=8000
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
REDIS_TOKEN=${{Redis.REDIS_TOKEN}}
CORS_ORIGINS=https://astracms.com,https://blog.astracms.com
API_VERSION=v1
```

**Important**: Railway uses `${{SERVICE.VARIABLE}}` syntax to reference other services.

### Step 6: Deploy

```bash
# Via CLI
railway up

# Or commit and push (if connected to GitHub)
git push origin main
```

Railway will automatically:
1. Install dependencies with `pnpm install`
2. Start the server with `pnpm start`
3. Expose the service on a public URL

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `8000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL` | Redis endpoint URL | `https://abc.upstash.io` |
| `REDIS_TOKEN` | Redis auth token | `AXXXxxxxXXXX` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `*` |
| `API_VERSION` | API version prefix | `v1` |

### Railway Service References

When using Railway's internal services, reference them with:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
REDIS_TOKEN=${{Redis.REDIS_TOKEN}}
```

---

## Domain Configuration

### Step 1: Generate Domain

In Railway Dashboard → API Service → Settings → Domains:

1. Click "Generate Domain"
2. Railway will create: `astracms-api-production.up.railway.app`

### Step 2: Add Custom Domain

1. Click "Custom Domain"
2. Enter: `api.astracms.com`
3. Railway will provide DNS records

### Step 3: Configure DNS

Add these records to your DNS provider:

**CNAME Record:**
```
Type: CNAME
Name: api
Value: astracms-api-production.up.railway.app
TTL: 3600
```

Or **A/AAAA Records** (if provided by Railway).

### Step 4: Wait for SSL

Railway automatically provisions SSL certificates via Let's Encrypt (usually takes 1-5 minutes).

---

## Testing

### Health Checks

```bash
# Basic health check
curl https://api.astracms.com/status

# Should return: {"status":"ok"}
```

### API Endpoints

```bash
# List posts
curl "https://api.astracms.com/v1/YOUR_WORKSPACE_ID/posts?limit=5"

# Get specific post
curl "https://api.astracms.com/v1/YOUR_WORKSPACE_ID/posts/your-post-slug"

# List authors
curl "https://api.astracms.com/v1/YOUR_WORKSPACE_ID/authors"

# List categories
curl "https://api.astracms.com/v1/YOUR_WORKSPACE_ID/categories"

# List tags
curl "https://api.astracms.com/v1/YOUR_WORKSPACE_ID/tags"
```

### Rate Limiting

Test rate limit headers:

```bash
curl -I "https://api.astracms.com/v1/YOUR_WORKSPACE_ID/posts"

# Look for these headers:
# X-RateLimit-Limit: 200
# X-RateLimit-Remaining: 199
# X-RateLimit-Reset: 1234567890
```

### Performance

```bash
# Test response time
time curl -s "https://api.astracms.com/status" > /dev/null

# Load test (requires apache-bench)
ab -n 1000 -c 10 https://api.astracms.com/status
```

---

## Troubleshooting

### Common Issues

#### 1. Service Won't Start

**Symptom**: Deployment fails, service crashes immediately

**Solutions**:
- Check logs: `railway logs`
- Verify `NODE_ENV` is set to `production`
- Ensure `DATABASE_URL` is accessible
- Confirm Node.js version is 20+

```bash
# Check Railway logs
railway logs --tail 100
```

#### 2. Database Connection Errors

**Symptom**: `ECONNREFUSED` or `Connection timeout`

**Solutions**:
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/db`
- Check database service is running
- Test connection from API service:

```bash
railway run --service api psql $DATABASE_URL
```

#### 3. Redis Connection Errors

**Symptom**: Rate limiting doesn't work, analytics fail

**Solutions**:
- Verify `REDIS_URL` and `REDIS_TOKEN` are set
- Check Redis service is active
- Test Redis connection:

```bash
# Via Railway shell
railway shell

# Inside shell
node
> const { Redis } = require('@upstash/redis');
> const redis = new Redis({ url: process.env.REDIS_URL, token: process.env.REDIS_TOKEN });
> await redis.ping();
```

#### 4. CORS Errors

**Symptom**: Browser requests fail with CORS errors

**Solutions**:
- Add allowed origins to `CORS_ORIGINS`:
  ```env
  CORS_ORIGINS=https://astracms.com,https://blog.astracms.com
  ```
- Ensure no trailing slashes
- Check browser console for exact origin being blocked

#### 5. 404 on API Routes

**Symptom**: Endpoints return 404 Not Found

**Solutions**:
- Verify workspace ID is correct
- Check URL structure: `/v1/:workspaceId/posts` (not `/posts/:workspaceId`)
- Ensure content exists and is published in database

#### 6. Memory Issues

**Symptom**: Service crashes with OOM (Out of Memory)

**Solutions**:
- Upgrade Railway plan for more memory
- Check for memory leaks in custom code
- Monitor memory usage:

```bash
railway logs | grep "memory"
```

#### 7. Slow Response Times

**Symptom**: API takes >2s to respond

**Solutions**:
- Check database query performance
- Verify Redis connection is working (caching)
- Review Prisma query optimization
- Consider adding database indexes:

```sql
-- Example indexes
CREATE INDEX idx_posts_workspace_status ON "Post"("workspaceId", "status");
CREATE INDEX idx_posts_published_at ON "Post"("publishedAt" DESC);
```

### Debug Mode

Enable verbose logging:

```env
# Add to Railway environment variables
DEBUG=*
LOG_LEVEL=debug
```

View logs:

```bash
# Tail logs in real-time
railway logs --tail

# Filter by service
railway logs --service astracms-api

# Export logs
railway logs > api-logs.txt
```

### Health Monitoring

Set up monitoring with Railway:

1. Go to Service → Observability
2. Enable Health Checks
3. Set endpoint: `/status`
4. Set interval: 30 seconds

---

## Production Checklist

Before going live, verify:

- [ ] All environment variables configured
- [ ] Custom domain configured and SSL active
- [ ] Database migrations run successfully
- [ ] Redis connection working (rate limiting active)
- [ ] Health endpoint returns 200 OK
- [ ] API endpoints return correct data
- [ ] CORS configured for production domains
- [ ] Rate limiting tested and working
- [ ] Monitoring/alerting configured
- [ ] Backup strategy in place for database
- [ ] Load testing completed
- [ ] Error tracking set up (Sentry, etc.)

---

## Maintenance

### View Logs

```bash
# Real-time logs
railway logs --tail

# Last 100 lines
railway logs --tail 100
```

### Restart Service

```bash
# Via CLI
railway service restart

# Or via Dashboard
# Service → Settings → Restart
```

### Scale Service

```bash
# Upgrade plan for more resources
# Dashboard → Project Settings → Plan
```

### Database Migrations

```bash
# Run migrations
railway run --service api pnpm prisma migrate deploy

# Or via Railway shell
railway shell --service api
cd apps/api
pnpm prisma migrate deploy
```

### Rollback Deployment

```bash
# Via Dashboard
# Service → Deployments → Select previous → Rollback
```

---

## Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Hono Documentation](https://hono.dev)
- [Upstash Redis Docs](https://docs.upstash.com/redis)
- [Prisma Documentation](https://www.prisma.io/docs)

---

## Support

For issues specific to:
- **Railway**: [Railway Discord](https://discord.gg/railway)
- **AstraCMS API**: Open an issue in the repository
- **General Node.js**: Check logs and error messages first

---

**Last Updated**: 2024
**Version**: 1.0.0