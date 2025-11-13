# 🚂 STEP 2 QUICK REFERENCE

**Railway Infrastructure Setup - Quick Commands & Checklist**

---

## 🚀 Quick Setup Commands

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Run automated setup script
./scripts/setup-railway.sh

# 4. Link to your project (after creating in dashboard)
railway link

# 5. Check project status
railway status

# 6. View environment variables
railway variables

# 7. Connect to PostgreSQL
railway run psql $DATABASE_URL

# 8. Connect to Redis
railway run redis-cli -u $REDIS_URL
```

---

## ✅ Setup Checklist

### Railway Account & Project
- [ ] Created Railway account at https://railway.app
- [ ] Logged in with GitHub (recommended)
- [ ] Created new project: `astracms-production`
- [ ] Railway CLI installed locally
- [ ] Authenticated CLI with `railway login`
- [ ] Linked project with `railway link`

### PostgreSQL Database
- [ ] Added PostgreSQL service via "+ New" → "Database" → "PostgreSQL"
- [ ] Service is running (green status)
- [ ] Copied `DATABASE_URL` from Variables tab
- [ ] Copied `DATABASE_PRIVATE_URL` from Variables tab
- [ ] Tested connection with `railway run psql $DATABASE_URL`
- [ ] Auto backups enabled in Settings

### Redis Cache
- [ ] Added Redis service via "+ New" → "Database" → "Redis"
- [ ] Service is running (green status)
- [ ] Copied `REDIS_URL` from Variables tab
- [ ] Copied `REDIS_PRIVATE_URL` from Variables tab
- [ ] Tested connection with `railway run redis-cli -u $REDIS_URL`
- [ ] Set eviction policy to `allkeys-lru`

### Minio Storage
- [ ] Added service via "+ New" → "Empty Service"
- [ ] Set Docker image: `minio/minio:latest`
- [ ] Set start command: `minio server /data --console-address ":9001"`
- [ ] Added environment variable: `MINIO_ROOT_USER=minioadmin`
- [ ] Added environment variable: `MINIO_ROOT_PASSWORD=<secure-password>`
- [ ] Exposed ports: 9000 (API) and 9001 (Console)
- [ ] Service deployed and running
- [ ] Accessed Minio Console at `:9001`
- [ ] Created bucket: `astracms-media`
- [ ] Set bucket policy to public read
- [ ] Configured CORS for uploads

### Environment Variables
- [ ] Created `deployment/.env.production` file
- [ ] Generated `BETTER_AUTH_SECRET` (32 bytes)
- [ ] Generated `MINIO_SECRET_KEY` (32 bytes)
- [ ] Added all Database URLs
- [ ] Added all Redis URLs
- [ ] Added all Minio configuration
- [ ] File NOT committed to git (in .gitignore)
- [ ] Credentials saved in password manager

---

## 🔐 Generate Secrets

```bash
# Generate BETTER_AUTH_SECRET (32 bytes)
openssl rand -base64 32

# Generate MINIO_SECRET_KEY (32 bytes)
openssl rand -base64 32

# Generate generic API key (64 hex chars)
openssl rand -hex 32

# Generate UUID
uuidgen
```

---

## 📦 Service URLs Format

### PostgreSQL
```
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:5432/railway
DATABASE_PRIVATE_URL=postgresql://postgres:PASSWORD@INTERNAL_HOST:5432/railway
```

### Redis
```
REDIS_URL=redis://default:PASSWORD@HOST:6379
REDIS_PRIVATE_URL=redis://default:PASSWORD@INTERNAL_HOST:6379
```

### Minio
```
MINIO_ENDPOINT=https://minio-production-xxxx.up.railway.app
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=<your-secure-password>
MINIO_BUCKET_NAME=astracms-media
MINIO_PUBLIC_URL=https://minio-production-xxxx.up.railway.app/astracms-media
```

---

## 🧪 Test Commands

### Test PostgreSQL Connection
```bash
# Using Railway CLI
railway run psql $DATABASE_URL

# Test query
SELECT version();

