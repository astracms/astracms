# Railway Healthcheck Failure - Fix Guide

## Problem Summary

Your API build succeeds but the healthcheck fails with "service unavailable" after all retry attempts. The logs show:

```
start      │ NODE_ENV=production tsx src/server.ts
```

But your actual server file is at `apps/api/src/server.ts` in the monorepo.

## Root Cause

**Railway is building from the monorepo root (`/app/`) but the start command is looking for `src/server.ts` in the wrong location.**

Nixpacks auto-detected the start command as `tsx src/server.ts`, but since it's running from `/app/` (the repo root), it should be `tsx apps/api/src/server.ts`.

---

## Solution

### ✅ Fix 1: Set Root Directory in Railway Dashboard (RECOMMENDED)

This is the proper way to deploy monorepo services on Railway.

1. **Go to Railway Dashboard**
   - Open your project: https://railway.app/project/[your-project-id]
   - Click on the "api" service

2. **Navigate to Settings → Source**
   - Scroll to "Root Directory"
   - Enter: `apps/api`
   - Click "Update"

3. **Verify Start Command** (Settings → Deploy)
   - Should auto-detect as: `pnpm start` or `tsx src/server.ts`
   - If not, manually set: `pnpm start`

4. **Redeploy**
   - Go to Deployments tab
   - Click "Redeploy"

**Why this works**: Railway will build and run everything relative to `apps/api`, so `src/server.ts` will correctly point to `apps/api/src/server.ts`.

---

### ✅ Fix 2: Update railway.toml (ALTERNATIVE)

If you can't change the root directory in the dashboard, I've already updated your `railway.toml` file:

**File**: `apps/api/railway.toml`

```toml
[build]
builder = "nixpacks"
buildCommand = "echo 'No explicit build step required for tsx runtime.'"

[deploy]
preDeployCommand = ["pnpm --filter @astracms/db db:migrate"]
startCommand = "NODE_ENV=production tsx apps/api/src/server.ts"
healthcheckPath = "/"
healthcheckTimeout = 100
restartPolicyType = "never"
```

**Key change**: 
- `startCommand` now points to `apps/api/src/server.ts` (full path from repo root)

**To apply this fix**:
1. Commit and push the updated `railway.toml`
2. Railway will auto-deploy with the new start command

---

## Verification Steps

After deploying with either fix:

### 1. Check Build Logs
Look for these success indicators:
```
stage-0
RUN npm install -g corepack@0.24.1 && corepack enable
✅ changed 1 package in 506ms

stage-0
RUN pnpm i --frozen-lockfile
✅ Done in 14.6s
```

### 2. Check Startup Logs
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

### 3. Test Healthcheck Endpoint
```bash
curl https://[your-railway-domain].railway.app/
# Expected: "Hello from AstraCMS"

curl https://[your-railway-domain].railway.app/status
# Expected: {"status":"ok"}
```

---

## Common Issues & Fixes

### Issue 1: "Cannot find module 'src/server.ts'"
**Cause**: Start command path is wrong
**Fix**: Use Fix 1 or Fix 2 above

### Issue 2: "ECONNREFUSED" or timeout
**Cause**: Server isn't binding to the correct host/port
**Fix**: Check environment variables

### Issue 3: Database connection errors
**Cause**: DATABASE_URL not set or incorrect
**Fix**: 
```bash
# In Railway dashboard, add environment variable:
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### Issue 4: Server starts but healthcheck fails
**Cause**: Port mismatch or healthcheck path wrong
**Fix**: Ensure `PORT` env var is set (Railway provides this automatically)

---

## Environment Variables Checklist

Ensure these are set in Railway → Service → Variables:

```env
# Required
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production

# Optional but recommended
PORT=8000                              # Railway sets this automatically, but good to have
REDIS_URL=${{Redis.REDIS_URL}}         # If using Redis
REDIS_TOKEN=${{Redis.REDIS_TOKEN}}     # If using Railway Redis with ioredis
API_VERSION=v1
CORS_ORIGINS=*                         # Update with your actual domains
```

**Note**: The `${{ServiceName.VARIABLE}}` syntax references other Railway services.

---

## Railway Service Configuration Reference

Your Railway service should have these settings:

### Source
- **Repository**: netronk/astracms
- **Branch**: main (or your deployment branch)
- **Root Directory**: `apps/api` ⚠️ IMPORTANT

### Build
- **Builder**: NIXPACKS (auto-detected)
- **Build Command**: Leave empty or use: `echo 'No build needed'`
- **Install Command**: `pnpm install` (auto-detected)

### Deploy
- **Start Command**: `pnpm start` (if root dir is set) OR `tsx apps/api/src/server.ts` (if root dir is NOT set)
- **Restart Policy**: ON_FAILURE
- **Max Retries**: 10

### Networking
- **Healthcheck Path**: `/`
- **Healthcheck Timeout**: 100 seconds
- **Port**: 8000 (Railway detects this automatically)

---

## Testing Your Deployment

Once deployed successfully, test these endpoints:

```bash
# Replace YOUR_DOMAIN with your actual Railway domain
DOMAIN="your-service.railway.app"

# 1. Health check
curl https://$DOMAIN/
# Expected: "Hello from AstraCMS"

# 2. Status endpoint
curl https://$DOMAIN/status
# Expected: {"status":"ok"}

# 3. API endpoints (requires workspace ID)
curl https://$DOMAIN/v1/{workspaceId}/posts
curl https://$DOMAIN/v1/{workspaceId}/authors
curl https://$DOMAIN/v1/{workspaceId}/categories
curl https://$DOMAIN/v1/{workspaceId}/tags
```

---

## Debugging Commands

If issues persist, use Railway CLI:

```bash
# View real-time logs
railway logs --service api --tail

# SSH into the container
railway shell --service api

# Inside the shell, check:
cd /app
ls -la                          # See directory structure
cat package.json                # Verify package.json
env | grep -E "PORT|DATABASE"   # Check environment variables
node --version                  # Check Node version
```

---

## Next Steps

1. ✅ Apply **Fix 1** (Root Directory) or ensure **Fix 2** (railway.toml) is pushed
2. ✅ Verify environment variables are set
3. ✅ Deploy and monitor logs
4. ✅ Test healthcheck endpoints
5. ✅ Once API is healthy, proceed with CMS deployment

---

## Additional Resources

- **Railway Monorepo Guide**: https://docs.railway.app/guides/monorepo
- **Nixpacks Documentation**: https://nixpacks.com/docs
- **Railway CLI**: https://docs.railway.app/develop/cli
- **AstraCMS Setup**: See `deployment/RAILWAY-SETUP.md`

---

## Summary

**The fix is simple**: Railway needs to know your service is in `apps/api`, not the repo root.

**Fastest solution**: Set Root Directory to `apps/api` in Railway dashboard.

**Alternative**: The updated `railway.toml` file with correct paths (already done).

After applying either fix, your healthcheck should pass and the service will be available! 🚀