# 🚂 STEP 2: RAILWAY INFRASTRUCTURE SETUP

**Status:** 🔄 IN PROGRESS  
**Estimated Time:** 1-2 hours  
**Prerequisites:** Step 1 Complete ✅

---

## 📋 Overview

This guide will walk you through setting up the complete Railway infrastructure for AstraCMS, including:
- Railway project creation
- PostgreSQL database
- Redis cache
- Minio S3-compatible storage
- Environment variable configuration

---

## 🎯 What You'll Deploy

```
┌─────────────────────────────────────────────────────────┐
│                     Railway Project                      │
│                        AstraCMS                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   CMS App    │  │   API App    │  │   Web App    │ │
│  │  (Next.js)   │  │    (Hono)    │  │  (Next.js)   │ │
│  │              │  │              │  │              │ │
│  │ astracms.com │  │api.astracms  │  │blog.astracms │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                 │          │
│         └─────────────────┼─────────────────┘          │
│                           │                            │
│  ┌────────────────────────┼──────────────────────────┐ │
│  │                        │                          │ │
│  │  ┌──────────┐  ┌───────┴──────┐  ┌────────────┐ │ │
│  │  │PostgreSQL│  │    Redis     │  │   Minio    │ │ │
│  │  │ Database │  │    Cache     │  │  Storage   │ │ │
│  │  └──────────┘  └──────────────┘  └────────────┘ │ │
│  │                                                  │ │
│  └──────────────── Infrastructure ─────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 PART 1: Railway Account & Project Setup

### 1.1 Create Railway Account

1. **Go to Railway:**
   ```
   https://railway.app
   ```

2. **Sign Up Options:**
   - GitHub (Recommended - easier repo connection)
   - Email

3. **Verify Email** (if using email signup)

4. **Choose Plan:**
   - **Hobby Plan** (Free): $5 credit/month
   - **Pro Plan** ($20/month): Better for production
   
   💡 **Recommendation:** Start with Hobby, upgrade when needed

### 1.2 Create New Project

1. **Click "New Project"**

2. **Select "Empty Project"** (don't use templates)

3. **Name Your Project:**
   ```
   astracms-production
   ```
   or
   ```
   astracms
   ```

4. **Project Created!** ✅

---

## 🗄️ PART 2: Database Setup (PostgreSQL)

### 2.1 Add PostgreSQL Database

1. **In Your Project:**
   - Click "+ New"
   - Select "Database"
   - Choose "Add PostgreSQL"

2. **Database Created!**
   - Railway automatically provisions PostgreSQL
   - Connection details generated

### 2.2 Get Database Credentials

1. **Click on PostgreSQL Service**

2. **Go to "Variables" Tab**

3. **Copy These Variables:**
   ```bash
   DATABASE_URL=postgresql://postgres:***@***:5432/railway
   DATABASE_PRIVATE_URL=postgresql://postgres:***@***:5432/railway
   DATABASE_PUBLIC_URL=postgresql://postgres:***@***:5432/railway
   ```

4. **Save These Securely** (we'll use them later)

### 2.3 Configure Database Settings

1. **Click "Settings" Tab**

2. **Recommended Settings:**
   - **Max Connections:** 20 (default)
   - **Shared Buffers:** 128MB
   - **Auto Backups:** Enabled ✅

3. **Health Check:**
   ```sql
   SELECT 1;
   ```

---



## 📦 PART 4: Minio Storage Setup

### 4.1 Deploy Minio Service

**Option A: Using Railway Template (Easiest)**

1. **Add New Service:**
   - Click "+ New"
   - Select "GitHub Repo"
   - Search for "minio" or use Docker image

2. **Use Minio Docker Image:**
   ```
   minio/minio:latest
   ```

3. **Configure Start Command:**
   ```bash
   minio server /data --console-address ":9001"
   ```

**Option B: Manual Docker Deployment**

1. **Create New Service from Docker Image**

2. **Docker Image:**
   ```
   minio/minio:latest
   ```

3. **Set Environment Variables:**
   ```bash
   MINIO_ROOT_USER=minioadmin
   MINIO_ROOT_PASSWORD=<generate-secure-password>
   ```
   
   💡 **Generate Secure Password:**
   ```bash
   openssl rand -base64 32
   ```

4. **Configure Volumes:**
   ```
   /data (persistent storage)
   ```

5. **Expose Ports:**
   - **9000** (API)
   - **9001** (Console)

### 4.2 Configure Minio

1. **Wait for Deployment** (may take 2-3 minutes)

2. **Get Minio URL:**
   - Railway generates a public URL
   - Example: `https://minio-production-xxxx.up.railway.app`

3. **Access Minio Console:**
   - URL: `https://your-minio-url:9001`
   - Username: Value of `MINIO_ROOT_USER`
   - Password: Value of `MINIO_ROOT_PASSWORD`

