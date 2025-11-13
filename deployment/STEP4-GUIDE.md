# 🎨 STEP 4: CMS APPLICATION DEPLOYMENT

**Status:** 📝 **READY TO DEPLOY**  
**Date Created:** November 13, 2024  
**Estimated Time:** 1-2 hours  
**Prerequisites:** Step 1 ✅ | Step 2 ✅ | Step 3 ✅

---

## 📋 Overview

Deploy the Next.js CMS application to Railway. This is the main admin dashboard where users will manage their content, media, and workspace settings.

---

## ✅ What We're Deploying

### AstraCMS Admin Dashboard
- **Framework:** Next.js 16 with App Router
- **Features:**
  - User authentication (Better Auth)
  - Content management (posts, categories, tags, authors)
  - Media library with S3 storage
  - AI-powered editor
  - Team collaboration
  - Webhook management
  - Analytics dashboard
  - Billing integration (Polar)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CMS Application                        │
│                  (astracms.com)                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Next.js 16 App Router                  │  │
│  │                                                   │  │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────┐ │  │
│  │  │   Auth     │  │  Content   │  │   Media   │ │  │
│  │  │ (Better)   │  │  Editor    │  │ (S3/Minio)│ │  │
│  │  └────────────┘  └────────────┘  └───────────┘ │  │
│  │                                                   │  │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────┐ │  │
│  │  │  Webhooks  │  │ Analytics  │  │  Billing  │ │  │
│  │  └────────────┘  └────────────┘  └───────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│                           │                             │
│                           ▼                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │     PostgreSQL    │    Redis    │     Minio      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Pre-Deployment Configuration

### 1. Update Next.js Configuration

✅ **Already completed in `apps/cms/next.config.ts`:**
- Added `output: "standalone"` for optimized Docker deployment
- Configured image domains for Minio/Railway
- Set up server actions body size limit
- Configured remote image patterns

### 2. Environment Variables Setup

Create `apps/cms/.env.production` (DO NOT COMMIT):

```bash
# ================================================
# DATABASE (from Railway PostgreSQL)
# ================================================
DATABASE_URL=${POSTGRESQL.DATABASE_URL}
DATABASE_PRIVATE_URL=${POSTGRESQL.DATABASE_PRIVATE_URL}

# ================================================
# AUTHENTICATION
# ================================================
BETTER_AUTH_SECRET=<32-byte-secret-from-step-2>
BETTER_AUTH_URL=https://astracms.com

# ================================================
# OAUTH - GOOGLE
# ================================================
# Create at: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret

# Authorized redirect URIs:
# - https://astracms.com/api/auth/callback/google

# ================================================
# OAUTH - GITHUB
# ================================================
# Create at: https://github.com/settings/developers
GITHUB_ID=your-github-oauth-app-id
GITHUB_SECRET=your-github-oauth-app-secret

# Authorization callback URL:
# - https://astracms.com/api/auth/callback/github

# ================================================
# EMAIL (RESEND)
# ================================================
# Get key from: https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx

# ================================================
# BILLING (POLAR)
# ================================================
# Get from: https://polar.sh/dashboard
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

# ================================================
# STORAGE (MINIO - from Step 2)
# ================================================
MINIO_ENDPOINT=https://storage.astracms.com
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=<from-step-2>
MINIO_BUCKET_NAME=astracms-media
MINIO_PUBLIC_URL=https://storage.astracms.com/astracms-media

# ================================================
# REDIS (from Railway Redis)
# ================================================
REDIS_URL=${REDIS.REDIS_URL}
REDIS_TOKEN=${REDIS.REDIS_TOKEN}

# ================================================
# WEBHOOKS (QSTASH - UPSTASH)
# ================================================
# Get from: https://upstash.com/
QSTASH_TOKEN=qstash_xxxxxxxxxxxxxxxxxxxxxxxx

# ================================================
# AI (OPTIONAL)
# ================================================
AI_GATEWAY_API_KEY=your-ai-gateway-key

# ================================================
# NODE ENVIRONMENT
# ================================================
NODE_ENV=production
```

---

## 🚀 OAuth Setup (Required)

### Google OAuth Setup

1. **Go to Google Cloud Console**
   - URL: https://console.cloud.google.com/apis/credentials

2. **Create OAuth 2.0 Client ID**
   - Application type: Web application
   - Name: AstraCMS Production
   
3. **Authorized JavaScript origins:**
   ```
   https://astracms.com
   ```

4. **Authorized redirect URIs:**
   ```
   https://astracms.com/api/auth/callback/google
   ```

