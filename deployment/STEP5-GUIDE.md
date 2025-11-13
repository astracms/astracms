# 🌐 STEP 5: WEB APPLICATION DEPLOYMENT

**Status:** 📝 **READY TO DEPLOY**  
**Date Created:** November 13, 2024  
**Estimated Time:** 1 hour  
**Prerequisites:** Steps 1, 2, 3, 4 Complete ✅

---

## 📋 Overview

Deploy the public-facing Astro blog/website to Railway. This is where visitors will read your blog posts, changelogs, and other public content fetched from the AstraCMS API.

---

## ✅ What Was Configured

### 1. Astro Configuration Updated
✅ **Updated `apps/web/astro.config.mjs`**
- Changed adapter from `@astrojs/vercel` to `@astrojs/node`
- Set output mode to `server` (SSR)
- Changed site URL to `https://blog.astracms.com`
- Added image domains for Minio/Railway
- Configured standalone mode for Railway
- Set port to 3001

### 2. Package Configuration
✅ **Updated `apps/web/package.json`**
- Replaced `@astrojs/vercel` with `@astrojs/node`
- Added `start` script for production
- Configured for Node.js deployment

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│             Web Application                              │
│          (blog.astracms.com)                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Astro 5 (SSR Mode)                     │  │
│  │                                                   │  │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────┐ │  │
│  │  │   Blog     │  │ Changelog  │  │Contributors│ │  │
│  │  │   Posts    │  │   Feed     │  │   Page    │ │  │
│  │  └────────────┘  └────────────┘  └───────────┘ │  │
│  │                                                   │  │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────┐ │  │
│  │  │    RSS     │  │  Sitemap   │  │    SEO    │ │  │
│  │  └────────────┘  └────────────┘  └───────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│                           │                             │
│                           ▼                             │
│              AstraCMS API (api.astracms.com)           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Environment Variables

### Required Variables

Create `apps/web/.env.production`:

```bash
# ================================================
# ASTRACMS API CONFIGURATION
# ================================================
ASTRACMS_WORKSPACE_KEY=your-workspace-id
ASTRACMS_API_URL=https://api.astracms.com/v1

# ================================================
# BUILD CONFIGURATION
# ================================================
# Set to false to fetch data during build
# Set to true to skip API calls during build (faster builds)
SKIP_API_FETCH_ON_BUILD=false

# ================================================
# NODE ENVIRONMENT
# ================================================
NODE_ENV=production
PORT=3001

# ================================================
# SITE CONFIGURATION
# ================================================
PUBLIC_SITE_URL=https://blog.astracms.com
```

### Getting Your Workspace Key

1. **Deploy CMS first** (Step 4 must be complete)
2. **Login to CMS** at https://astracms.com
3. **Go to Settings** → General
4. **Copy Workspace ID** from settings page
5. **Add to environment variables** as `ASTRACMS_WORKSPACE_KEY`

---

## 🚀 Local Testing

### 1. Install Dependencies

```bash
cd apps/web
pnpm install
```

### 2. Set Up Environment

```bash
# Copy example env
cp .env.example .env.local

# Edit with your values
nano .env.local

# Add your workspace key
ASTRACMS_WORKSPACE_KEY=your-workspace-id
ASTRACMS_API_URL=http://localhost:8000/v1  # or production URL
```

### 3. Start Development Server

```bash
pnpm dev
```

### 4. Test Application

```bash
# Open browser
open http://localhost:4321

# Test pages:
✓ Home page
✓ Blog listing
✓ Individual post
✓ Changelog
✓ Contributors
✓ RSS feed (/rss.xml)
✓ Sitemap (/sitemap-index.xml)
```

### 5. Build Test

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview

# Test at http://localhost:4321
```

---

## 📤 Deploy to Railway

### Method 1: Railway Dashboard (Recommended)

#### Step 1: Create Web Service

1. **In Railway Dashboard:**
   - Open `astracms-production` project
   - Click "+ New"
   - Select "GitHub Repo"
   - Choose your `astracms` repository

2. **Configure Service:**
   - **Name:** `astracms-web`
   - **Root Directory:** Leave empty (monorepo auto-detected)
   - **Build Command:**
     ```bash
     cd apps/web && pnpm install && pnpm build
     ```
   - **Start Command:**
     ```bash
     cd apps/web && pnpm start
     ```
   - **Port:** `3001`

#### Step 2: Add Environment Variables

Click "Variables" tab and add:

```bash
# Required
ASTRACMS_WORKSPACE_KEY=your-workspace-id
ASTRACMS_API_URL=https://api.astracms.com/v1
NODE_ENV=production
PORT=3001
PUBLIC_SITE_URL=https://blog.astracms.com

