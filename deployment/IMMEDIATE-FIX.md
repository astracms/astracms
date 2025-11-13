# IMMEDIATE FIX - Railway Healthcheck Failure

## 🔥 Problem
Your API builds successfully but healthcheck fails because Railway is running from the wrong directory.

## ✅ QUICK FIX (Do this now)

### Option 1: Railway Dashboard (FASTEST - 2 minutes)

1. **Go to Railway Dashboard**
   - URL: https://railway.app
   - Open your project
   - Click on the "api" service

2. **Set Root Directory**
   - Click **Settings** (left sidebar)
   - Click **Source** tab
   - Find "Root Directory" field
   - Enter: `apps/api`
   - Click **Update**

3. **Redeploy**
   - Click **Deployments** tab
   - Click **⋮** (three dots) on latest deployment
   - Click **Redeploy**

4. **Done!** 
   - Wait 2-3 minutes for deployment
   - Check logs for "✨ Server is running on port 8000"
   - Test: `curl https://your-domain.railway.app/`

---

### Option 2: Push Updated railway.toml (ALTERNATIVE)

The `railway.toml` file has been updated with the correct path. If Option 1 doesn't work:

1. **Commit and Push**
   ```bash
   cd /Users/kalana/dev/netronk/astracms
   git add apps/api/railway.toml
   git commit -m "fix: update railway start command path"
   git push
   ```

2. **Railway will auto-deploy**
   - Monitor deployment in dashboard
   - Check logs for success message

---

## 🎯 What Changed

**File**: `apps/api/railway.toml`

```toml
[deploy]
startCommand = "NODE_ENV=production tsx apps/api/src/server.ts"
```

**Before**: `tsx src/server.ts` (wrong - file not found)  
**After**: `tsx apps/api/src/server.ts` (correct - full path from repo root)

---

## ✓ Success Indicators

### In Railway Logs:
```
🚀 AstraCMS API Server
====================
Environment: production
Port: 8000
Version: v1
====================
✨ Server is running on port 8000
```

### Healthcheck Should Pass:
```
Attempt #1 succeeded ✅
Service is healthy
```

### Test URLs:
```bash
curl https://your-domain.railway.app/
# Returns: "Hello from AstraCMS"

curl https://your-domain.railway.app/status
# Returns: {"status":"ok"}
```

---

## 🚨 Environment Variables Checklist

Make sure these are set in Railway → Variables:

```
✓ DATABASE_URL=${{Postgres.DATABASE_URL}}
✓ NODE_ENV=production
✓ REDIS_URL=${{Redis.REDIS_URL}} (if using Redis)
✓ REDIS_TOKEN=${{Redis.REDIS_TOKEN}} (if using Redis)
✓ API_VERSION=v1
✓ CORS_ORIGINS=*
```

---

## 📞 Still Not Working?

### Check These:

1. **Root Directory is set**: `apps/api` in Railway Settings → Source
2. **Start command**: Should be `pnpm start` OR `tsx apps/api/src/server.ts`
3. **Database**: Postgres service is running (green status)
4. **Environment variables**: DATABASE_URL is set
5. **Port**: Railway automatically sets PORT, server should listen on it

### View Logs:
```bash
railway login
railway logs --service api --tail
```

### Check Build Context:
```bash
railway shell --service api
ls -la /app
# Should see: apps/, packages/, node_modules/, etc.
```

---

## ⏱️ Timeline

- **Deploy time**: ~2 minutes
- **Healthcheck window**: 100 seconds
- **Total wait**: ~3-4 minutes max

---

## 📖 More Details

See `deployment/HEALTHCHECK-FIX.md` for comprehensive troubleshooting guide.

---

**TL;DR**: Set Root Directory to `apps/api` in Railway dashboard → Redeploy → Done! 🚀