# Exit
\q
```

### Test Redis Connection
```bash
# Using Railway CLI
railway run redis-cli -u $REDIS_URL

# Test commands
PING
SET test "Hello"
GET test

# Exit
exit
```

### Test Minio Access
```bash
# Access console in browser
# URL from Railway service → Deployments → Public URL
# Login with MINIO_ROOT_USER and MINIO_ROOT_PASSWORD

# Or use AWS CLI with S3 endpoint
aws s3 --endpoint-url=$MINIO_ENDPOINT ls s3://astracms-media/
```

---

## 🎛️ Minio Bucket Policy (Public Read)

**Apply in Minio Console → Buckets → astracms-media → Access Policy:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": ["*"]},
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::astracms-media/*"]
    }
  ]
}
```

---

## 🌐 Minio CORS Configuration

**Apply in Minio Console → Buckets → astracms-media → CORS:**

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}
```

---

## 🔍 Verify Infrastructure

```bash
# Check all services running
railway status

# List all services in project
railway service list

# View logs for specific service
railway logs

# Check environment variables
railway variables

# Open Railway dashboard
railway open
```

---

## 📊 Expected Services in Railway

```
✅ PostgreSQL      - Running (Port 5432)
✅ Redis           - Running (Port 6379)
✅ Minio           - Running (Ports 9000, 9001)
```

---

## 💰 Cost Estimate

**Hobby Plan ($5/month included credit):**
- PostgreSQL: ~$1-2/month
- Redis: ~$1/month
- Minio: ~$1-2/month
- **Total:** $3-5/month (within free credit)

**Pro Plan ($20/month + usage):**
- Better for production
- More resources included
- Auto-scaling available

---

## 🚨 Common Issues & Solutions

### Issue: Can't connect to PostgreSQL
```bash
# Solution: Use PRIVATE URL for internal connections
echo $DATABASE_PRIVATE_URL
railway run psql $DATABASE_PRIVATE_URL
```

### Issue: Minio console not accessible
```bash
# Solution: Check if port 9001 is exposed
# Go to Service → Settings → Networking
# Ensure both 9000 and 9001 are exposed
```

### Issue: Redis connection timeout
```bash
# Solution: Check Redis is running and use private URL
railway logs --service redis
```

### Issue: Railway CLI not authenticated
```bash
# Solution: Re-authenticate
railway logout
railway login
```

---

## 📁 File Locations

```
deployment/
├── .env.production          ← Environment variables (DO NOT COMMIT)
├── plan.txt                 ← Overall deployment plan
├── STEP2-GUIDE.md          ← Detailed setup guide
├── STEP2-QUICKREF.md       ← This file
└── infrastructure.md        ← Document your setup here

scripts/
└── setup-railway.sh         ← Automated setup script
```

---

## ⚠️ Important Reminders

1. **Never commit `.env.production` to git**
2. **Save all credentials in password manager**
3. **Use PRIVATE URLs for internal service communication**
4. **Enable auto-backups for PostgreSQL**
5. **Set Minio bucket policy before uploading**
6. **Test each service after setup**
7. **Document all URLs and credentials**

---

## 🎯 Next Steps After Step 2

Once all services are running and tested:

1. ✅ Update `deployment/.env.production` with all URLs
2. ✅ Test all connections
3. ✅ Document infrastructure setup
4. ✅ Proceed to **Step 3: API Migration to Node.js**

---

## 📞 Quick Links

- **Railway Dashboard:** https://railway.app/dashboard
- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **Minio Docs:** https://min.io/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Redis Docs:** https://redis.io/documentation

---

## 🔄 Step 2 Automated Setup

**Run the automation script:**

```bash
cd /Users/kalana/dev/netronk/astracms
./scripts/setup-railway.sh
```

**Script does:**
- ✅ Install Railway CLI
- ✅ Authenticate to Railway
- ✅ Generate all secrets
- ✅ Create environment template
- ✅ Provide setup guidance
- ✅ Test connections

---

**Status:** Infrastructure Setup  
**Time Required:** 1-2 hours  
**Difficulty:** Medium  
**Next:** Step 3 - API Migration