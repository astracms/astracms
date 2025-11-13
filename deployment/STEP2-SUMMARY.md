# 🚂 STEP 2: RAILWAY INFRASTRUCTURE SETUP - SUMMARY

**Status:** 📝 **GUIDE READY - USER ACTION REQUIRED**  
**Date Created:** November 13, 2024  
**Estimated Time:** 1-2 hours  
**Prerequisites:** Step 1 Complete ✅

---

## 📋 Executive Summary

Step 2 provides complete documentation and automation tools for setting up Railway infrastructure for AstraCMS. This includes PostgreSQL database, Redis cache, and Minio S3-compatible storage. All guides, scripts, and reference materials have been created and are ready for use.

---

## ✅ What Was Created

### Documentation Files

1. **`deployment/STEP2-GUIDE.md`** (681 lines)
   - Complete step-by-step setup guide
   - Detailed instructions for each service
   - Configuration examples
   - Testing procedures
   - Troubleshooting section

2. **`deployment/STEP2-QUICKREF.md`** (359 lines)
   - Quick command reference
   - Copy-paste commands
   - Service URL formats
   - Common issues and solutions
   - Fast setup checklist

3. **`scripts/setup-railway.sh`** (508 lines)
   - Automated setup script
   - Railway CLI installation
   - Secret generation
   - Environment template creation
   - Connection testing
   - Interactive guide

4. **`deployment/STEP2-SUMMARY.md`** (this file)
   - Overview and status
   - Next steps guidance

---

## 🎯 What Needs To Be Done (User Actions)

### Phase 1: Railway Account Setup (5 minutes)
1. **Go to** https://railway.app
2. **Sign up** with GitHub (recommended) or email
3. **Choose plan**: Hobby ($5/month credit) or Pro ($20/month)
4. **Verify email** (if using email signup)

### Phase 2: Install Railway CLI (5 minutes)
```bash
# Option 1: Via npm (cross-platform)
npm install -g @railway/cli

# Option 2: Via Homebrew (macOS)
brew install railway

# Verify installation
railway --version

# Login to Railway
railway login
```

### Phase 3: Run Automated Setup (10 minutes)
```bash
# Navigate to project
cd /Users/kalana/dev/netronk/astracms

# Run setup script
./scripts/setup-railway.sh

# Follow prompts:
# - Installs Railway CLI (if needed)
# - Authenticates to Railway
# - Generates secrets
# - Creates .env.production template
# - Optionally creates Railway project
```

### Phase 4: Create Services in Railway Dashboard (30-45 minutes)

#### 4.1 PostgreSQL Database
1. **In Railway Dashboard:**
   - Click "+ New"
   - Select "Database"
   - Choose "Add PostgreSQL"
2. **Wait for provisioning** (~1 minute)
3. **Go to Variables tab**
4. **Copy these values:**
   - `DATABASE_URL`
   - `DATABASE_PRIVATE_URL`
5. **Paste into** `deployment/.env.production`
6. **Test connection:**
   ```bash
   railway run psql $DATABASE_URL
   ```

#### 4.2 Redis Cache
1. **In Railway Dashboard:**
   - Click "+ New"
   - Select "Database"
   - Choose "Add Redis"
2. **Wait for provisioning** (~1 minute)
3. **Go to Variables tab**
4. **Copy these values:**
   - `REDIS_URL`
   - `REDIS_PRIVATE_URL`
5. **Paste into** `deployment/.env.production`
6. **Test connection:**
   ```bash
   railway run redis-cli -u $REDIS_URL
   PING
   ```

#### 4.3 Minio S3 Storage
1. **In Railway Dashboard:**
   - Click "+ New"
   - Select "Empty Service"
   - Click "Docker Image"
2. **Configure:**
   - **Image:** `minio/minio:latest`
   - **Start Command:** `minio server /data --console-address ":9001"`
3. **Add Environment Variables:**
   ```
   MINIO_ROOT_USER=minioadmin
   MINIO_ROOT_PASSWORD=<paste-from-.env.production>
   ```
4. **Expose Ports:**
   - Port 9000 (API)
   - Port 9001 (Console)
5. **Deploy and wait** (~2-3 minutes)
6. **Get Public URL** from Deployments tab
7. **Access Minio Console:**
   - URL: `https://[your-minio-url]:9001`
   - Login with MINIO_ROOT_USER/PASSWORD