5. **Copy credentials:**
   - Client ID → `GOOGLE_CLIENT_ID`
   - Client Secret → `GOOGLE_CLIENT_SECRET`

### GitHub OAuth Setup

1. **Go to GitHub Developer Settings**
   - URL: https://github.com/settings/developers
   - Click "New OAuth App"

2. **Application Details:**
   - Application name: AstraCMS Production
   - Homepage URL: `https://astracms.com`
   - Authorization callback URL: `https://astracms.com/api/auth/callback/github`

3. **Copy credentials:**
   - Client ID → `GITHUB_ID`
   - Client Secret → `GITHUB_SECRET`

---

## 🔨 Build & Test Locally

### 1. Install Dependencies

```bash
cd apps/cms
pnpm install
```

### 2. Set Up Local Environment

```bash
# Copy example env
cp .env.example .env.local

# Edit with your local values
nano .env.local
```

### 3. Run Database Migrations

```bash
# From project root
cd packages/db
pnpm db:push

# Or run migrations
pnpm db:migrate
pnpm db:deploy
```

### 4. Start Development Server

```bash
cd apps/cms
pnpm dev
```

### 5. Test Application

```bash
# Open browser
open http://localhost:3000

# Test pages:
✓ Login page
✓ Register page
✓ OAuth flows
✓ Dashboard
✓ Media upload
✓ Post editor
```

### 6. Build for Production

```bash
cd apps/cms
pnpm build

# Check build output
ls -la .next/standalone
```

---

## 📤 Deploy to Railway

### Method 1: Railway Dashboard (Recommended)

#### Step 1: Create CMS Service

1. **In Railway Dashboard:**
   - Open `astracms-production` project
   - Click "+ New"
   - Select "GitHub Repo"
   - Choose your `astracms` repository

2. **Configure Service:**
   - **Name:** `astracms-cms`
   - **Root Directory:** Leave empty (Railway detects monorepo)
   - **Build Command:** 
     ```bash
     cd apps/cms && pnpm install && pnpm build
     ```
   - **Start Command:**
     ```bash
     cd apps/cms && pnpm start
     ```
   - **Port:** `3000`

#### Step 2: Add Environment Variables

Click "Variables" tab and add all variables from `.env.production`:

**Critical Variables:**
```bash
# Database
DATABASE_URL=${{POSTGRESQL.DATABASE_URL}}
DATABASE_PRIVATE_URL=${{POSTGRESQL.DATABASE_PRIVATE_URL}}

# Auth
BETTER_AUTH_SECRET=<paste-from-step-2>
BETTER_AUTH_URL=https://astracms.com

# Node
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://astracms.com

# Storage
MINIO_ENDPOINT=https://storage.astracms.com
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=<paste-from-step-2>
MINIO_BUCKET_NAME=astracms-media
MINIO_PUBLIC_URL=https://storage.astracms.com/astracms-media

# Redis
REDIS_URL=${{REDIS.REDIS_URL}}
REDIS_TOKEN=${{REDIS.REDIS_TOKEN}}
```

**OAuth Variables:**
```bash
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>
GITHUB_ID=<from-github>
GITHUB_SECRET=<from-github>
```

**Optional Variables:**
```bash
RESEND_API_KEY=<if-using-email>
POLAR_ACCESS_TOKEN=<if-using-billing>
QSTASH_TOKEN=<if-using-webhooks>
AI_GATEWAY_API_KEY=<if-using-ai>
```

#### Step 3: Configure Settings

**In "Settings" tab:**

1. **Health Check:**
   - Path: `/api/health`
   - Timeout: 60 seconds
   - Interval: 120 seconds

2. **Resources:**
   - CPU: 1 vCPU
   - Memory: 2GB
   - Storage: 2GB

3. **Networking:**
   - Generate domain (temporary)
   - Note the URL for testing

#### Step 4: Deploy

1. **Click "Deploy"**
2. **Monitor deployment logs**
3. **Wait for build completion (~5-10 minutes)**
4. **Check deployment status**

#### Step 5: Run Database Migrations

**After first deployment:**

```bash
# Using Railway CLI
railway run --service astracms-cms pnpm db:deploy

# Or SSH into service
railway shell --service astracms-cms
cd packages/db
pnpm db:deploy
```

#### Step 6: Add Custom Domain

1. **In "Networking" tab:**
   - Click "Add Domain"
   - Enter: `astracms.com`
   - Also add: `www.astracms.com`

