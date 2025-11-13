# 🎨 STEP 4: CMS DEPLOYMENT - SUMMARY

**Status:** 📝 **READY TO DEPLOY**  
**Date Created:** November 13, 2024  
**Estimated Time:** 1-2 hours  
**Prerequisites:** Steps 1, 2, 3 Complete ✅

---

## 📋 Quick Summary

Deploy the Next.js CMS admin dashboard to Railway with OAuth, media storage, and database connectivity.

---

## ✅ What Was Prepared

### Configuration Updates
- ✅ Updated `next.config.ts` with:
  - `output: "standalone"` for optimized deployment
  - Minio/Railway image domains configured
  - Server actions body size limit set
  - Remote image patterns added

### Documentation Created
- ✅ Complete deployment guide: `STEP4-GUIDE.md`
- ✅ OAuth setup instructions
- ✅ Environment variables reference
- ✅ Troubleshooting guide
- ✅ Testing checklist

---

## 🚀 Quick Deployment Steps

### 1. Configure OAuth (15 minutes)

**Google OAuth:**
```
1. Go to: https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Redirect URI: https://astracms.com/api/auth/callback/google
4. Copy Client ID and Secret
```

**GitHub OAuth:**
```
1. Go to: https://github.com/settings/developers
2. Create New OAuth App
3. Callback URL: https://astracms.com/api/auth/callback/github
4. Copy Client ID and Secret
```

### 2. Create Railway Service (10 minutes)

**In Railway Dashboard:**
```
1. Click "+ New" → "GitHub Repo"
2. Service Name: astracms-cms
3. Build Command: cd apps/cms && pnpm install && pnpm build
4. Start Command: cd apps/cms && pnpm start
5. Port: 3000
```

### 3. Add Environment Variables (20 minutes)

**Critical Variables:**
```bash
DATABASE_URL=${{POSTGRESQL.DATABASE_URL}}
BETTER_AUTH_SECRET=<from-step-2>
BETTER_AUTH_URL=https://astracms.com
GOOGLE_CLIENT_ID=<from-google>
GOOGLE_CLIENT_SECRET=<from-google>
GITHUB_ID=<from-github>
GITHUB_SECRET=<from-github>
MINIO_ENDPOINT=https://storage.astracms.com
MINIO_SECRET_KEY=<from-step-2>
MINIO_BUCKET_NAME=astracms-media
REDIS_URL=${{REDIS.REDIS_URL}}
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://astracms.com
```

### 4. Deploy & Configure Domain (30 minutes)

```bash
1. Click "Deploy" in Railway
2. Wait for build (~5-10 minutes)
3. Add custom domain: astracms.com
4. Configure DNS A record
5. Wait for SSL certificate (~5 minutes)
6. Run database migrations
```

### 5. Test Application (15 minutes)

```
✓ Visit https://astracms.com
✓ Test registration
✓ Test Google login
✓ Test GitHub login
✓ Test media upload
✓ Test post creation
✓ Verify dashboard loads
```

---

## 🔐 Required Secrets

Generate these if not already done:

```bash
# BETTER_AUTH_SECRET (if not from Step 2)
openssl rand -base64 32

# Check you have:
✓ Google OAuth credentials
✓ GitHub OAuth credentials
✓ Minio secret key (from Step 2)
✓ Database URL (from Step 2)
✓ Redis URL (from Step 2)
```

---

## 📦 Services Architecture

```
┌────────────────────────────────────────┐
│  CMS (astracms.com)                   │
│  - Next.js 16 App                     │
│  - Port 3000                          │
│  - 1 vCPU, 2GB RAM                    │
├────────────────────────────────────────┤
│  API (api.astracms.com)               │
│  - Hono/Node.js                       │
│  - Port 8000                          │
│  - 0.5 vCPU, 512MB RAM                │
├────────────────────────────────────────┤
│  PostgreSQL Database                   │
│  - Port 5432                          │
├────────────────────────────────────────┤
│  Redis Cache                           │
│  - Port 6379                          │
├────────────────────────────────────────┤
│  Minio Storage                         │
│  - Ports 9000, 9001                   │
└────────────────────────────────────────┘
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] OAuth apps created (Google, GitHub)
- [ ] OAuth redirect URIs configured
- [ ] All secrets generated
- [ ] Environment variables documented
- [ ] DNS ready for configuration

### Railway Configuration
- [ ] CMS service created
- [ ] Build command set
- [ ] Start command set
- [ ] Environment variables added
- [ ] Health check configured (/api/health)
- [ ] Resources allocated (1 vCPU, 2GB RAM)

### Domain & SSL
- [ ] Custom domain added: astracms.com
- [ ] DNS A record configured
- [ ] SSL certificate issued
- [ ] HTTPS working
- [ ] www subdomain configured (optional)

### Database
- [ ] Database migrations applied
- [ ] Connection verified
- [ ] Prisma client generated
- [ ] Tables created

### Post-Deployment Testing
- [ ] Application loads
- [ ] Registration works
- [ ] Login works
- [ ] Google OAuth works
- [ ] GitHub OAuth works
- [ ] Dashboard accessible
- [ ] Media upload works
- [ ] Post creation works
- [ ] No errors in logs
- [ ] Performance acceptable

---

## 🧪 Testing Commands

```bash
# Test health endpoint
curl https://astracms.com/api/health

