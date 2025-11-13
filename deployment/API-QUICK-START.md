# AstraCMS API - Quick Start Checklist

## 🎯 Goal
Deploy the API to Railway with PostgreSQL and Redis in 30 minutes.

---

## ✅ Pre-Flight Checklist

- [ ] Railway account created (https://railway.app)
- [ ] Railway CLI installed: `npm i -g @railway/cli`
- [ ] Logged in: `railway login`
- [ ] In project directory: `cd /Users/kalana/dev/netronk/astracms`

---

## 📋 Deployment Steps

### Step 1: Create Project (2 min)
```bash
railway init
# Name: astracms
# Environment: production
```

### Step 2: Add PostgreSQL (2 min)
```bash
railway add --database postgres
```

Wait for green status ✅

### Step 3: Add Redis (2 min)
```bash
railway add --database redis
```

Wait for green status ✅

### Step 4: Deploy API (5 min)

**Via Dashboard:**
1. Go to railway.app/dashboard
2. Open your `astracms` project
3. Click "New" → "GitHub Repo"
4. Select your repository
5. **Important**: Set Root Directory to `apps/api`
6. Name service: `astracms-api`

### Step 5: Configure Environment (3 min)

Go to API service → Variables tab, add:

```env
NODE_ENV=production
PORT=8000
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
REDIS_TOKEN=${{Redis.REDIS_TOKEN}}
API_VERSION=v1
CORS_ORIGINS=*
```

Click "Save Variables" - deployment will trigger automatically.

### Step 6: Generate Domain (1 min)

1. Go to API service → Settings → Networking
2. Click "Generate Domain"
3. Copy the URL: `astracms-api-production.up.railway.app`

### Step 7: Run Migrations (5 min)

```bash
# Connect to your API service
railway shell --service astracms-api

# Run migrations
cd /app
pnpm prisma migrate deploy

# Exit
exit
```

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

## 📚 Detailed Guide

For comprehensive instructions, see:
- `deployment/API-DEPLOYMENT-GUIDE.md`
- `apps/api/README.md`
- `apps/api/DEPLOYMENT.md`

---

**Total Time**: ~20-30 minutes
**Cost**: Free tier covers everything
**Status**: ✅ Ready to deploy