8. **Create Bucket:**
   - Name: `astracms-media`
   - Region: `us-east-1`
9. **Set Bucket Policy** (Public Read):
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
10. **Configure CORS:**
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

### Phase 5: Complete Environment Configuration (15 minutes)

1. **Open** `deployment/.env.production`
2. **Verify all service URLs are added:**
   - DATABASE_URL ✓
   - DATABASE_PRIVATE_URL ✓
   - REDIS_URL ✓
   - REDIS_PRIVATE_URL ✓
   - MINIO_ENDPOINT ✓
   - MINIO_PUBLIC_URL ✓
3. **Generate additional secrets** (if running script didn't):
   ```bash
   # BETTER_AUTH_SECRET (if empty)
   openssl rand -base64 32
   
   # MINIO_SECRET_KEY (if you want custom)
   openssl rand -base64 32
   ```
4. **Save all credentials** in password manager
5. **DO NOT commit** `.env.production` to git

### Phase 6: Test All Services (10 minutes)

```bash
# Test PostgreSQL
railway run psql $DATABASE_URL -c "SELECT version();"

# Test Redis
railway run redis-cli -u $REDIS_URL PING

# Test Minio (via browser)
# Open: https://[your-minio-url]:9001
# Upload test file to astracms-media bucket
# Verify public access: https://[your-minio-url]/astracms-media/[filename]
```

---

## 📊 Infrastructure Overview

After completion, you will have:

```
┌─────────────────────────────────────────────────────────┐
│              Railway Project: astracms                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  PostgreSQL  │  │    Redis     │  │    Minio     │ │
│  │   Database   │  │    Cache     │  │   Storage    │ │
│  │              │  │              │  │              │ │
│  │  Port: 5432  │  │  Port: 6379  │  │ Ports: 9000  │ │
│  │              │  │              │  │        9001  │ │
│  │  ~$1-2/mo    │  │   ~$1/mo     │  │  ~$1-2/mo    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  Total Cost: ~$3-5/month (within $5 free credit)       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Checklist

Before proceeding:

- [ ] All credentials saved in password manager
- [ ] `.env.production` added to `.gitignore` (already done)
- [ ] `.env.production` NOT committed to git
- [ ] Strong passwords used for Minio
- [ ] PostgreSQL backups enabled
- [ ] Minio bucket policy reviewed
- [ ] Only necessary ports exposed

---

## 💰 Cost Breakdown

### Hobby Plan ($5/month included)
- **PostgreSQL:** ~$1-2/month
- **Redis:** ~$1/month  
- **Minio:** ~$1-2/month
- **Total:** ~$3-5/month ✅ **Within free credit**

### Pro Plan ($20/month + usage)
- Same services with more resources
- Better for production workloads
- Auto-scaling available
- Recommended for actual production

---

## ✅ Step 2 Completion Checklist

### Infrastructure Setup
- [ ] Railway account created and logged in
- [ ] Railway CLI installed locally
- [ ] Railway project created
- [ ] PostgreSQL service running
- [ ] Redis service running
- [ ] Minio service deployed
- [ ] Minio console accessible
- [ ] Bucket `astracms-media` created
- [ ] Bucket policy set to public read
- [ ] CORS configured on bucket

### Configuration
- [ ] `deployment/.env.production` created
- [ ] All database URLs added
- [ ] All Redis URLs added
- [ ] All Minio URLs added
- [ ] BETTER_AUTH_SECRET generated
- [ ] MINIO_SECRET_KEY set
- [ ] File not committed to git

### Testing
- [ ] PostgreSQL connection tested
- [ ] Redis connection tested
- [ ] Minio console accessible
- [ ] Test file uploaded to bucket
- [ ] Public URL access verified

### Documentation
- [ ] All credentials saved securely
- [ ] Infrastructure documented
- [ ] Service URLs recorded

---

## 🚨 Common Issues & Solutions

### Issue: Railway CLI won't install
**Solution:**
```bash
# Try npm method
npm install -g @railway/cli

# Or download directly
# https://docs.railway.app/develop/cli#installation
```

### Issue: Can't access Minio console
**Solution:**
- Check if port 9001 is exposed
- Verify service is running (green in dashboard)
- Check MINIO_ROOT_USER and MINIO_ROOT_PASSWORD are set

### Issue: PostgreSQL connection refused
**Solution:**
- Use `DATABASE_PRIVATE_URL` for internal connections
- Check service is running in Railway dashboard
- Verify connection string format

### Issue: Bucket files not publicly accessible
**Solution:**
- Verify bucket policy allows `s3:GetObject` for all principals
- Check CORS configuration
- Ensure files are in correct bucket: `astracms-media`

---

## 📁 Files Created in Step 2

```
deployment/
├── .env.production          ← Generated by script (DO NOT COMMIT)
├── plan.txt                 ← Overall plan (Step 1)
├── STEP1-SUMMARY.md        ← Step 1 summary
├── STEP2-GUIDE.md          ← Complete setup guide (NEW)
├── STEP2-QUICKREF.md       ← Quick reference (NEW)
├── STEP2-SUMMARY.md        ← This file (NEW)
└── CHECKLIST.md            ← Master checklist

scripts/
├── migrate-imports.sh       ← Step 1 script
└── setup-railway.sh         ← Step 2 automation (NEW)

railway.toml                 ← Railway config (Step 1)
```

---

## 🔄 What Happens Next (Step 3)

Once Step 2 is complete, you'll proceed to **Step 3: API Migration**

**Step 3 will:**
1. Convert Cloudflare Workers API to Node.js
2. Update API to use Railway services
3. Deploy API service to Railway
4. Configure domain: `api.astracms.com`
5. Test all API endpoints

**Prerequisites for Step 3:**
- ✅ Step 1 complete (rebranding)
- ✅ Step 2 complete (infrastructure)
- ✅ All services running and tested
- ✅ Environment variables configured

---

## 📚 Reference Documentation

### Created Documents
- **Complete Guide:** `deployment/STEP2-GUIDE.md`
- **Quick Reference:** `deployment/STEP2-QUICKREF.md`
- **Automation Script:** `scripts/setup-railway.sh`

### External Resources
- **Railway Docs:** https://docs.railway.app
- **Railway CLI:** https://docs.railway.app/develop/cli
- **Railway Discord:** https://discord.gg/railway
- **Minio Docs:** https://min.io/docs
- **PostgreSQL:** https://www.postgresql.org/docs/
- **Redis:** https://redis.io/documentation

---

## 🎯 Success Criteria

Step 2 is complete when:

1. ✅ All three services (PostgreSQL, Redis, Minio) are running in Railway
2. ✅ All service connections tested successfully
3. ✅ Minio bucket created and configured
4. ✅ `.env.production` file populated with all URLs
5. ✅ All credentials documented and saved securely
6. ✅ Ready to proceed to Step 3

---

## 📞 Need Help?

If you encounter issues:

1. **Check the guides:**
   - `deployment/STEP2-GUIDE.md` for detailed steps
   - `deployment/STEP2-QUICKREF.md` for quick commands

2. **Railway Support:**
   - Discord: https://discord.gg/railway
   - Docs: https://docs.railway.app
   - Status: https://status.railway.app

3. **Review logs:**
   ```bash
   railway logs
   railway status
   ```

---

## 📝 Progress Tracking

### Overall Project Status
- ✅ **Step 1:** COMPLETE - Rebranding
- 📝 **Step 2:** READY - Infrastructure Setup (awaiting user)
- ⏳ **Step 3:** PENDING - API Migration
- ⏳ **Step 4:** PENDING - CMS Deployment
- ⏳ **Step 5:** PENDING - Web Deployment
- ⏳ **Step 6:** PENDING - Domain Configuration
- ⏳ **Step 7:** PENDING - Production Readiness
- ⏳ **Step 8:** PENDING - Testing
- ⏳ **Step 9:** PENDING - Go-Live

### Time Investment So Far
- Step 1: ✅ 30 minutes
- Step 2: 📝 1-2 hours (user action required)

---

## 🚀 Quick Start Summary

**To begin Step 2, run:**

```bash
# Navigate to project
cd /Users/kalana/dev/netronk/astracms

# Run automated setup
./scripts/setup-railway.sh

# Follow the script prompts
# Then complete service setup in Railway dashboard
# Test everything
# Proceed to Step 3
```

---

**Status:** 📝 Documentation Complete - Awaiting User Action  
**Next Action:** Run `./scripts/setup-railway.sh` and follow guide  
**After Completion:** Proceed to Step 3 - API Migration  

**Last Updated:** November 13, 2024