# Run database migrations
railway run --service astracms-cms pnpm db:deploy

# View logs
railway logs --service astracms-cms --follow

# Check service status
railway status --service astracms-cms

# SSH into service
railway shell --service astracms-cms
```

---

## 🚨 Common Issues

### Issue: Build fails with memory error
**Solution:** Increase memory to 2GB in Railway settings

### Issue: OAuth redirect mismatch
**Solution:** 
```
1. Check redirect URIs match exactly
2. Verify BETTER_AUTH_URL=https://astracms.com
3. No trailing slashes in URLs
```

### Issue: Images not loading
**Solution:**
```
1. Check Minio bucket exists: astracms-media
2. Verify bucket policy is public
3. Check MINIO_PUBLIC_URL is correct
4. Verify CORS configuration
```

### Issue: Database connection error
**Solution:**
```
1. Use DATABASE_PRIVATE_URL for internal connections
2. Check Railway variable interpolation
3. Run migrations: railway run pnpm db:deploy
```

### Issue: Session not persisting
**Solution:**
```
1. Check REDIS_URL is set
2. Verify REDIS_TOKEN is correct
3. Check Redis service is running
```

---

## 💰 Cost Estimate

### Railway Resources (Step 4 Only)
- CMS Service: $5-10/month (1 vCPU, 2GB RAM)

### Total Project Cost (All Steps)
- PostgreSQL: $1-2/month
- Redis: $1/month
- Minio: $1-2/month
- API: $2-3/month
- CMS: $5-10/month
- **Total: ~$10-18/month**

Hobby plan includes $5/month credit.
Recommend Pro plan ($20/month) for production.

---

## 📊 Environment Variables Reference

### Required
```bash
DATABASE_URL                  # PostgreSQL connection
BETTER_AUTH_SECRET           # 32-byte secret for auth
BETTER_AUTH_URL              # https://astracms.com
GOOGLE_CLIENT_ID             # Google OAuth
GOOGLE_CLIENT_SECRET         # Google OAuth
GITHUB_ID                    # GitHub OAuth
GITHUB_SECRET                # GitHub OAuth
MINIO_ENDPOINT               # Minio S3 endpoint
MINIO_ACCESS_KEY             # Minio access key
MINIO_SECRET_KEY             # Minio secret key
MINIO_BUCKET_NAME            # astracms-media
MINIO_PUBLIC_URL             # Public bucket URL
REDIS_URL                    # Redis connection
NODE_ENV                     # production
NEXT_PUBLIC_APP_URL          # https://astracms.com
```

### Optional (for features)
```bash
RESEND_API_KEY               # Email service
POLAR_ACCESS_TOKEN           # Billing provider
POLAR_WEBHOOK_SECRET         # Billing webhooks
QSTASH_TOKEN                 # Webhook queue
AI_GATEWAY_API_KEY           # AI features
```

---

## 🔄 Next Steps: STEP 5

After CMS is deployed and tested:

**Deploy Web Application (Blog)**
- Public-facing blog/changelog
- Domain: blog.astracms.com
- Fetches content from API
- Next.js/Astro static site

---

## 📞 Quick Links

**Railway:**
- Dashboard: https://railway.app/dashboard
- Docs: https://docs.railway.app/guides/nextjs

**OAuth Setup:**
- Google: https://console.cloud.google.com/apis/credentials
- GitHub: https://github.com/settings/developers

**External Services:**
- Resend: https://resend.com (email)
- Polar: https://polar.sh (billing)


---

## 📝 Progress Tracking

### Overall Deployment Status
- ✅ **Step 1:** Complete - Rebranding
- ✅ **Step 2:** Complete - Infrastructure Setup
- ✅ **Step 3:** Complete - API Migration
- 📝 **Step 4:** Ready - CMS Deployment (this step)
- ⏳ **Step 5:** Pending - Web Deployment
- ⏳ **Step 6:** Pending - Domain Configuration
- ⏳ **Step 7:** Pending - Production Testing
- ⏳ **Step 8:** Pending - Go-Live

### Time Investment
- Step 1: ✅ 30 minutes
- Step 2: ✅ 1-2 hours
- Step 3: ✅ 30 minutes
- Step 4: 📝 1-2 hours (in progress)

---

## 🎯 Success Criteria

Step 4 is complete when:

1. ✅ CMS deployed to Railway
2. ✅ Domain astracms.com working
3. ✅ SSL certificate active
4. ✅ OAuth authentication working
5. ✅ Database connected
6. ✅ Media uploads working
7. ✅ Post editor functional
8. ✅ No errors in production
9. ✅ Performance acceptable
10. ✅ Team can access and use

---

## 🚀 Ready to Deploy

**You have everything you need:**
- ✅ Configuration complete
- ✅ OAuth setup guide ready
- ✅ Environment variables documented
- ✅ Deployment steps clear
- ✅ Testing checklist prepared
- ✅ Troubleshooting guide available

**Start deployment with Railway Dashboard or CLI!**

---

**Last Updated:** November 13, 2024  
**Status:** Ready for Deployment  
**Next:** Step 5 - Web Application Deployment  
**Support:** Check STEP4-GUIDE.md for detailed instructions