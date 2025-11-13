# Railway Setup Guide for AstraCMS

## Important: Manual Setup Approach

Railway works best with monorepos when services are configured **manually through the dashboard** rather than using `railway.toml`. This guide walks you through the correct setup.

---

## Prerequisites

- [ ] Railway account: https://railway.app
- [ ] GitHub repository: https://github.com/netronk/astracms
- [ ] Railway CLI installed: `npm i -g @railway/cli`

---

## Step 1: Create Railway Project

### Via CLI
```bash
cd /Users/kalana/dev/netronk/astracms
railway login
railway init
# Name: astracms
```

### Via Dashboard
1. Go to https://railway.app/new
2. Click "New Project"
3. Select "Empty Project"
4. Name: `astracms`

---

## Step 2: Add PostgreSQL Database

### Via CLI
```bash
railway add --database postgres
```

### Via Dashboard
1. Click "New" → "Database" → "Add PostgreSQL"
2. Wait for provisioning (~1 minute)
3. Note the `DATABASE_URL` in Variables tab

---



## Step 4: Add API Service

### Connect GitHub Repository

1. Click "New" → "GitHub Repo"
2. Select: `netronk/astracms`
3. Railway will detect the monorepo

### Configure API Service

1. **Service Name**: Click on service name → Rename to `astracms-api`

2. **Root Directory**:
   - Go to Settings → Source
   - Set Root Directory: `apps/api`
   - Click "Update"

3. **Build Settings** (Settings → Build):
   - Builder: Dockerfile
   - Railway will automatically detect and use the `Dockerfile` located in `apps/api/`.

4. **Deploy Settings** (Settings → Deploy):
   - The start command is defined within the `Dockerfile`.
   - Restart Policy: `ON_FAILURE`
   - Max Retries: `10`

5. **Environment Variables** (Variables tab):
   ```
   NODE_ENV=production
   PORT=8000
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   API_VERSION=v1
   CORS_ORIGINS=*
   ```

   **For Upstash Redis:**
   Manually add `UPSTASH_REDIS_URL` and `UPSTASH_REDIS_TOKEN` to your API service's environment variables in Railway. Obtain these values directly from your Upstash Redis instance.

   ```env
   UPSTASH_REDIS_URL=your_upstash_redis_url
   UPSTASH_REDIS_TOKEN=your_upstash_redis_token
   ```

6. **Generate Domain** (Settings → Networking):
   - Click "Generate Domain"
   - Copy URL (e.g., `astracms-api-production.up.railway.app`)

7. **Deploy**:
   - Railway auto-deploys on push
   - Or click "Deploy" → "Redeploy"

---

## Step 5: Run Database Migrations

Once API is deployed:

```bash
# Connect to API service
railway shell --service astracms-api

# Run migrations
cd /app
pnpm prisma migrate deploy

# Exit
exit
```

---

## Step 6: Test API

```bash
# Replace with your Railway URL
curl https://astracms-api-production.up.railway.app/status

# Expected response:
# {"status":"ok"}
```

✅ **If you see this, your API is deployed successfully!**

---

## Step 7: Add Custom Domain (Optional)

1. Go to API service → Settings → Networking
2. Click "Custom Domain"
3. Enter: `api.astracms.com`
4. Add DNS record at your provider:
   ```
   Type: CNAME
   Name: api
   Value: astracms-api-production.up.railway.app
   TTL: 3600
   ```
5. Wait for SSL (1-5 minutes)

---

## Step 8: Deploy CMS (Later)

After API is stable, repeat Step 4 for CMS:

1. Create new service from same GitHub repo
2. Set Root Directory: `apps/cms`
3. Configure environment variables
4. Deploy

---

## Step 9: Deploy Web (Later)

After CMS is working, repeat for Web:

1. Create new service from same GitHub repo
2. Set Root Directory: `apps/web`
3. Configure environment variables
4. Deploy

---

## Why No railway.toml?

Railway's V2 configuration has limited support for:
- Complex monorepo setups
- Multiple services in one file
- Database service configuration
- Advanced networking

**Manual configuration through the dashboard is:**
- ✅ More reliable
- ✅ Better documented
- ✅ Easier to debug
- ✅ Recommended by Railway for monorepos

---

## Troubleshooting

### Build Fails
- Check Root Directory is set correctly (`apps/api`)
- Verify pnpm-lock.yaml exists in repo root
- Check build logs for specific errors

### Deployment Fails
- Verify environment variables are set
- Check start command: `pnpm start`
- Ensure package.json has correct start script

### Database Connection Error
- Verify DATABASE_URL is set
- Check Postgres service is running (green status)
- Try using `${{Postgres.DATABASE_URL}}` syntax

### Redis Connection Error
- Verify `UPSTASH_REDIS_URL` and `UPSTASH_REDIS_TOKEN` are manually set in your Railway environment variables.
- Check your Upstash Redis instance status.

---

## Service References

In Railway environment variables, reference other services:

```env
# Postgres
DATABASE_URL=${{Postgres.DATABASE_URL}}



# Other services (if needed)
API_URL=${{astracms-api.RAILWAY_PUBLIC_DOMAIN}}
```

---

## Quick Commands

```bash
# View logs
railway logs --service astracms-api --tail

# Connect to shell
railway shell --service astracms-api

# View variables
railway variables --service astracms-api

# Restart service
railway restart --service astracms-api

# Deploy
railway up --service astracms-api
```

---

## Resources

- **Railway Docs**: https://docs.railway.app
- **Monorepo Guide**: https://docs.railway.app/guides/monorepo
- **Config as Code**: https://docs.railway.app/guides/config-as-code
- **Railway Discord**: https://discord.gg/railway

---

**Next**: Follow [API-QUICK-START.md](API-QUICK-START.md) for detailed API deployment steps.