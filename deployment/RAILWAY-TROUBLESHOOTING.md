# Railway Deployment Troubleshooting - Quick Reference

## 🔴 Common Railway Errors & Solutions

### Error: "No start command was found"

**Cause**: Railway can't find how to start your application.

**Solutions**:

1. **Set Start Command Manually** (Recommended)
   - Go to your service in Railway dashboard
   - Settings → Deploy
   - Set Start Command: `pnpm start`
   - Click "Update"
   - Redeploy (Deployments → Latest → Redeploy)

2. **Verify Root Directory**
   - Settings → Source
   - Root Directory should be: `apps/api` (NOT `/apps/api` or `apps/api/`)
   - Update and redeploy if incorrect

3. **Check Files Exist**
   - Verify `apps/api/package.json` has start script
   - Verify `apps/api/Procfile` exists with: `web: pnpm start`
   - Verify `apps/api/nixpacks.toml` exists

---

### Error: "Failed to parse your service config"

**Cause**: Invalid `railway.toml` configuration.

**Solution**: 
- ✅ We removed `railway.toml` - it's not needed!
- Use manual dashboard configuration instead
- If you see this, delete any `railway.toml` in your repo

---

### Error: "Workspace not found" or "No packages found"

**Cause**: Railway can't detect the pnpm workspace.

**Solutions**:

1. **Verify Root Directory is Correct**
   - Should be: `apps/api` (relative to repo root)
   - NOT absolute path like `/apps/api`

2. **Check Workspace Files**
   - `pnpm-workspace.yaml` must exist in repo root
   - `pnpm-lock.yaml` must exist in repo root

3. **Install Command**
   - Settings → Build
   - Install Command should be: `pnpm install --frozen-lockfile`
   - Or leave empty (Railway auto-detects)

---

### Error: "MODULE_NOT_FOUND" or "@astracms/db not found"

**Cause**: Workspace dependencies not installed correctly.

**Solutions**:

1. **Use Correct Install Command**
   ```bash
   pnpm install --frozen-lockfile
   ```

2. **Add to nixpacks.toml**
   ```toml
   [phases.install]
   cmds = [
     'corepack enable',
     'corepack prepare pnpm@10.19.0 --activate',
     'pnpm install --frozen-lockfile'
   ]
   ```

3. **Clear Build Cache**
   - Settings → Builds
   - Click "Clear Build Cache"
   - Redeploy

---

### Error: Database Connection Failed / ECONNREFUSED

**Cause**: Database URL not configured or incorrect.

**Solutions**:

1. **Verify Postgres Service Exists**
   - Check project has PostgreSQL service (green status)
   - Click on Postgres → Variables tab
   - Copy `DATABASE_URL`

2. **Set Environment Variable**
   - Go to API service → Variables
   - Add: `DATABASE_URL=${{Postgres.DATABASE_URL}}`
   - Use service reference syntax `${{ServiceName.VARIABLE}}`

3. **Check Connection String Format**
   ```
   postgresql://user:password@host:5432/database
   ```

---

### Error: Redis Connection Failed

**Cause**: Redis URL or token not set.

**Solutions**:

1. **Verify Redis Service Exists**
   - Check project has Redis service (green status)
   - Click on Redis → Variables tab

2. **Set Both Variables**
   ```
   REDIS_URL=${{Redis.REDIS_URL}}
   REDIS_TOKEN=${{Redis.REDIS_TOKEN}}
   ```

3. **Test Connection**
   ```bash
   railway shell --service astracms-api
   node
   > const { Redis } = require('@upstash/redis');
   > const redis = new Redis({ url: process.env.REDIS_URL, token: process.env.REDIS_TOKEN });
   > await redis.ping();
   ```

---

### Error: Build Timeout or Out of Memory

**Cause**: Build takes too long or uses too much memory.

**Solutions**:

1. **Upgrade Railway Plan**
   - Free tier has limits
   - Hobby plan ($5/month) has higher limits

2. **Optimize Build**
   - Add `.railwayignore` to exclude unnecessary files
   - Clear build cache
   - Reduce dependencies if possible

3. **Use Build Command Override**
   - Settings → Build
   - Build Command: `pnpm install --frozen-lockfile`
   - (Skips unnecessary build steps)