# Optional
SKIP_API_FETCH_ON_BUILD=false
```

#### Step 3: Configure Settings

**In "Settings" tab:**

1. **Health Check:**
   - Path: `/`
   - Timeout: 30 seconds
   - Interval: 60 seconds

2. **Resources:**
   - CPU: 0.5 vCPU
   - Memory: 512MB
   - Storage: 1GB

3. **Networking:**
   - Generate domain (temporary)
   - Note the URL for testing

#### Step 4: Deploy

1. **Click "Deploy"**
2. **Monitor deployment logs**
3. **Wait for build completion (~3-5 minutes)**
4. **Check deployment status**

#### Step 5: Add Custom Domain

1. **In "Networking" tab:**
   - Click "Add Domain"
   - Enter: `blog.astracms.com`

2. **Configure DNS (at your domain registrar):**
   ```
   Type: CNAME
   Name: blog
   Value: [Railway-provided-URL]
   TTL: 3600
   ```

3. **Wait for DNS propagation (5-30 minutes)**

4. **SSL Certificate:**
   - Railway auto-generates Let's Encrypt cert
   - Wait for "Issued" status

#### Step 6: Test Deployment

```bash
# Test health
curl https://blog.astracms.com/

# Test RSS feed
curl https://blog.astracms.com/rss.xml

# Test sitemap
curl https://blog.astracms.com/sitemap-index.xml

# View in browser
open https://blog.astracms.com
```

---

### Method 2: Railway CLI

```bash
# From project root
cd /Users/kalana/dev/netronk/astracms

# Link to project
railway link

# Create new service
railway service create astracms-web

# Set service
railway service astracms-web