2. **Configure DNS (at your domain registrar):**
   ```
   Type: A
   Name: @
   Value: [Railway IP from dashboard]
   
   Type: CNAME
   Name: www
   Value: astracms.com
   ```

3. **Wait for DNS propagation (5-30 minutes)**

4. **SSL Certificate:**
   - Railway auto-generates Let's Encrypt cert
   - Wait for "Issued" status

---

### Method 2: Railway CLI

```bash
# From project root
cd /Users/kalana/dev/netronk/astracms

# Link to project
railway link

# Set service
railway service astracms-cms

# Add environment variables
railway variables set DATABASE_URL=${{POSTGRESQL.DATABASE_URL}}
railway variables set BETTER_AUTH_SECRET=<your-secret>
# ... add all other variables

# Deploy
railway up

# View logs
railway logs --follow

# Open in browser
railway open
```

---

## 🧪 Testing Checklist

### Post-Deployment Testing

#### Health & Status
- [ ] Service deployed successfully
- [ ] Health check endpoint responds: `GET /api/health`
- [ ] No errors in Railway logs
- [ ] SSL certificate active (https://)

#### Authentication
- [ ] Registration page loads
- [ ] User can register with email
- [ ] Email verification works (if RESEND configured)
- [ ] Login page loads
- [ ] User can login with email
- [ ] Google OAuth works
- [ ] GitHub OAuth works
- [ ] Logout works
- [ ] Session persistence works

#### Core Features
- [ ] Dashboard loads
- [ ] Workspace creation works
- [ ] Post editor loads
- [ ] Can create new post
- [ ] Can save draft
- [ ] Can publish post
- [ ] Rich text editor works
- [ ] AI features work (if configured)

#### Media Management
- [ ] Media library loads
- [ ] Can upload image
- [ ] Can upload video
- [ ] Image displays from Minio
- [ ] Can delete media
- [ ] Presigned URLs work

#### Database
- [ ] Database connection successful
- [ ] Queries execute without errors
- [ ] Migrations applied
- [ ] Data persists correctly

#### Redis
- [ ] Redis connection successful
- [ ] Session storage works
- [ ] Rate limiting works
- [ ] Cache invalidation works

---

## 🔍 Monitoring & Debugging

### View Logs

```bash
# Real-time logs
railway logs --service astracms-cms --follow

# Filter errors
railway logs --service astracms-cms | grep ERROR

# Last 100 lines
railway logs --service astracms-cms --lines 100
```

### Common Issues & Solutions

#### Issue: Build fails with memory error
```bash
# Solution: Increase memory in Railway settings
# Go to Settings → Resources → Memory: 2GB or higher
```

#### Issue: Database connection refused
```bash
# Solution: Use DATABASE_PRIVATE_URL for internal connections
# Check Railway variable interpolation: ${{POSTGRESQL.DATABASE_PRIVATE_URL}}
```

#### Issue: Images not loading
```bash
# Solution: Check Minio configuration
1. Verify bucket exists: astracms-media
2. Check bucket policy is public
3. Verify MINIO_ENDPOINT and MINIO_PUBLIC_URL
4. Check CORS configuration
```

#### Issue: OAuth redirect mismatch
```bash
# Solution: Update OAuth app redirect URIs
Google: https://astracms.com/api/auth/callback/google
GitHub: https://astracms.com/api/auth/callback/github

# Ensure BETTER_AUTH_URL matches domain
BETTER_AUTH_URL=https://astracms.com
```

#### Issue: 502 Bad Gateway
```bash
# Solution: Check service is running
1. View logs for errors
2. Verify PORT is set correctly (3000)
3. Check health check endpoint
4. Restart service if needed
```

#### Issue: Environment variables not loading
```bash
# Solution: Verify Railway variable format
# Use ${{SERVICE.VARIABLE}} for cross-service references
DATABASE_URL=${{POSTGRESQL.DATABASE_URL}}

# Or set direct values
BETTER_AUTH_SECRET=your-secret-here
```

---

## 📊 Performance Optimization

### Build Optimization

```typescript
// next.config.ts already optimized with:
- output: "standalone"           // Optimized Docker build
- transpilePackages              // Monorepo support
- Image optimization enabled
- Server actions configured
```

### Caching Strategy

```typescript
// Railway auto-caches:
- Node modules
- Next.js build cache
- Static assets
```

### Database Connection Pooling

```typescript
// Prisma already configured for pooling
// Check packages/db/src/client.ts
```

---

## 🔐 Security Checklist

### Pre-Production Security

- [ ] All secrets rotated for production
- [ ] BETTER_AUTH_SECRET is unique and secure (32+ bytes)
- [ ] OAuth apps restricted to production domains only
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] HTTPS enforced everywhere
- [ ] Security headers configured (Next.js default)
- [ ] No sensitive data in logs
- [ ] Environment variables not committed to git

