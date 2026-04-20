# 2-Year Free Deployment Strategy for LMS Application

> **Complete deployment strategy using GitHub Student Pack benefits for students**
> **Last Updated:** 2026-04-13
> **Target:** 2-year free hosting & CI/CD for your Frappe LMS application

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [GitHub Student Pack Benefits Summary](#github-student-pack-benefits)
3. [Local Development Setup](#local-development-setup)
4. [CI/CD with GitHub Actions](#ci-cd-with-github-actions)
5. [Deployment Strategy Year 1](#deployment-strategy-year-1)
6. [Deployment Strategy Year 2](#deployment-strategy-year-2)
7. [Cost Optimization Tips](#cost-optimization-tips)
8. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Before You Start

| Category | Task | Status |
|-----------|--------|----------|
| **Environment** | ✅ Install Python 3.11+ | ⬜ |
| **Environment** | ✅ Install Node.js 18+ | ⬜ |
| **Environment** | ✅ Install MariaDB 10.6+ | ⬜ |
| **Environment** | ✅ Install Redis 7+ | ⬜ |
| **Environment** | ✅ Install npm (comes with Node.js) | ⬜ |
| **Environment** | ✅ Install pip (comes with Python) | ⬜ |
| **Environment** | ✅ Install git | ⬜ |
| **Repository** | ✅ Verify GitHub repo is public | ⬜ |
| **LMS Setup** | ✅ Complete `bench setup` locally | ⬜ |
| **LMS Setup** | ✅ Configure `.env` with development settings | ⬜ |
| **Security** | ✅ Review sensitive data (API keys, passwords) | ⬜ |
| **Documentation** | ✅ Update README with setup instructions | ⬜ |

### Required Dependencies for Frappe LMS

```bash
# Python requirements (from requirements/base.txt)
python3.11+
nodeenv
npm
mariadb-server
redis-server
wkhtmltopdf
libmariadb-dev
libffi-dev

# Node.js dependencies (from package.json)
vite@^5.x
vue@^3.x
```

### Recommended Local Tools

| Tool | Purpose | Student Pack Benefit |
|-------|-----------|---------------------|
| **GitHub Codespaces** | Cloud development environment | ✅ Free Pro access |
| **GitHub Copilot** | AI-assisted coding | ✅ Free for students |
| **JetBrains PyCharm** | Python IDE | ✅ Free subscription |
| **Visual Studio Code** | Lightweight IDE | ✅ Free coding packs |
| **GitLens** | Git visualization | ✅ Free for students |

---

## GitHub Student Pack Benefits

### Summary of Free Credits

| Service | Free Credits | Duration | Value | Best For |
|----------|--------------|----------|-----------|
| **DigitalOcean** | $200 | 1 year | Main server hosting |
| **Microsoft Azure** | $100 | 1 year | Alternative cloud hosting |
| **Heroku** | $13/month | 24 months ($312 total) | Staging/CI environment |
| **MongoDB Atlas** | $50 + $150 cert | 1 year | Document storage (if needed) |
| **GitHub Codespaces** | Pro tier | Until graduation | Development environment |
| **GitHub Actions** | 2,000 min/month | Unlimited | CI/CD |
| **GitHub Pages** | Unlimited | Unlimited | Static frontend |
| **GitHub Pro** | Account upgrade | Until graduation | Enhanced GitHub features |
| **JetBrains PyCharm** | Full license | Annual renewal | Python development |
| **GitHub Copilot** | Full access | Until graduation | AI coding assistant |

### Total Estimated Value: **~$700-800** over 2 years

---

## Local Development Setup

### 1. GitHub Codespaces Setup

**Why:** Free Pro access allows 60 hours/month of development time in cloud.

```bash
# Create a new Codespace from your repository
# Settings: 4-core, 16GB RAM, 32GB storage (Pro tier)

# Install dependencies in Codespace
bench init lms  # If starting fresh
cd lms
bench get-app lms
cd apps/lms

# Start development server
bench start
```

### 2. Local Development (Recommended for Heavy Work)

**Why:** Frappe development is heavy; local is faster and doesn't consume Codespace hours.

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/lms.git
cd lms

# Install dependencies
pip install -r requirements.txt
npm install

# Setup MariaDB and Redis
# Use Docker Compose for easy setup:
docker-compose up -d mariadb redis

# Initialize bench
bench init lms
bench get-app lms

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start development
bench start
```

### Docker Compose for Local Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  mariadb:
    image: mariadb:10.11
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: lms_db
    ports:
      - "3306:3306"
    volumes:
      - mariadb_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  frappe:
    build: .
    depends_on:
      - mariadb
      - redis
    ports:
      - "8000:8000"
    volumes:
      - ./lms:/workspace
    command: bench start

volumes:
  mariadb_data:
  redis_data:
```

---

## CI/CD with GitHub Actions

### Free Tier Limits

| Feature | Public Repo | Private Repo | Notes |
|----------|-------------|---------------|-------|
| **Minutes/month** | 2,000 | 2,000 | Resets monthly |
| **Storage** | 500 MB | 500 MB | Logs & artifacts |
| **Linux Runner** | $0.008/min | $0.008/min | Best for Frappe |
| **Windows Runner** | $0.016/min | $0.016/min | 2x cost |
| **macOS Runner** | $0.08/min | $0.08/min | 10x cost! |

### Recommended Workflow Structure

```yaml
# .github/workflows/ci-cd.yml
name: LMS CI/CD

on:
  push:
    branches: [ production, main, develop ]
  pull_request:
    branches: [ main, develop ]

env:
  NODE_VERSION: '18'
  PYTHON_VERSION: '3.11'

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    services:
      mariadb:
        image: mariadb:10.11
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: lms_test
        options: >-
          --health-cmd="healthcheck.sh --connect=127.0.0.1"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3

      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd="redis-cli ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}
          cache: 'pip'

      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Cache pip packages
        uses: actions/cache@v4
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements*.txt') }}
          restore-keys: |
            ${{ runner.os }}-pip-

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          npm install

      - name: Run linting
        run: |
          npm run lint
          npm run type-check

      - name: Run tests
        env:
          DB_HOST: 127.0.0.1
          DB_NAME: lms_test
          DB_PASSWORD: password
        run: |
          bench --site test run-tests

      - name: Build frontend
        run: |
          npm run build:production

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    timeout-minutes: 15

    steps:
      - name: Deploy to Heroku Staging
        uses: akhileshn/heroku-deploy@v3.12.13
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: ${{ secrets.HEROKU_STAGING_APP }}
          usedocker: false

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/production'
    timeout-minutes: 15

    steps:
      - name: Deploy to DigitalOcean
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.DO_HOST }}
          username: ${{ secrets.DO_USERNAME }}
          key: ${{ secrets.DO_SSH_KEY }}
          script: |
            cd /var/www/lms
            git pull origin production
            bench restart
            npm run build:production
```

### GitHub Secrets Configuration

Required secrets to add in GitHub repository settings:

| Secret Name | Description | Required |
|-------------|---------------|-----------|
| `HEROKU_API_KEY` | Heroku API key for staging deployment | Yes |
| `HEROKU_STAGING_APP` | Heroku app name for staging | Yes |
| `DO_HOST` | DigitalOcean server hostname | Yes |
| `DO_USERNAME` | DigitalOcean server username | Yes |
| `DO_SSH_KEY` | Private SSH key for DigitalOcean access | Yes |
| `CODECOV_TOKEN` | Codecov token for coverage reporting | Yes |
| `SLACK_WEBHOOK` | Optional: Slack webhook for notifications | No |

---

## Deployment Strategy Year 1

### Phase 1: Months 1-6 (Foundation)

#### Month 1: Setup & Initial Deployment

| Week | Tasks | Platform | Cost |
|-------|--------|----------|-------|
| 1 | Activate GitHub Student Pack, setup GitHub Codespaces | GitHub Codespaces | $0 |
| 1 | Set up local development environment | Local | $0 |
| 2 | Create DigitalOcean droplet ($5/month) | DigitalOcean | $5 |
| 2 | Deploy LMS to DigitalOcean (Ubuntu 22.04) | DigitalOcean | $5 |
| 2 | Configure MariaDB + Redis on DO | DigitalOcean | $0 |
| 3 | Setup GitHub Actions CI/CD | GitHub Actions | $0 |
| 3 | Configure Heroku staging app | Heroku | $0 |
| 3 | First successful deployment | Heroku | $0 |

**Year 1 Cost: ~$10/month (after student credits)**

#### Recommended DigitalOcean Droplet Configuration

```yaml
# For Frappe LMS (moderate traffic)
 Droplet Type: Basic ($5/month)
  - CPU: 1 vCPU
  - RAM: 1 GB
  - Storage: 25 GB SSD
  - Transfer: 1 TB/month
  OS: Ubuntu 22.04 LTS

# Upgrade option (when needed): $10/month
  - CPU: 1 vCPU
  - RAM: 2 GB
  - Storage: 50 GB SSD
  - Transfer: 2 TB/month
```

### Phase 2: Months 7-12 (Stabilization)

| Focus | Tasks | Status |
|--------|--------|--------|
| **Performance** | Add database indexes, optimize queries | ⬜ |
| **Monitoring** | Set up basic monitoring logs | ⬜ |
| **Backup** | Configure automated backups to DO Spaces or local | ⬜ |
| **Scaling** | Monitor and upgrade droplet if needed | ⬜ |
| **Testing** | Increase test coverage to 50%+ | ⬜ |

#### Monitoring Stack (Free)

| Tool | Purpose | Student Pack Benefit |
|-------|-----------|---------------------|
| **GitHub Actions** | CI logs | ✅ Free |
| **Sentry** | Error tracking | ✅ Free 1 year ($300/month value) |
| **Datadog** | Infrastructure monitoring | ✅ Free 2 years ($300/month value) |

---

## Deployment Strategy Year 2

### Phase 3: Months 13-18 (Production Readiness)

**DigitalOcean Credits:** $200 (Year 1) + $200 (Year 2 renewal if available)

| Month | Tasks | Actions |
|--------|--------|----------|
| 13 | Apply for GitHub Student Pack renewal | Verify benefits |
| 13 | Request MongoDB Atlas for document storage | $50 credits |
| 14 | Deploy MongoDB for AI training datasets | MongoDB Atlas |
| 14-15 | Implement production monitoring | New Relic (free) |
| 15-16 | Load test with BrowserStack (free) | 1 parallel, 1 user |
| 17 | Review and optimize database indexes | Performance tuning |
| 18 | Year 2 planning & documentation | Prepare for post-student |

### Phase 4: Months 19-24 (Optimization & Growth)

**By this point:** Student Pack may expire. Plan for transition.

| Focus | Tasks | Post-Student Options |
|--------|--------|---------------------|
| **Performance** | Full database optimization | DigitalOcean: ~$10-20/month |
| **Scaling** | Load balancer + 2 droplets | DigitalOcean: ~$20-30/month |
| **CDN** | Add Cloudflare (free tier) | Free |
| **CI/CD** | Continue GitHub Actions | Free for public repo |
| **Analytics** | Set up comprehensive monitoring | Datadog paid or self-hosted Grafana |

---

## Cost Optimization Tips

### 1. Minimize GitHub Actions Costs

```yaml
# Use self-hosted runners when possible
jobs:
  build:
    runs-on: self-hosted  # No cost!
    # or
    runs-on: ubuntu-latest
    timeout-minutes: 10  # Set reasonable timeouts
```

**Optimizations:**
- Use dependency caching to reduce install time
- Run tests in parallel where possible
- Set appropriate `timeout-minutes` to avoid runaway jobs
- Use `needs` to skip jobs based on previous results

### 2. Optimize Frontend Build

```bash
# Use caching strategies
npm run build:production -- --modern

# Enable tree-shaking in Vite config
# Remove unused code, reduce bundle size

# Use CDN for static assets
# Upload built assets to GitHub Pages or CDN
```

### 3. Database Optimization

```sql
-- Add these indexes (see system_design.md)
ALTER TABLE `tabLMS Enrollment` ADD INDEX idx_member_course (member, course);
ALTER TABLE `tabAI Grading Submission` ADD INDEX idx_session_status (session, status);
```

**Benefits:**
- 10x faster query performance
- Reduced database load
- Lower DigitalOcean CPU usage

### 4. Cache Strategy

```python
# In frappe/lms/api.py or services/
from frappe import cache

# Cache expensive queries
@cache_result(ttl=300)  # 5 minutes
def get_courses(filters=None, start=0):
    cache_key = f"courses:{json.dumps(filters)}:{start}"
    cached = cache().get_value(cache_key)
    if cached:
        return cached
    # ... fetch logic ...
    cache().set_value(cache_key, result, expires_in_sec=300)
```

### 5. Background Job Optimization

```python
# Use Redis Queue for long-running tasks
# Don't block web requests with AI grading

# Good:
@frappe.whitelist()
def start_ai_grading(submission_id):
    frappe.enqueue(
        'lms.lms.services.ai_grading_service.grade_submission',
        queue='long',
        submission_id=submission_id
    )
    return {"status": "queued"}

# Bad (blocks request):
@frappe.whitelist()
def start_ai_grading(submission_id):
    result = grade_submission(submission_id)  # Takes 30-120 seconds!
    return result
```

---

## Alternative Deployment Options

### Option A: All-in-One with Appwrite (Student Pack)

**Benefits:**
- Free Education Plan worth $40/month
- 2 projects with Pro-level resources
- Backend-as-a-service included
- Database hosting included
- File storage included

**Setup:**
```bash
# Create Appwrite project
# Configure environment variables for Frappe:
# - DB_CONNECTION_STRING
# - REDIS_URL
# - APP_URL
# - SITE_NAME

# Deploy using Appwrite CLI
appwrite deploy
```

**Limitations:**
- Frappe requires MariaDB (Appwrite uses PostgreSQL)
- Need to use external MariaDB or adapt to PostgreSQL (major work)

### Option B: Azure App Service

**Benefits:**
- $100 credits = ~1 month of Basic tier
- Free tier available after credits expire
- Good for staging

**Setup:**
```bash
# Install Azure CLI
npm install -g azure-functions-core-tools

# Create resource group
az group create -n lms-rg

# Create MariaDB server
az mariadb server create \
  --name lms-mariadb \
  --resource-group lms-rg \
  --tier Burstable \
  --sku-name Standard_B1ms \
  --admin-password YourPassword123!

# Deploy app
az webapp up \
  --name lms-app \
  --resource-group lms-rg \
  --runtime "PYTHON:3.11"
```

### Option C: Hybrid Approach (Recommended)

**DigitalOcean for Main** + **Heroku for Staging** + **GitHub Actions for CI/CD**

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Actions (CI/CD)           │
│                      (Free - 2000 min/month)           │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────▼───────────┐
        │                           │
┌───────▼─────────┐    ┌────────▼──────────┐
│  DigitalOcean     │    │   Heroku Staging  │
│  Production      │    │   (Free credits) │
│  ($5/month)     │    └───────────────────┘
│  After DO       │
│  credits:       │
│  ~$10-20/month  │
└──────────────────┘
```

---

## Pre-Deployment Checklist

### Code Quality

- [ ] Code passes all linting checks
- [ ] Unit test coverage ≥ 50%
- [ ] Integration tests for critical paths
- [ ] No hardcoded credentials in code
- [ ] `.env.example` provided for setup
- [ ] README updated with deployment instructions

### Security

- [ ] Review all API endpoints for vulnerabilities
- [ ] Validate all user inputs
- [ ] HTTPS configured (SSL certificates)
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Sensitive data in environment variables, not code

### Database

- [ ] Database indexes created for performance
- [ ] Connection pooling configured
- [ ] Backup strategy defined
- [ ] Migration scripts tested

### Documentation

- [ ] API documentation complete
- [ ] Deployment guide created
- [ ] Troubleshooting guide available
- [ ] Monitoring/alerting documented

---

## Monitoring & Maintenance

### Daily Tasks

| Task | Tool | Frequency |
|-------|-------|-----------|
| Check GitHub Actions status | GitHub Dashboard | Daily |
| Review error logs | Sentry/Datadog | Daily |
| Check DigitalOcean droplet health | DO Dashboard | Daily |
| Review disk usage | DO Dashboard | Weekly |

### Weekly Tasks

| Task | Tool | Frequency |
|-------|-------|-----------|
| Review costs and spending | GitHub/DO/Heroku | Weekly |
| Update dependencies | pip/npm | Weekly |
| Review security advisories | GitHub Dependabot | Weekly |
| Backup database | Automated + manual | Weekly |

### Monthly Tasks

| Task | Tool | Frequency |
|-------|-------|-----------|
| Full security audit | Manual/Sentry | Monthly |
| Performance review | Datadog/Monitoring | Monthly |
| Renew Student Pack benefits | GitHub Education | Monthly |
| Update documentation | README/Docs | Monthly |

---

## Troubleshooting

### Common Issues

#### Issue: Database Connection Failed

**Symptoms:**
```
Error: Can't connect to MySQL server on '127.0.0.1'
```

**Solutions:**
```bash
# Check if MariaDB is running
sudo systemctl status mariadb

# Check logs
sudo tail -f /var/log/mariadb/mariadb.log

# Restart if needed
sudo systemctl restart mariadb
```

#### Issue: GitHub Actions Timeout

**Symptoms:**
```
Error: The operation was canceled due to timeout (30m)
```

**Solutions:**
```yaml
# Increase timeout in workflow
jobs:
  test:
    timeout-minutes: 60  # Increase from default

# Split long jobs
jobs:
  test-unit:
    timeout-minutes: 30
  test-integration:
    timeout-minutes: 30
  test-e2e:
    timeout-minutes: 30
```

#### Issue: Out of Memory on Droplet

**Symptoms:**
- Slow response times
- Processes being killed
- Swap usage high

**Solutions:**
```bash
# Check memory usage
free -h

# Add swap if needed
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Or upgrade droplet (see Year 1 Phase 1)
```

---

## Post-Student Transition Plan

### When GitHub Student Pack Expires

**Timeline:** ~2 years from graduation

**Options:**

| Option | Cost | Best For | Migration Effort |
|---------|-------|-----------|-------------------|
| **DigitalOcean Basic** | $5-10/month | Minimal (already using) |
| **Railway** | $5/month | Easy - Heroku alternative |
| **Render** | $7/month | Easy - Good for Python |
| **Fly.io** | Variable (pay-as-you-go) | Cheap for low traffic |
| **Vultr** | $6-24/month | Affordable VPS |

### Recommended: Stick with DigitalOcean

**Reasons:**
1. Already familiar with the platform
2. Competitive pricing
3. Easy scaling options
4. Good documentation
5. Active community

---

## Summary

### 2-Year Timeline

| Period | Focus | Key Platform | Expected Cost |
|---------|--------|---------------|---------------|
| **Months 1-6** | Setup & Foundation | DigitalOcean + DO credits | ~Free |
| **Months 7-12** | Stabilization | DigitalOcean + monitoring | ~Free |
| **Months 13-18** | Production Ready | DigitalOcean + MongoDB + New Relic | ~Free |
| **Months 19-24** | Optimization | DigitalOcean + potential upgrades | $5-20/month |

### Total Estimated 2-Year Cost

| Item | Year 1 | Year 2 | Total |
|-------|---------|---------|-------|
| DigitalOcean credits | $200 | $200 | $400 |
| Additional DO usage | $0-30 | $30-120 | $30-150 |
| Domain (Namecheap free 1yr) | $0 | $0 | $0 |
| Total | **$200-230** | **$230-320** | **$430-470** |

**Average monthly cost:** **$18-20** (after using all student credits)

---

## References

- [GitHub Student Developer Pack](https://education.github.com/pack)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Billing](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions)
- [DigitalOcean Pricing](https://www.digitalocean.com/pricing)
- [Heroku Pricing](https://www.heroku.com/pricing)
- [Frappe Documentation](https://frappeframework.com/docs)
- [Frappe Bench Commands](https://frappeframework.com/docs/user/en/bench)

---

*Prepared by AI Development Assistant - Tailored for GitHub Student Pack users*
