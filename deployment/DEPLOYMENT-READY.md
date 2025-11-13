# 🚀 AstraCMS - Deployment Ready Checklist

## ✅ Current Status: READY FOR DEPLOYMENT

**Repository**: https://github.com/netronk/astracms  
**Branch**: `main`  
**Last Commit**: Complete AstraCMS rebranding and Railway migration  
**Build Status**: ✅ All builds passing  

---

## 📦 What's Been Completed

### ✅ 1. Complete Rebranding (Marble → AstraCMS)
- [x] All imports updated from `@marble/*` to `@astracms/*`
- [x] Icon component renamed and updated (`AstraCMSIcon`)
- [x] Texture assets renamed (`astracms-light.avif`, `astracms-dark.avif`)
- [x] All text references updated across codebase
- [x] Webhook headers updated (`x-astracms-signature`)
- [x] Discord/Slack embed branding updated
- [x] Database credentials updated in examples

### ✅ 2. API Migration (Cloudflare → Node.js)
- [x] Removed all Cloudflare Workers files
  - [x] `wrangler.toml` deleted
  - [x] `.dev.vars.example` deleted
  - [x] Cloudflare bindings removed from all routes
- [x] Implemented Node.js server with `@hono/node-server`
- [x] Updated middleware for Railway Redis (ioredis)
- [x] Created comprehensive deployment documentation
- [x] TypeScript compilation: **PASSING ✅**
- [x] All API endpoints tested and working
- [x] Environment variable templates created

### ✅ 3. Storage Migration (R2 → Minio S3)
- [x] Replaced Cloudflare R2 with Minio S3 throughout CMS
- [x] Added S3 helper functions (`isS3Available()`, `getS3Client()`)
- [x] Updated user avatar upload flow
- [x] Updated media upload API routes
- [x] Updated media deletion with proper S3 client usage
- [x] Graceful fallback when S3 not configured

### ✅ 4. Build Verification
- [x] **API**: TypeScript compiles with zero errors
- [x] **CMS**: Next.js builds successfully
- [x] **Web**: Astro configured for Node.js adapter
- [x] All dependencies installed correctly
- [x] No Cloudflare dependencies remain

### ✅ 5. Infrastructure Configuration
- [x] `railway.toml` created for multi-service deployment
- [x] Environment variable templates for all apps
- [x] Docker Compose for local development
- [x] Database migration scripts ready
- [x] Health check endpoints implemented

### ✅ 6. Documentation
- [x] API deployment guide (step-by-step)
- [x] Quick start checklist (30-minute setup)
- [x] Deployment flow diagrams
- [x] Troubleshooting guides
- [x] Environment variable references
- [x] Complete README files for all apps

### ✅ 7. Version Control
- [x] Git repository initialized
- [x] All files committed (526 files, 68,757+ lines)
- [x] Pushed to GitHub: `git@github.com:netronk/astracms.git`
- [x] Branch set to `main`
- [x] Remote tracking configured

---

## 🎯 Next Steps: Deployment Phases

### Phase 1: API + Infrastructure (START HERE) ⭐
**Time Required**: 30-45 minutes  
**Guide**: `deployment/API-QUICK-START.md`

**Quick Steps**:
```bash
# 1. Install Railway CLI
npm i -g @railway/cli
railway login

# 2. Create project
cd /Users/kalana/dev/netronk/astracms
railway init

# 3. Add PostgreSQL
railway add --database postgres

# 4. Add Redis
railway add --database redis

# 5. Deploy API (via GitHub or CLI)
# Connect repo in Railway dashboard
# Set root directory: apps/api

# 6. Configure environment variables (in Railway dashboard)
NODE_ENV=production
PORT=8000
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
REDIS_TOKEN=${{Redis.REDIS_TOKEN}}
API_VERSION=v1
CORS_ORIGINS=*

# 7. Run migrations
railway shell --service astracms-api
cd /app
pnpm prisma migrate deploy
exit

# 8. Test API
curl https://your-api-url.railway.app/status
# Expected: {"status":"ok"}
```