4. **Create Bucket:**
   - Go to "Buckets"
   - Click "Create Bucket"
   - Name: `astracms-media`
   - Region: `us-east-1`
   - Create ✅

5. **Set Bucket Policy (Public Read):**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "AWS": ["*"]
         },
         "Action": ["s3:GetObject"],
         "Resource": ["arn:aws:s3:::astracms-media/*"]
       }
     ]
   }
   ```

6. **Configure CORS:**
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

### 4.3 Get Minio Credentials

**Save These Variables:**
```bash
MINIO_ENDPOINT=https://your-minio-url.up.railway.app
MINIO_ACCESS_KEY=minioadmin (or your custom key)
MINIO_SECRET_KEY=your-secure-password
MINIO_BUCKET_NAME=astracms-media
MINIO_PUBLIC_URL=https://your-minio-url.up.railway.app/astracms-media
```

---

## 🔐 PART 5: Environment Variables Setup

### 5.1 Generate Required Secrets

**On Your Local Machine:**

```bash
# Generate BETTER_AUTH_SECRET (32 bytes)
openssl rand -base64 32

# Generate MINIO_SECRET_KEY (if not using default)
openssl rand -base64 32

# Generate API Keys for various services
openssl rand -hex 32
```

### 5.2 Required Environment Variables List

Create a file: `deployment/.env.production` (DO NOT COMMIT)

```bash
# ================================================
# DATABASE (from Railway PostgreSQL)
# ================================================
DATABASE_URL=postgresql://postgres:***@***:5432/railway
DATABASE_PRIVATE_URL=postgresql://postgres:***@***:5432/railway

# ================================================
# REDIS (Upstash Redis - manually configured)
# ================================================
UPSTASH_REDIS_URL=your_upstash_redis_url
UPSTASH_REDIS_TOKEN=your_upstash_redis_token

# ================================================
# AUTHENTICATION
# ================================================
BETTER_AUTH_SECRET=<generated-32-byte-secret>
BETTER_AUTH_URL=https://astracms.com

# ================================================
# OAUTH - GOOGLE
# ================================================
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ================================================
# OAUTH - GITHUB
# ================================================
GITHUB_ID=your-github-app-id
GITHUB_SECRET=your-github-app-secret

# ================================================
# EMAIL (RESEND)
# ================================================
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx

# ================================================
# BILLING (POLAR)
# ================================================
POLAR_ACCESS_TOKEN=polar_xxxxxxxxxxxxx
POLAR_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxx
POLAR_SUCCESS_URL=https://astracms.com/api/polar/success?checkout_id={CHECKOUT_ID}
POLAR_HOBBY_PRODUCT_ID=prod_xxxxxxxxxxxxxxxx
POLAR_PRO_PRODUCT_ID=prod_xxxxxxxxxxxxxxxx
POLAR_TEAM_PRODUCT_ID=prod_xxxxxxxxxxxxxxxx

# ================================================
# APPLICATION URLS
# ================================================
NEXT_PUBLIC_APP_URL=https://astracms.com
ASTRACMS_API_URL=https://api.astracms.com/v1

# ================================================
# STORAGE (MINIO)
# ================================================
MINIO_ENDPOINT=https://your-minio-url.up.railway.app
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=<your-secure-password>
MINIO_BUCKET_NAME=astracms-media
MINIO_PUBLIC_URL=https://your-minio-url.up.railway.app/astracms-media

# ================================================
# WEBHOOKS (QSTASH)
# ================================================
QSTASH_TOKEN=qstash_xxxxxxxxxxxxxxxxxxxxxxxx

# ================================================
# AI (OPTIONAL)
# ================================================
AI_GATEWAY_API_KEY=your-ai-gateway-key

# ================================================
# NODE ENVIRONMENT
# ================================================
NODE_ENV=production
PORT=3000
```

---

## 🎛️ PART 6: Service Configuration

### 6.1 Prepare for Service Deployment

Before deploying apps, we need to:

1. **Connect GitHub Repository**
2. **Configure Build Settings**
3. **Set Environment Variables**

### 6.2 Connect GitHub Repository

1. **In Railway Project:**
   - Click "+ New"
   - Select "GitHub Repo"
   - Authorize Railway to access your repos
   - Select `astracms` repository

2. **Don't Deploy Yet!**
   - Railway will try to auto-detect and deploy
   - We need to configure first

---

## 📊 PART 7: Verify Infrastructure

### 7.1 Check All Services

**Your Railway Dashboard Should Show:**

```
✅ PostgreSQL     - Running (Green)
✅ Minio          - Running (Green)
```

### 7.2 Test Database Connection

**Using Railway CLI:**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Connect to PostgreSQL
railway run psql $DATABASE_URL

# Test query
SELECT version();

# Exit
\q
```



