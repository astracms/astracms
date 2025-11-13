# AstraCMS API - Quick Start Checklist

## 🎯 Goal
Deploy the API to Railway with PostgreSQL and Redis in 30 minutes.

---

## ✅ Pre-Flight Checklist

- [ ] Railway account created (https://railway.app)
- [ ] GitHub repo pushed: https://github.com/netronk/astracms
- [ ] Railway CLI installed (optional): `npm i -g @railway/cli`

---

## 📋 Deployment Steps

### Step 1: Create Project (2 min)

**Via Dashboard:**
1. Go to https://railway.app/new
2. Click "New Project"
3. Select "Empty Project"
4. Name: `astracms`

### Step 2: Add PostgreSQL (2 min)

1. Click "New" → "Database" → "Add PostgreSQL"
2. Wait for green status ✅ (~1 minute)
3. Click on Postgres service
4. Go to "Variables" tab
5. Copy the `DATABASE_URL` value (you'll need it later)

### Step 3: Add Redis (2 min)

1. Click "New" → "Database" → "Add Redis"
2. Wait for green status ✅ (~1 minute)
3. Click on Redis service
4. Go to "Variables" tab
5. Copy `REDIS_URL` and `REDIS_TOKEN` values

### Step 4: Deploy API Service (5 min)

**Connect GitHub Repository:**
1. Click "New" → "GitHub Repo"
2. Select: `netronk/astracms`
3. Railway will create a new service

**Configure the Service:**
1. Click on the service name → Rename to `astracms-api`
2. Go to Settings → Source
3. **Important**: Set Root Directory to `apps/api`
4. Click "Update"
5. Go to Settings → Deploy
6. Set Start Command: `pnpm start`
7. Set Restart Policy: `ON_FAILURE`
8. Set Max Retries: `10`

### Step 5: Configure Environment (3 min)

Go to API service → Variables tab, add:

- Click "New Variable"
- Add these one by one:
  ```
  NODE_ENV=production
  PORT=8000
  DATABASE_URL=${{Postgres.DATABASE_URL}}
  REDIS_URL=${{Redis.REDIS_URL}}
  REDIS_TOKEN=${{Redis.REDIS_TOKEN}}
  API_VERSION=v1
  CORS_ORIGINS=*
  ```
- Railway will auto-deploy after saving

### Step 6: Generate Domain (1 min)

1. Click on your API service
2. Go to Settings → Networking
3. Click "Generate Domain"
4. Copy the URL (e.g., `astracms-api-production.up.railway.app`)

### Step 7: Run Migrations (5 min)

**Option A - Via Railway CLI:**
```bash
# Install CLI if not already installed
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Connect to API service
railway shell --service astracms-api

# Run migrations
cd /app
pnpm prisma migrate deploy

# Exit
exit
```

**Option B - Via Dashboard (if CLI doesn't work):**
1. Go to your API service
2. Click "Deployments" tab
3. Click on the active deployment
4. Click "View Logs"
5. Migrations should run automatically on first deploy
6. If not, you can manually run them later

### Step 8: Test API (2 min)

```bash
# Health check
curl https://astracms-api-production.up.railway.app/status

# Expected: {"status":"ok"}
```

✅ **If you see this, your API is deployed!**

---

## 🎉 Success!

Your API is now running at:
- **Railway URL**: `https://astracms-api-production.up.railway.app`
- **Health**: `https://astracms-api-production.up.railway.app/status`
- **API Base**: `https://astracms-api-production.up.railway.app/v1`

---

## 📝 Save These Values

```bash
# Save to deployment/.env.production
API_URL=https://astracms-api-production.up.railway.app
DATABASE_URL=<get from Railway>
REDIS_URL=<get from Railway>
REDIS_TOKEN=<get from Railway>
```

To get these values:
```bash
railway variables
```

---

## 🔧 Quick Commands

```bash
# View logs
railway logs --tail

# Restart service
railway restart --service astracms-api

# Open shell
railway shell --service astracms-api

# Redeploy
railway up
```

---

## 🚨 Troubleshooting

### Service won't start?
```bash
railway logs --service astracms-api
# Check for errors in logs
```

### Database connection error?
```bash
railway variables | grep DATABASE_URL
# Verify DATABASE_URL is set
```

### Redis connection error?
```bash
railway variables | grep REDIS
# Verify REDIS_URL and REDIS_TOKEN are set
```

---

## ⏭️ Next Steps

1. ✅ API deployed and working
2. 🔜 Deploy CMS (needs OAuth setup first)
3. 🔜 Deploy Web (blog)

---

## 📚 Detailed Guides

For more information:
- **Railway Setup**: `deployment/RAILWAY-SETUP.md`
- **API Deployment**: `deployment/API-DEPLOYMENT-GUIDE.md`
- **API Documentation**: `apps/api/README.md`
- **Troubleshooting**: `apps/api/DEPLOYMENT.md`

---

**Total Time**: ~20-30 minutes  
**Cost**: Free tier covers everything  
**Status**: ✅ Ready to deploy  
**No railway.toml needed**: Manual setup is more reliable for monorepos