# Add environment variables
railway variables set ASTRACMS_WORKSPACE_KEY=your-workspace-id
railway variables set ASTRACMS_API_URL=https://api.astracms.com/v1
railway variables set NODE_ENV=production
railway variables set PORT=3001

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
- [ ] Home page loads
- [ ] No errors in Railway logs
- [ ] SSL certificate active (https://)
- [ ] Custom domain working

#### Content Fetching
- [ ] Blog posts display
- [ ] Post detail pages work
- [ ] Changelog displays
- [ ] Authors page works
- [ ] Categories/tags work
- [ ] Images load from Minio

#### SEO & Performance
- [ ] RSS feed generates: `/rss.xml`
- [ ] Sitemap generates: `/sitemap-index.xml`
- [ ] Meta tags present
- [ ] Open Graph tags work
- [ ] Page load time acceptable (<3s)

#### API Integration
- [ ] API connection successful
- [ ] Content fetches correctly
- [ ] Error handling works (if API down)
- [ ] Rate limiting respected

---

## 🔍 Monitoring & Debugging

### View Logs

```bash
# Real-time logs
railway logs --service astracms-web --follow

# Filter errors
railway logs --service astracms-web | grep ERROR

# Last 100 lines
railway logs --service astracms-web --lines 100
```

### Common Issues & Solutions

#### Issue: Build fails with module not found
```bash
# Solution: Ensure @astrojs/node is installed
cd apps/web
pnpm add @astrojs/node
pnpm build
```

#### Issue: API connection fails
```bash
# Solution: Check API URL and workspace key
1. Verify ASTRACMS_API_URL is correct
2. Test API endpoint: curl https://api.astracms.com/v1/[workspace]/posts
3. Check workspace key is valid
4. Ensure API service is running
```

#### Issue: Images not loading
```bash
# Solution: Check image domains in astro.config.mjs
1. Verify storage.astracms.com in image.domains
2. Check Minio is accessible
3. Verify image URLs in content
```

#### Issue: Build hangs or times out
```bash
# Solution: Set SKIP_API_FETCH_ON_BUILD=true
# This skips API calls during build
# Content will be fetched at runtime instead
SKIP_API_FETCH_ON_BUILD=true
```

#### Issue: 404 on all pages
```bash
# Solution: Check adapter and output mode
1. Verify adapter: node({ mode: "standalone" })
2. Verify output: "server"
3. Check start command points to correct entry file
```

#### Issue: Port binding error
```bash
# Solution: Ensure PORT environment variable is set
PORT=3001

# Or check Railway auto-assigns PORT
# Use process.env.PORT in production
```

---

## 📊 Performance Optimization

### Build Optimization

```javascript
// astro.config.mjs already optimized with:
- Node adapter with standalone mode
- Sharp for image optimization
- Sitemap generation
- RSS feed generation
```

### Caching Strategy

```bash
# Railway auto-caches:
- Node modules
- Astro build output
- Static assets
```

### API Request Optimization

```javascript
// Use SKIP_API_FETCH_ON_BUILD wisely:
// - false: Static content, faster pages (recommended)
// - true: Dynamic content, slower initial load
```

---

## 🔐 Security Checklist

### Pre-Production Security

- [ ] ASTRACMS_WORKSPACE_KEY secured
- [ ] API URL uses HTTPS
- [ ] No sensitive data in public routes
- [ ] CORS properly configured on API
- [ ] Rate limiting in place
- [ ] Environment variables not committed

### Content Security

- [ ] User-generated content sanitized
- [ ] XSS protection enabled
- [ ] Safe image loading
- [ ] External links use rel="noopener"

---

## 💰 Cost Estimation

### Railway Resources

**Web Service (Recommended):**
- CPU: 0.5 vCPU
- Memory: 512MB
- Storage: 1GB
- Estimated: $2-3/month

**Total Project Cost (All Services):**
- PostgreSQL: $1-2/month
- Redis: $1/month
- Minio: $1-2/month
- API: $2-3/month
- CMS: $5-10/month
- Web: $2-3/month
- **Total: ~$12-21/month**

---

## 📁 File Structure

```
apps/web/
├── astro.config.mjs         ✏️ Updated for Railway
├── package.json             ✏️ Updated dependencies
├── .env.example             ✓ Template
├── .env.production          ⚠️ Create (DO NOT COMMIT)
├── public/                  ✓ Static assets
├── src/
│   ├── pages/               ✓ Route pages
│   ├── layouts/             ✓ Page layouts
│   ├── components/          ✓ UI components
│   ├── lib/                 ✓ Utilities & API client
│   └── styles/              ✓ Global styles
└── dist/                    📦 Build output (gitignored)
```

---

## 🎯 Success Criteria

Step 5 is complete when:

1. [ ] Web service deployed to Railway
2. [ ] Custom domain configured (blog.astracms.com)
3. [ ] SSL certificate active
4. [ ] Home page loads successfully
5. [ ] Blog posts display correctly
6. [ ] API integration working
7. [ ] Images loading from Minio
8. [ ] RSS feed accessible
9. [ ] Sitemap generating
10. [ ] No errors in production logs

---

## 🔄 Next Steps: STEP 6

Once Web is deployed and tested, proceed to **Step 6: Final Configuration & Testing**

**Step 6 will:**
1. Verify all domains configured
2. Complete end-to-end testing
3. Performance optimization
4. Security hardening
5. Monitoring setup
6. Documentation finalization

---

## 📞 Support & Resources

### Astro
- **Docs:** https://docs.astro.build
- **Deployment:** https://docs.astro.build/en/guides/deploy/
- **Node Adapter:** https://docs.astro.build/en/guides/integrations-guide/node/

### Railway
- **Docs:** https://docs.railway.app
- **Node.js Guide:** https://docs.railway.app/guides/nodejs
- **Discord:** https://discord.gg/railway

### AstraCMS
- **API Docs:** (will be at docs.astracms.com)
- **Support:** support@astracms.com

### Troubleshooting
- Check Railway logs: `railway logs --service astracms-web`
- Test locally first: `pnpm dev`
- Verify environment variables: `railway variables`
- Test API endpoint: `curl https://api.astracms.com/v1/[workspace]/posts`

---

## 📝 Deployment Commands Summary

```bash
# Local Development
cd apps/web
pnpm install
pnpm dev

# Build Test
pnpm build
pnpm preview

# Deploy to Railway (CLI)
railway link
railway service astracms-web
railway up

# View Deployment
railway open --service astracms-web

# Monitor Logs
railway logs --service astracms-web --follow

# Check Status
railway status --service astracms-web
```

---

## ✅ Step 5 Status: READY TO DEPLOY

**Configuration complete!** The web application is now ready for Railway deployment with:
- ✅ Astro configured for Node.js/Railway
- ✅ Environment variables documented
- ✅ API integration configured
- ✅ Image optimization enabled
- ✅ SEO features ready (RSS, Sitemap)
- ✅ Build optimization enabled
- ✅ Production-ready

**Follow the guide above to deploy!** 🚀

---

**Last Updated:** November 13, 2024  
**Status:** Ready for Deployment  
**Next:** Step 6 - Final Configuration & Testing