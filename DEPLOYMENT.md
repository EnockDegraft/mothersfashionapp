# Deployment Guide

Deploy the Mother Clothing Ltd. Inventory Management System to production.

## Option 1: Deploy to Vercel (Recommended)

### Prerequisites

- Vercel account (https://vercel.com)
- GitHub repository (optional but recommended)
- Supabase project fully configured

### Step 1: Prepare Your Project

```bash
# Install dependencies
pnpm install

# Build locally to verify no errors
pnpm build
```

### Step 2: Connect to GitHub (Optional but Recommended)

1. Push your project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/mother-clothing-app.git
   git push -u origin main
   ```

### Step 3: Deploy to Vercel

#### Option A: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository or upload project
4. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click "Deploy"

#### Option B: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow prompts to set environment variables

### Step 4: Configure Environment Variables

After deployment:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add your Supabase credentials:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Your Supabase URL
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon key
4. Redeploy after adding variables

### Step 5: Configure Supabase

In your Supabase project settings:

1. Go to "Auth" → "URL Configuration"
2. Add your Vercel domain to "Site URL":
   ```
   https://your-app.vercel.app
   ```
3. Add redirect URL for email confirmations:
   ```
   https://your-app.vercel.app/auth/callback
   ```

### Step 6: Update Email Redirect

If using email confirmation, update environment variable in Vercel:

```
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://your-app.vercel.app/protected
```

## Option 2: Deploy to Self-Hosted Server

### Prerequisites

- Linux server with Node.js 18+
- PostgreSQL or external Supabase instance
- Domain name and SSL certificate
- SSH access to server

### Step 1: Build the Project

```bash
pnpm build
```

This creates an optimized production build in the `.next` folder.

### Step 2: Deploy to Server

1. Copy project to server:
   ```bash
   scp -r .next server:/var/www/mother-clothing/
   scp -r public server:/var/www/mother-clothing/
   scp package.json server:/var/www/mother-clothing/
   scp pnpm-lock.yaml server:/var/www/mother-clothing/
   ```

2. SSH into server and install dependencies:
   ```bash
   cd /var/www/mother-clothing
   pnpm install --prod
   ```

### Step 3: Set Environment Variables

Create `.env.local` on server:

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### Step 4: Run with PM2

1. Install PM2:
   ```bash
   npm i -g pm2
   ```

2. Start the application:
   ```bash
   pm2 start "pnpm start" --name "mother-clothing"
   pm2 save
   pm2 startup
   ```

### Step 5: Configure Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 6: Enable HTTPS (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Post-Deployment Steps

### 1. Test the Application

- [ ] Visit your deployed URL
- [ ] Create a test account
- [ ] Test login/logout
- [ ] Add a test product
- [ ] Create a test customer
- [ ] Create a test order
- [ ] Check analytics dashboard

### 2. Set Up Supabase Backups

In Supabase project:

1. Go to "Settings" → "Backups"
2. Enable automatic daily backups
3. Configure backup retention period

### 3. Monitor Application

Set up monitoring:

- **Vercel**: Check deployment logs in dashboard
- **Sentry** (optional): Add error tracking
- **LogRocket** (optional): Add session replay

### 4. Configure Email Sending

For email confirmations and notifications:

1. In Supabase, go to "Authentication" → "Email Templates"
2. Customize email templates as needed
3. Set up SMTP if using custom emails

### 5. Set Up Regular Backups

1. Export data regularly from Supabase
2. Store backups securely
3. Test restore procedures

## Scaling Considerations

### For Growing Data

- Set up Supabase connection pooling
- Enable CDN for static assets (already on Vercel)
- Monitor database query performance

### For More Users

- Enable Supabase caching
- Implement rate limiting
- Add API load balancing

### Database Maintenance

```sql
-- Analyze table performance
ANALYZE products;
ANALYZE orders;
ANALYZE customers;

-- Rebuild indexes if needed
REINDEX INDEX idx_product_id;
```

## Performance Optimization

### Frontend

- Images are optimized via Next.js Image component
- CSS is minified automatically
- JavaScript is split and lazy-loaded

### Backend

- RLS policies optimize database queries
- Supabase provides built-in caching
- Connection pooling reduces overhead

## Disaster Recovery

### Database Recovery

1. Check Supabase backup status
2. Go to "Backups" → Restore from backup
3. Select desired point in time
4. Confirm restore

### Application Recovery

#### On Vercel:
1. Go to Deployments
2. Select previous stable deployment
3. Click "Redeploy"

#### On Self-Hosted:
1. Restore from git:
   ```bash
   git revert <commit-hash>
   pnpm build
   pm2 restart mother-clothing
   ```

## Security Checklist

- [ ] Supabase RLS policies enabled
- [ ] Email verification required for signup
- [ ] Strong password policy enforced
- [ ] HTTPS enabled (Vercel automatic)
- [ ] Environment variables secured
- [ ] Regular backups configured
- [ ] Monitoring and logging enabled
- [ ] Security headers configured

## Ongoing Maintenance

### Weekly

- Check application logs for errors
- Monitor user feedback

### Monthly

- Review Supabase usage and costs
- Check for security updates
- Test backup restoration

### Quarterly

- Audit user accounts
- Review access logs
- Update dependencies (if needed)

## Support

For deployment issues:

1. Check Vercel deployment logs
2. Verify Supabase connection
3. Review Next.js documentation
4. Check environment variables

## Rollback Procedure

If issues occur after deployment:

### Vercel Rollback

1. Go to project Deployments
2. Find the last working deployment
3. Click three dots → "Redeploy"

### Manual Rollback

```bash
# Revert to previous version
git revert HEAD
git push

# Redeploy
vercel --prod
```

---

Congratulations! Your application is now deployed and ready for use.