**Success Criteria**:
- [ ] API service running (green status in Railway)
- [ ] Health check returns `{"status":"ok"}`
- [ ] Database migrations completed
- [ ] Rate limiting working (headers in response)
- [ ] No errors in Railway logs

### Phase 2: CMS Application
**Time Required**: 20-30 minutes  
**Prerequisites**: Phase 1 complete

**Setup**:
1. Set up OAuth providers (Google, GitHub)
2. Deploy CMS service to Railway
3. Configure environment variables (see `apps/cms/.env.example`)
4. Set custom domain: `astracms.com`
5. Test authentication and content creation

**Success Criteria**:
- [ ] CMS accessible at domain
- [ ] OAuth login working (Google/GitHub)
- [ ] Media uploads working (if Minio configured)
- [ ] Can create/edit posts
- [ ] Database queries working

### Phase 3: Web/Blog
**Time Required**: 15-20 minutes  
**Prerequisites**: Phase 1 & 2 complete

**Setup**:
1. Deploy Web service to Railway
2. Configure environment variables
3. Set custom domain: `blog.astracms.com`
4. Verify content fetching from API

**Success Criteria**:
- [ ] Blog accessible at domain
- [ ] Posts display correctly
- [ ] RSS feed generated
- [ ] Sitemap generated
- [ ] Images loading

---

## 📚 Documentation Quick Links

### For Deployment
- **Start Here**: [`deployment/API-QUICK-START.md`](deployment/API-QUICK-START.md)
- **Detailed Guide**: [`deployment/API-DEPLOYMENT-GUIDE.md`](deployment/API-DEPLOYMENT-GUIDE.md)
- **Visual Flow**: [`deployment/DEPLOYMENT-FLOW.md`](deployment/DEPLOYMENT-FLOW.md)

### For Development
- **API Docs**: [`apps/api/README.md`](apps/api/README.md)
- **CMS Docs**: [`apps/cms/README.md`](apps/cms/README.md)
- **Web Docs**: [`apps/web/README.md`](apps/web/README.md)

### For Reference
- **Migration Summary**: [`apps/api/MIGRATION-SUMMARY.md`](apps/api/MIGRATION-SUMMARY.md)
- **Cleanup Report**: [`apps/api/CLEANUP-COMPLETE.md`](apps/api/CLEANUP-COMPLETE.md)
- **Project Root**: [`README.md`](README.md)

---

## 🔧 Local Development

### Prerequisites
- Node.js 20+
- pnpm (or npm/yarn)
- Docker (for PostgreSQL and Minio)

### Quick Start
```bash
# 1. Clone repository
git clone git@github.com:netronk/astracms.git
cd astracms

# 2. Install dependencies
pnpm install

# 3. Start local services
docker-compose up -d

# 4. Set up environment variables
cp apps/api/.env.example apps/api/.env
cp apps/cms/.env.example apps/cms/.env
cp apps/web/.env.example apps/web/.env

# Edit .env files with your local credentials

# 5. Run database migrations
cd packages/db
pnpm prisma migrate dev

# 6. Start development servers
# Terminal 1 - API
cd apps/api
pnpm dev

# Terminal 2 - CMS
cd apps/cms
pnpm dev

# Terminal 3 - Web
cd apps/web
pnpm dev
```

**Access Points**:
- API: http://localhost:8000
- CMS: http://localhost:3000
- Web: http://localhost:3001

---

## 🌐 Production URLs (After Deployment)

### Default Railway Domains
- API: `https://astracms-api-production.up.railway.app`
- CMS: `https://astracms-cms-production.up.railway.app`
- Web: `https://astracms-web-production.up.railway.app`

### Custom Domains (Optional)
- API: `https://api.astracms.com`
- CMS: `https://astracms.com`
- Web: `https://blog.astracms.com`

---

## 🔐 Required Environment Variables

### API Service
```env
NODE_ENV=production
PORT=8000
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
REDIS_TOKEN=${{Redis.REDIS_TOKEN}}
API_VERSION=v1
CORS_ORIGINS=https://astracms.com,https://blog.astracms.com
```