---

### Error: 502 Bad Gateway / Service Unavailable

**Cause**: Service crashed or not responding.

**Solutions**:

1. **Check Logs**
   ```bash
   railway logs --service astracms-api --tail
   ```
   
2. **Verify Health Endpoint**
   - Try: `https://your-service.railway.app/status`
   - Should return: `{"status":"ok"}`

3. **Check Environment Variables**
   - All required vars set? (DATABASE_URL, REDIS_URL, etc.)
   - No typos in variable names?

4. **Restart Service**
   ```bash
   railway restart --service astracms-api
   ```

---

### Error: Port Already in Use / EADDRINUSE

**Cause**: Service trying to use wrong port.

**Solution**:
- Railway sets `PORT` automatically
- Your code should use: `process.env.PORT || 8000`
- In `apps/api/src/server.ts`:
  ```typescript
  const port = parseInt(process.env.PORT || "8000", 10);
  ```

---

## 🛠️ Debug Commands

### View Real-Time Logs
```bash
railway logs --service astracms-api --tail
```

### Connect to Service Shell
```bash
railway shell --service astracms-api
```

### View Environment Variables
```bash
railway variables --service astracms-api
```

### Restart Service
```bash
railway restart --service astracms-api
```

### Redeploy Latest
```bash
railway up --service astracms-api
```

---

## ✅ Deployment Checklist

Before asking for help, verify:

- [ ] Root Directory set to `apps/api` in Settings → Source
- [ ] Start Command set to `pnpm start` in Settings → Deploy
- [ ] All environment variables configured (NODE_ENV, PORT, DATABASE_URL, REDIS_URL, REDIS_TOKEN)
- [ ] PostgreSQL service exists and is running (green status)
- [ ] Redis service exists and is running (green status)
- [ ] GitHub repo is connected (not local upload)
- [ ] Latest commit is pushed to GitHub
- [ ] `pnpm-workspace.yaml` exists in repo root
- [ ] `apps/api/package.json` has "start" script
- [ ] No `railway.toml` file in root (we removed it)

---

## 🔍 Where to Find Things

### In Railway Dashboard

**Service Settings**:
- Settings → Source (Root Directory)
- Settings → Build (Build/Install commands)
- Settings → Deploy (Start Command, Restart Policy)
- Settings → Networking (Domain generation)

**Environment Variables**:
- Service → Variables tab
- Click "New Variable" to add
- Use `${{ServiceName.VARIABLE}}` for references

**Logs**:
- Service → Deployments tab
- Click deployment → View Logs
- Or use CLI: `railway logs --tail`

**Service Health**:
- Green dot = Running
- Yellow dot = Building
- Red dot = Failed
- Grey dot = Stopped

---

## 📚 Helpful Resources

- **Railway Docs**: https://docs.railway.app
- **Monorepo Guide**: https://docs.railway.app/guides/monorepo
- **Nixpacks Docs**: https://nixpacks.com
- **Railway Discord**: https://discord.gg/railway
- **Railway Status**: https://status.railway.app

---

## 🆘 Still Having Issues?

### 1. Check Railway Status
https://status.railway.app - Is Railway having issues?

### 2. Review Logs
Most issues show clear error messages in logs:
```bash
railway logs --service astracms-api --tail 100
```

### 3. Try Clean Deploy
1. Settings → Builds → Clear Build Cache
2. Deployments → Redeploy

### 4. Verify Local Build Works
```bash
cd apps/api
pnpm install
pnpm start
# Should start without errors
```

### 5. Ask for Help
- Railway Discord: https://discord.gg/railway
- GitHub Issues: https://github.com/netronk/astracms/issues
- Include: Service logs, error message, what you tried

---

## 🎯 Quick Fix for "No Start Command"

**The fastest solution**:

1. Go to https://railway.app/dashboard
2. Click your `astracms-api` service
3. Settings → Deploy
4. Start Command: `pnpm start`
5. Click "Update"
6. Go to Deployments tab
7. Click latest deployment → "Redeploy"

✅ Done! Service should start now.

---

**Last Updated**: November 2024  
**Railway Version**: V2  
**AstraCMS Version**: 1.0.0