### OAuth Security

- [ ] Redirect URIs match exactly
- [ ] No wildcards in OAuth configurations
- [ ] Client secrets never exposed to client
- [ ] State parameter validation enabled (Better Auth default)

### API Security

- [ ] API keys stored as environment variables
- [ ] Database credentials secured
- [ ] Redis credentials secured
- [ ] Webhook secrets validated

---

## 💰 Cost Estimation

### Railway Resources

**CMS Service (Recommended):**
- CPU: 1 vCPU
- Memory: 2GB
- Storage: 2GB
- Estimated: $5-10/month

**With all services (from Steps 2-4):**
- PostgreSQL: $1-2/month
- Redis: $1/month
- Minio: $1-2/month
- API: $2-3/month
- CMS: $5-10/month
- **Total: ~$10-18/month**

**Pro Plan Benefits:**
- More resources
- Priority support
- Better performance
- Recommended for production

---

## 📁 File Structure

```
apps/cms/
├── next.config.ts           ✏️ Updated for Railway
├── package.json             ✓ Ready
├── .env.example             ✓ Template
├── .env.production          ⚠️ Create (DO NOT COMMIT)
├── public/                  ✓ Static assets
├── src/
│   ├── app/                 ✓ App Router pages
│   ├── components/          ✓ UI components
│   ├── lib/                 ✓ Utilities
│   │   ├── auth/            ✓ Better Auth config
│   │   ├── s3.ts            ✓ Minio configuration
│   │   └── actions/         ✓ Server actions
│   └── styles/              ✓ Global styles
└── .next/                   📦 Build output (gitignored)
```

---

## 🎯 Success Criteria

Step 4 is complete when:

1. [ ] CMS service deployed to Railway
2. [ ] Custom domain configured (astracms.com)
3. [ ] SSL certificate active
4. [ ] All health checks passing
5. [ ] Database migrations applied
6. [ ] OAuth authentication working
7. [ ] Media uploads working
8. [ ] Post creation working
9. [ ] No errors in production logs
10. [ ] Ready for production use

---

## 🔄 Next Steps: STEP 5

Once CMS is deployed and tested, proceed to **Step 5: Web Application Deployment**

**Step 5 will:**
1. Deploy Next.js/Astro web app to Railway
2. Configure domain: `blog.astracms.com`
3. Connect to deployed API
4. Test content fetching
5. Verify public blog functionality

---

## 📞 Support & Resources

### Railway
- **Docs:** https://docs.railway.app
- **Next.js Guide:** https://docs.railway.app/guides/nextjs
- **Discord:** https://discord.gg/railway

### Next.js
- **Docs:** https://nextjs.org/docs
- **Deployment:** https://nextjs.org/docs/deployment
- **App Router:** https://nextjs.org/docs/app

### Better Auth
- **Docs:** https://www.better-auth.com/docs
- **OAuth:** https://www.better-auth.com/docs/authentication/oauth

### Troubleshooting
- Check Railway logs: `railway logs --service astracms-cms`
- Test locally first: `pnpm dev`
- Verify environment variables: `railway variables`
- Check database: `railway run psql $DATABASE_URL`

---

## 📝 Deployment Commands Summary

```bash
# Local Development
cd apps/cms
pnpm install
pnpm dev

# Build Test
pnpm build

# Database Migrations
cd ../../packages/db
pnpm db:push
pnpm db:deploy

# Deploy to Railway (CLI)
railway link
railway up --service astracms-cms

# View Deployment
railway open --service astracms-cms

# Monitor Logs
railway logs --service astracms-cms --follow

# Check Status
railway status --service astracms-cms
```

---

## ✅ Step 4 Status: READY TO DEPLOY

**Configuration complete!** The CMS is now ready for Railway deployment with:
- ✅ Next.js configured for production
- ✅ Environment variables documented
- ✅ OAuth setup guide provided
- ✅ Database migrations ready
- ✅ Minio storage configured
- ✅ Build optimization enabled
- ✅ Health checks configured
- ✅ Security best practices applied

**Follow the guide above to deploy!** 🚀

---

**Last Updated:** November 13, 2024  
**Status:** Ready for Deployment  
**Next:** Step 5 - Web Application Deployment