### CMS Service
```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
NEXTAUTH_URL=https://astracms.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>
GITHUB_ID=<from-github-oauth>
GITHUB_SECRET=<from-github-oauth>
MINIO_ENDPOINT=${{minio.RAILWAY_PRIVATE_DOMAIN}}:9000
MINIO_ACCESS_KEY=${{minio.MINIO_ROOT_USER}}
MINIO_SECRET_KEY=${{minio.MINIO_ROOT_PASSWORD}}
MINIO_BUCKET=astracms-media
MINIO_PUBLIC_URL=https://minio.your-domain.com
REDIS_URL=${{Redis.REDIS_URL}}
REDIS_TOKEN=${{Redis.REDIS_TOKEN}}
```

### Web Service
```env
NODE_ENV=production
PUBLIC_API_URL=https://api.astracms.com
PUBLIC_WORKSPACE_ID=<your-workspace-id>
SITE_URL=https://blog.astracms.com
```

---

## ⚠️ Important Notes

### Before Deploying
1. **Clean Git State**: ✅ Already committed and pushed
2. **No Sensitive Data**: ✅ All `.env` files are gitignored
3. **OAuth Setup**: ⚠️ Required for CMS (Google & GitHub)
4. **Domain DNS**: ⚠️ Configure after Railway deployment
5. **Minio Setup**: ⚠️ Optional, needed for media uploads

### During Deployment
1. **Railway Free Tier**: ~$5/month credit (covers small deployments)
2. **Database Migrations**: Must run manually after first deploy
3. **Environment Variables**: Use Railway service references (`${{Service.VAR}}`)
4. **Build Times**: First build takes 2-5 minutes per service
5. **SSL Certificates**: Auto-provisioned by Railway (1-5 minutes)

### After Deployment
1. **Health Checks**: Verify all services return 200 OK
2. **Rate Limiting**: Test that headers appear in API responses
3. **Authentication**: Test OAuth login flows
4. **Media Uploads**: Test if Minio is configured
5. **Content Creation**: Create test post end-to-end

---

## 🆘 Support & Resources

### Railway
- **Dashboard**: https://railway.app/dashboard
- **Docs**: https://docs.railway.app
- **Discord**: https://discord.gg/railway

### AstraCMS
- **Repository**: https://github.com/netronk/astracms
- **Issues**: https://github.com/netronk/astracms/issues

### Technologies
- **Next.js**: https://nextjs.org/docs
- **Hono**: https://hono.dev
- **Astro**: https://docs.astro.build
- **Prisma**: https://www.prisma.io/docs
- **Railway Redis**: [ioredis documentation](https://github.com/luin/ioredis)

---

## 📊 Project Stats

- **Total Files**: 526
- **Lines of Code**: 68,757+
- **Packages**: 6 workspace packages
- **Apps**: 3 (API, CMS, Web)
- **Tech Stack**: Node.js, Next.js 16, Astro, Hono, Prisma
- **Database**: PostgreSQL
- **Cache**: Redis (ioredis)
- **Storage**: Minio S3

---

## 🎉 Ready to Deploy!

**You are now ready to deploy AstraCMS to Railway!**

### Recommended Approach
1. ✅ **Phase 1 First**: Deploy API + Infrastructure (today)
2. ⏳ **Phase 2 Next**: Deploy CMS (after API is stable)
3. ⏳ **Phase 3 Last**: Deploy Web/Blog (after content exists)

### Time Estimate
- **Total Deployment Time**: 1.5 - 2 hours
- **Phase 1 (API)**: 30-45 minutes ⭐ **START HERE**
- **Phase 2 (CMS)**: 20-30 minutes
- **Phase 3 (Web)**: 15-20 minutes

### First Command
```bash
cd /Users/kalana/dev/netronk/astracms
railway login
railway init
```

Then follow: **[deployment/API-QUICK-START.md](deployment/API-QUICK-START.md)**

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Status**: ✅ PRODUCTION READY

🚀 **Let's deploy!**