### 7.4 Test Minio Storage

**Using Browser:**

1. **Access Minio Console:**
   ```
   https://your-minio-url.up.railway.app:9001
   ```

2. **Login with credentials**

3. **Verify Bucket Exists:**
   - Should see `astracms-media` bucket
   - Status: Active

4. **Test Upload:**
   - Click on bucket
   - Click "Upload"
   - Upload a test image
   - Verify it's accessible via:
     ```
     https://your-minio-url.up.railway.app/astracms-media/test-image.jpg
     ```

---

## 🔍 PART 8: Infrastructure Checklist

### Pre-Deployment Verification

- [ ] Railway account created
- [ ] Project created: `astracms-production`
- [ ] PostgreSQL service running
- [ ] Minio service running
- [ ] Minio bucket `astracms-media` created
- [ ] Bucket policy set to public read
- [ ] CORS configured on Minio
- [ ] All database credentials saved
- [ ] All Minio credentials saved
- [ ] `.env.production` file created locally
- [ ] All required secrets generated
- [ ] GitHub repository connected to Railway

---

## 💰 PART 9: Cost Estimation

### Railway Pricing (as of 2024)

**Hobby Plan ($5/month credit):**
- PostgreSQL: ~$1-2/month
- Minio: ~$1-2/month
- **Estimate:** $2-4/month (within free credit)

**Pro Plan ($20/month + usage):**
- Includes more resources
- Better for production workloads
- Scales automatically

**Cost-Saving Tips:**
1. Start with Hobby plan
2. Monitor resource usage
3. Optimize database queries
4. Use caching effectively
5. Upgrade only when needed

---

## 🚨 Troubleshooting

### PostgreSQL Issues

**Problem:** Can't connect to database
```bash
# Check connection string format
echo $DATABASE_URL

# Should be: postgresql://user:pass@host:port/db

# Test with psql
psql $DATABASE_URL
```

**Solution:**
- Use `DATABASE_PRIVATE_URL` for internal connections
- Verify credentials in Railway dashboard



### Minio Issues

**Problem:** Can't access Minio console

**Solution:**
1. Check Minio service logs in Railway
2. Verify ports 9000 and 9001 are exposed
3. Check MINIO_ROOT_USER and MINIO_ROOT_PASSWORD set correctly

**Problem:** Bucket not accessible publicly

**Solution:**
1. Set bucket policy to allow GetObject
2. Enable anonymous access in bucket settings
3. Verify CORS configuration

---

## 📝 PART 10: Document Your Setup

### Create Infrastructure Document

**File:** `deployment/infrastructure.md`

```markdown
# AstraCMS Production Infrastructure

## Railway Project
- **Project ID:** [your-project-id]
- **URL:** https://railway.app/project/[project-id]

## Services

### PostgreSQL
- **Connection:** [saved in password manager]
- **Backups:** Automatic (Railway)
- **Version:** 15



### Minio
- **Console:** [minio-url]:9001
- **Endpoint:** [minio-url]
- **Bucket:** astracms-media
- **Region:** us-east-1

## Domain Configuration (Pending Step 7)
- astracms.com → CMS
- api.astracms.com → API
- blog.astracms.com → Web
- storage.astracms.com → Minio
```

---

## ✅ Step 2 Completion Checklist

Before proceeding to Step 3, verify:

- [ ] Railway project created and accessible
- [ ] PostgreSQL running and tested
- [ ] Minio running and tested
- [ ] Minio bucket created and configured
- [ ] Bucket policy set to public read
- [ ] CORS configured on Minio
- [ ] All database credentials documented securely
- [ ] All Minio credentials saved
- [ ] `.env.production` file created
- [ ] Infrastructure costs understood
- [ ] GitHub repository connected to Railway
- [ ] Railway CLI installed and authenticated

---

## 🎯 Next Steps

**STEP 3: API Migration to Node.js**

Now that infrastructure is ready, we'll:
1. Convert Cloudflare Workers API to Node.js
2. Deploy API service to Railway
3. Configure custom domain
4. Test API endpoints

**Ready to proceed?** 

```bash
# Your infrastructure is ready! 🎉
# Save all credentials securely
# Review the checklist above
# Proceed to Step 3 when ready
```

---

## 📞 Support Resources

### Railway
- **Docs:** https://docs.railway.app
- **Discord:** https://discord.gg/railway
- **Status:** https://status.railway.app

### Minio
- **Docs:** https://min.io/docs
- **GitHub:** https://github.com/minio/minio
- **Community:** https://min.io/community

---

**Last Updated:** November 13, 2024  
**Status:** Infrastructure Setup Guide  
**Next:** Step 3 - API Migration