# AstraCMS Deployment Checklist

## ✅ STEP 1: REBRANDING (COMPLETED)

### Package Imports
- [x] All @marble/db → @astracms/db
- [x] All @marble/ui → @astracms/ui
- [x] All @marble/parser → @astracms/parser
- [x] All @marble/tsconfig → @astracms/tsconfig
- [x] Verified: 500+ imports updated across 200+ files

### Configuration Files
- [x] apps/api/wrangler.toml (marble-api → astracms-api)
- [x] apps/api/src/app.ts (Hello message updated)
- [x] packages/ui/components.json (aliases updated)
- [x] packages/db/.env.example (credentials updated)

### Assets & Components
- [x] Icon: marble.tsx → astracms.tsx
- [x] Function: MarbleIcon → AstraCMSIcon
- [x] Texture: marble-light.avif → astracms-light.avif
- [x] Texture: marble-dark.avif → astracms-dark.avif
- [x] All icon imports updated automatically

### Text & URLs
- [x] marblecms.com → astracms.com (all occurrences)
- [x] Webhook header: x-marble-signature → x-astracms-signature
- [x] Discord webhook branding updated
- [x] Slack webhook branding updated
- [x] FAQ text updated
- [x] Email mock logger updated

### Verification
- [x] Zero @marble/* imports remaining
- [x] Zero "marble" text references (in source)
- [x] Build test passing
- [x] Dependencies installed successfully
- [x] Backup created: .backup-20251113-143159/

---

## 📋 STEP 2: RAILWAY INFRASTRUCTURE SETUP (PENDING)

### Railway Project
- [ ] Create Railway account/login
- [ ] Create new project: "astracms"
- [ ] Connect GitHub repository
- [ ] Configure project settings

### Database Service
- [ ] Add PostgreSQL plugin
- [ ] Configure database name: astracms
- [ ] Note DATABASE_URL from Railway
- [ ] Configure connection pooling
- [ ] Set up automatic backups

### Redis Service
- [ ] Add Redis plugin
- [ ] Note REDIS_URL from Railway
- [ ] Configure maxmemory policy: allkeys-lru

### Storage Service (Minio)
- [ ] Deploy Minio service
- [ ] Configure bucket: astracms-media
- [ ] Set up public access policies
- [ ] Configure CORS settings
- [ ] Note MINIO_ENDPOINT URL

---

## 📋 STEP 3: STORAGE MIGRATION (CLOUDFLARE R2 → MINIO)

### Minio Configuration
- [ ] Deploy Minio on Railway
- [ ] Create bucket: astracms-media
- [ ] Configure public access
- [ ] Set up CORS headers
- [ ] Test upload/download

### Environment Variables
- [ ] MINIO_ENDPOINT (Railway URL)
- [ ] MINIO_ACCESS_KEY (generate)
- [ ] MINIO_SECRET_KEY (generate)
- [ ] MINIO_BUCKET_NAME=astracms-media
- [ ] MINIO_PUBLIC_URL (CDN URL)

### Code Updates
- [ ] Verify apps/cms/src/lib/s3.ts exists ✓
- [ ] Test media upload functionality
- [ ] Test media deletion
- [ ] Verify presigned URLs work

---

## 📋 STEP 4: API MIGRATION (CLOUDFLARE WORKERS → NODE.JS)

### API Conversion
- [ ] Replace apps/api/package.json with package-node.json
- [ ] Replace apps/api/tsconfig.json with tsconfig.node.json
- [ ] Install Node.js dependencies: @hono/node-server, dotenv, tsx
- [ ] Update src/index.ts to import server.ts
- [ ] Test locally with tsx watch

### Environment Variables
- [ ] DATABASE_URL (from Railway PostgreSQL)
- [ ] REDIS_URL (from Railway Redis)
- [ ] REDIS_TOKEN (from Railway Redis)
- [ ] NODE_ENV=production
- [ ] PORT=8000
- [ ] CORS_ORIGINS (comma-separated)

### Railway API Service
- [ ] Create new service: astracms-api
- [ ] Set build command: pnpm install && pnpm build --filter=api
- [ ] Set start command: cd apps/api && node dist/server.js
- [ ] Configure health check: /status
- [ ] Set custom domain: api.astracms.com

---

## 📋 STEP 5: CMS APPLICATION DEPLOYMENT

### Next.js Configuration
- [ ] Update next.config.ts for production
- [ ] Configure image domains
- [ ] Set output: 'standalone' if needed
- [ ] Optimize bundle size

### Environment Variables
- [ ] DATABASE_URL (from Railway)
- [ ] BETTER_AUTH_SECRET (generate: openssl rand -base64 32)
- [ ] BETTER_AUTH_URL=https://astracms.com
- [ ] NEXT_PUBLIC_APP_URL=https://astracms.com
- [ ] MINIO_* variables (from Step 3)
- [ ] REDIS_URL and REDIS_TOKEN (from Railway)
- [ ] GOOGLE_CLIENT_ID (OAuth)
- [ ] GOOGLE_CLIENT_SECRET (OAuth)
- [ ] GITHUB_ID (OAuth)
- [ ] GITHUB_SECRET (OAuth)
- [ ] RESEND_API_KEY
- [ ] POLAR_* variables (billing)
- [ ] QSTASH_TOKEN (webhooks)
- [ ] AI_GATEWAY_API_KEY (if using AI)

### Railway CMS Service
- [ ] Create new service: astracms-cms
- [ ] Set build command: pnpm install && pnpm build --filter=cms
- [ ] Set start command: cd apps/cms && pnpm start
- [ ] Configure health check: /api/health
- [ ] Set custom domain: astracms.com
- [ ] Add www.astracms.com domain

---

## 📋 STEP 6: WEB APPLICATION DEPLOYMENT

### Web App Configuration
- [ ] Update environment variables
- [ ] ASTRACMS_API_URL=https://api.astracms.com/v1
- [ ] ASTRACMS_WORKSPACE_KEY (your workspace)
- [ ] Test build locally

### Railway Web Service
- [ ] Create new service: astracms-web
- [ ] Set build command: pnpm install && pnpm build --filter=web
- [ ] Set start command: cd apps/web && pnpm start
- [ ] Set custom domain: blog.astracms.com

---

## 📋 STEP 7: DOMAIN CONFIGURATION

### DNS Settings
- [ ] Point astracms.com to Railway
- [ ] Point www.astracms.com to Railway
- [ ] Point api.astracms.com to Railway
- [ ] Point blog.astracms.com to Railway
- [ ] Point storage.astracms.com to Railway
- [ ] Verify SSL certificates issued

### OAuth Redirects
- [ ] Update Google OAuth redirect URI
- [ ] Update GitHub OAuth redirect URI
- [ ] Test authentication flows

---

## 📋 STEP 8: PRODUCTION READINESS

### Security
- [ ] All secrets rotated for production
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Security headers configured

### Database
- [ ] Run Prisma migrations: pnpm db:deploy
- [ ] Verify database connectivity
- [ ] Test connection pooling
- [ ] Backup schedule configured

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up log aggregation
- [ ] Create health check monitors
- [ ] Configure budget alerts

### Performance
- [ ] CDN enabled for static assets
- [ ] Image optimization configured
- [ ] Caching strategies in place
- [ ] Database queries optimized

---

## 📋 STEP 9: TESTING & VALIDATION

### Functional Testing
- [ ] User registration works
- [ ] Login/logout works
- [ ] OAuth (Google) works
- [ ] OAuth (GitHub) works
- [ ] Media upload works
- [ ] Media deletion works
- [ ] Post creation works
- [ ] API endpoints respond
- [ ] Webhooks trigger correctly
- [ ] Email sending works

### Integration Testing
- [ ] CMS → API communication
- [ ] API → Database queries
- [ ] Web → API fetching
- [ ] Minio → Media serving
- [ ] Redis → Caching works

### Load Testing
- [ ] API can handle expected load
- [ ] Database performance acceptable
- [ ] Media uploads don't timeout
- [ ] No memory leaks

---

## 📋 STEP 10: GO-LIVE

### Pre-Launch
- [ ] All services running
- [ ] All domains working
- [ ] SSL certificates valid
- [ ] Monitoring active
- [ ] Backup systems working
- [ ] Rollback plan documented

### Launch
- [ ] DNS propagated
- [ ] Services healthy
- [ ] No errors in logs
- [ ] Performance acceptable
- [ ] Team notified

### Post-Launch
- [ ] Monitor error rates (first 24h)
- [ ] Check performance metrics
- [ ] Verify backup completion
- [ ] Document any issues
- [ ] Update documentation

---

## 🚨 ROLLBACK PLAN

### If Issues Occur
1. [ ] Identify the problem
2. [ ] Check Railway logs
3. [ ] Review recent changes
4. [ ] Revert to previous deployment if needed
5. [ ] Restore from backup if necessary

### Backup Restore Procedure
```bash
# Code backup
cd /Users/kalana/dev/netronk/astracms
cp -r .backup-20251113-143159/apps ./apps-restore
cp -r .backup-20251113-143159/packages ./packages-restore

# Database backup (from Railway dashboard)
# 1. Go to PostgreSQL service
# 2. Click "Backups"
# 3. Select backup to restore
# 4. Click "Restore"
```

---

## 📊 PROGRESS TRACKING

### Overall Status
- ✅ Step 1: COMPLETE (Rebranding)
- ⏳ Step 2: PENDING (Railway Setup)
- ⏳ Step 3: PENDING (Storage Migration)
- ⏳ Step 4: PENDING (API Migration)
- ⏳ Step 5: PENDING (CMS Deployment)
- ⏳ Step 6: PENDING (Web Deployment)
- ⏳ Step 7: PENDING (Domain Config)
- ⏳ Step 8: PENDING (Production Ready)
- ⏳ Step 9: PENDING (Testing)
- ⏳ Step 10: PENDING (Go-Live)

### Time Estimates
- Step 1: ✅ 30 minutes
- Step 2: 1 hour
- Step 3: 1 hour
- Step 4: 2 hours
- Step 5: 2 hours
- Step 6: 1 hour
- Step 7: 30 minutes
- Step 8: 2 hours
- Step 9: 3 hours
- Step 10: 1 hour

**Total Estimated Time:** 2-3 days

---

## 📞 SUPPORT CONTACTS

### Railway Support
- Dashboard: https://railway.app
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

### Services
- PostgreSQL: docs.railway.app/databases/postgresql
- Redis: docs.railway.app/databases/redis
- Minio: min.io/docs/minio/linux/index.html

---

## 📝 NOTES

- Keep backup for 30 days after successful deployment
- Document all environment variables in secure location
- Update team on deployment schedule
- Schedule downtime maintenance window if needed
- Prepare rollback communication plan

---

**Last Updated:** November 13, 2024  
**Next Review:** Before Step 2  
**Status:** Ready for Railway Deployment Phase