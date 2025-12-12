# Outside Cursor Tasks - Performance Optimization

This document contains all tasks that need to be completed outside of Cursor (external services, dashboards, configurations).

## High Priority Tasks

### 1. Supabase Connection Pooling

**What to do:**
1. Go to Supabase Dashboard → Project Settings → Database
2. Enable "Connection Pooling"
3. Copy the pooled connection string (different from regular connection string)
4. Update environment variables:
   - Add `SUPABASE_POOLED_URL` to `.env.local`
   - Update connection string in code to use pooled URL (if needed)

**Why:** Reduces database connection overhead and allows more concurrent connections

**Time:** 5 minutes

**Reference:** [Supabase Connection Pooling Docs](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

---

### 2. Vercel Analytics

**What to do:**
1. Go to Vercel Dashboard → Your Project → Analytics
2. Enable "Web Analytics" (free tier available)
3. Enable "Core Web Vitals" tracking
4. Add analytics script to project (Vercel will provide instructions)

**Why:** Monitor real user performance metrics and identify bottlenecks

**Time:** 10 minutes

**Reference:** [Vercel Analytics Docs](https://vercel.com/docs/analytics)

---

### 3. Supabase Usage Monitoring & Alerts

**What to do:**
1. Go to Supabase Dashboard → Project Settings → Usage
2. Review current usage:
   - Database size
   - API requests
   - Database requests
   - Bandwidth
3. Set up alerts:
   - Go to Project Settings → Alerts
   - Create alert for "Database requests > 1.6M/month" (80% of 2M limit)
   - Create alert for "Database size > 400MB" (80% of 500MB limit)
   - Create alert for "API requests > 1.6M/month" (80% of 2M limit)
4. Set notification email for alerts

**Why:** Get notified before hitting limits, prevent service interruption

**Time:** 15 minutes

**Reference:** [Supabase Monitoring Docs](https://supabase.com/docs/guides/platform/metrics)

---

### 4. Database Indexes (via Supabase SQL Editor)

**What to do:**
1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Run the following SQL commands:

```sql
-- Index on slug (unique, for fast lookups)
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);

-- Index on category (for filtering)
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);

-- Index on popularity_score (for sorting)
CREATE INDEX IF NOT EXISTS idx_tools_popularity ON tools(popularity_score DESC);

-- Composite index for category + popularity (common query pattern)
CREATE INDEX IF NOT EXISTS idx_tools_category_popularity ON tools(category, popularity_score DESC);

-- Index on posts published_at (for blog)
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC) WHERE published_at IS NOT NULL;

-- Verify indexes were created
SELECT 
    tablename, 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('tools', 'posts')
ORDER BY tablename, indexname;
```

4. Verify all indexes are created successfully
5. Monitor query performance improvement

**Why:** Dramatically speeds up queries, especially filtering and sorting

**Time:** 10 minutes

**Reference:** [PostgreSQL Indexes Docs](https://www.postgresql.org/docs/current/indexes.html)

---

## Medium Priority Tasks

### 5. Error Tracking (Sentry)

**What to do:**
1. Sign up for Sentry account at [sentry.io](https://sentry.io) (free tier available)
2. Create new project → Select "Next.js"
3. Install Sentry SDK:
   ```bash
   npm install @sentry/nextjs
   ```
4. Run Sentry wizard:
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```
5. Configure Sentry:
   - Add `SENTRY_DSN` to environment variables
   - Update `sentry.client.config.ts` and `sentry.server.config.ts`
6. Test error tracking by triggering a test error
7. Set up error alerts in Sentry dashboard

**Why:** Track errors in production, get notified of issues, debug faster

**Time:** 30 minutes

**Reference:** [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

---

### 6. Uptime Monitoring

**What to do:**
1. Sign up for monitoring service:
   - **UptimeRobot** (free): [uptimerobot.com](https://uptimerobot.com)
   - **Pingdom** (free trial): [pingdom.com](https://www.pingdom.com)
   - **Better Uptime** (free tier): [betteruptime.com](https://betteruptime.com)
2. Add your website URL
3. Set check interval to 5 minutes
4. Configure alerts:
   - Email notifications
   - SMS notifications (if available)
   - Slack/Discord webhooks (optional)
5. Test alert by temporarily stopping the site

**Why:** Know immediately if your site goes down

**Time:** 15 minutes

**Reference:** [UptimeRobot Docs](https://uptimerobot.com/support/)

---

### 7. CDN Configuration (Vercel Edge Network)

**What to do:**
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Ensure custom domain is configured (if applicable)
3. Go to Settings → Edge Network
4. Configure cache rules:
   - Static assets: Cache for 1 year
   - API routes: Cache for 1 hour (handled in code)
   - Pages: Cache for 1 hour (handled by ISR)
5. Enable "Edge Network" if not already enabled
6. Review Edge Network analytics

**Why:** Faster global content delivery, reduced server load

**Time:** 10 minutes

**Reference:** [Vercel Edge Network Docs](https://vercel.com/docs/edge-network)

---

### 8. Image CDN (Optional - Only if needed)

**What to do:**
1. If experiencing image loading issues, consider:
   - **Cloudinary** (free tier): [cloudinary.com](https://cloudinary.com)
   - **Imgix** (paid): [imgix.com](https://www.imgix.com)
2. Sign up for service
3. Configure image optimization settings
4. Update image URLs in code to use CDN
5. Set up automatic format conversion (WebP, AVIF)

**Why:** Faster image loading, automatic optimization, format conversion

**Time:** 30 minutes (only if needed)

**Reference:** [Cloudinary Next.js Integration](https://cloudinary.com/documentation/nextjs_integration)

---

## Low Priority Tasks

### 9. Load Testing

**What to do:**
1. Choose a load testing tool:
   - **k6** (free, open source): [k6.io](https://k6.io)
   - **Artillery** (free, open source): [artillery.io](https://www.artillery.io)
   - **Loader.io** (free tier): [loader.io](https://loader.io)
2. Create test scenarios:
   - Homepage load test
   - Tool listing page test
   - Tool detail page test
   - Search functionality test
3. Run tests with increasing load:
   - 100 concurrent users
   - 500 concurrent users
   - 1000 concurrent users
4. Analyze results:
   - Response times
   - Error rates
   - Throughput
5. Identify bottlenecks and optimize

**Why:** Understand how your site performs under load, find breaking points

**Time:** 1-2 hours

**Reference:** [k6 Documentation](https://k6.io/docs/)

---

### 10. Database Read Replicas (If Needed)

**What to do:**
1. Only needed if you upgrade to Supabase Pro plan ($25/month)
2. Go to Supabase Dashboard → Database → Replicas
3. Create read replica in different region
4. Update connection strings to use replica for read queries
5. Monitor replica lag

**Why:** Distribute read load, improve performance for high traffic

**Time:** 30 minutes (only if on Pro plan)

**Reference:** [Supabase Read Replicas](https://supabase.com/docs/guides/database/read-replicas)

---

### 11. Advanced Monitoring (Optional)

**What to do:**
1. Consider advanced monitoring tools:
   - **Datadog** (free trial): [datadoghq.com](https://www.datadoghq.com)
   - **New Relic** (free tier): [newrelic.com](https://newrelic.com)
   - **Grafana Cloud** (free tier): [grafana.com](https://grafana.com)
2. Set up monitoring dashboards
3. Configure custom metrics
4. Set up alerts for performance degradation

**Why:** Advanced insights into performance, custom metrics, detailed analytics

**Time:** 1-2 hours (optional)

**Reference:** [Datadog Next.js Integration](https://docs.datadoghq.com/integrations/nodejs/)

---

### 12. Security Scanning

**What to do:**
1. Set up automated security scanning:
   - **Dependabot** (GitHub): Enable in repository settings
   - **Snyk** (free tier): [snyk.io](https://snyk.io)
   - **npm audit**: Run `npm audit` regularly
2. Configure automated dependency updates
3. Review security alerts
4. Update vulnerable dependencies

**Why:** Keep dependencies secure, prevent security vulnerabilities

**Time:** 30 minutes initial setup, ongoing maintenance

**Reference:** [GitHub Dependabot](https://docs.github.com/en/code-security/dependabot)

---

## Task Checklist

### Immediate (Do First)
- [ ] Enable Supabase Connection Pooling
- [ ] Enable Vercel Analytics
- [ ] Set up Supabase Usage Alerts
- [ ] Create Database Indexes

### Soon (Within Week)
- [ ] Set up Error Tracking (Sentry)
- [ ] Configure Uptime Monitoring
- [ ] Review CDN Configuration

### Later (When Needed)
- [ ] Set up Image CDN (if image issues occur)
- [ ] Run Load Testing
- [ ] Consider Read Replicas (if upgrading plan)
- [ ] Set up Advanced Monitoring (optional)
- [ ] Configure Security Scanning

---

## Notes

- All free tier services should be sufficient for initial growth
- Monitor usage regularly to avoid unexpected costs
- Set up alerts early to catch issues before they become problems
- Most tasks can be completed in 10-30 minutes each
- Prioritize High Priority tasks first for immediate impact

---

## Quick Reference Links

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Sentry Dashboard](https://sentry.io)
- [UptimeRobot](https://uptimerobot.com)
- [k6 Load Testing](https://k6.io)

