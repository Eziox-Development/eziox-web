# 🚀 Eziox Deployment Guide

This guide covers deploying **Eziox** with **Vercel** for frontend hosting and **Neon** for the PostgreSQL database.

## 🏗️ Architecture

- **Frontend**: Vercel Edge Network (TanStack Start SSR)
- **Database**: Neon PostgreSQL (Serverless)
- **ORM**: Drizzle ORM
- **Live Site**: [eziox.link](https://eziox.link)

## 📋 Prerequisites

- [Vercel Account](https://vercel.com) - For frontend hosting
- [Neon Account](https://console.neon.tech) - For PostgreSQL database
- [Bun](https://bun.sh) or Node.js installed
- Git repository connected to GitHub

## 🔧 Environment Variables

### Required Variables

Create a `.env` file (or configure in your hosting platform):

```bash
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require

# Authentication
AUTH_SECRET=your-super-secret-key-generate-with-openssl-rand-base64-32

# Owner Account (gets admin privileges)
VITE_OWNER_EMAIL=your-email@example.com

# Server Configuration
PORT=3000
NODE_ENV=production
```

## 🌐 Deploy Frontend to Vercel

### Option 1: GitHub Integration (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel auto-detects TanStack Start configuration
4. Add environment variables (see below)
5. Click **Deploy**!

Your site will be available at: `https://your-project.vercel.app`

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Vercel Environment Variables

Add these in **Project Settings → Environment Variables**:

```bash
# Required for all environments
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
AUTH_SECRET=your-super-secret-key
VITE_OWNER_EMAIL=your-email@example.com
NODE_ENV=production
```

### Custom Domain

1. Go to **Project Settings → Domains**
2. Add your custom domain (e.g., `eziox.link`)
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning

## 🐘 Neon Database Setup

### 1. Create Neon Project

1. Go to [console.neon.tech](https://console.neon.tech)
2. Click **New Project**
3. Choose a region close to your Vercel deployment
4. Copy the connection string

### 2. Push Database Schema

```bash
# Push schema to Neon (creates all tables)
bun run db:push
```

### 3. Database Tables

The schema includes:

| Table | Purpose |
|-------|--------|
| `users` | User accounts |
| `profiles` | User profile data (bio, avatar, banner) |
| `sessions` | Auth sessions |
| `user_links` | Linktree-style links |
| `user_stats` | Profile views, clicks, score |
| `follows` | Follower relationships |
| `short_links` | URL shortener |
| `projects` | Portfolio projects |
| `activity_log` | User activity tracking |

## 🔄 Continuous Deployment

### Automatic Deployments (Vercel)

Vercel automatically deploys:

- **Production**: Pushes to `main` branch → [eziox.link](https://eziox.link)
- **Preview**: Pull requests → `https://eziox-*.vercel.app`

### Manual Deployment

```bash
# Deploy to production
bun run deploy:vercel

# Deploy preview
bun run deploy:preview
```

### Deployment Flow

```
┌──────────────────┐
│  Git Push        │
│  (main branch)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  GitHub          │
│  Repository      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Vercel          │
│  Auto-Deploy     │
│  - Build         │
│  - Deploy        │
│  - Edge Network  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Live Site       │
│  eziox.link      │
└──────────────────┘
```

## 🧪 Testing Deployment

### Local Preview

```bash
# Build for production
bun run build:prod

# Preview locally
bun run preview
```

Visit `http://localhost:4173` to test the production build locally.

### Production Checklist

- [ ] All environment variables configured in Vercel
- [ ] Database schema pushed to Neon (`bun run db:push`)
- [ ] Owner email set correctly (`VITE_OWNER_EMAIL`)
- [ ] Auth secret is secure and unique
- [ ] RSS feed accessible at `/rss`
- [ ] Leaderboard working at `/leaderboard`
- [ ] Public profiles working at `/{username}`
- [ ] Sign up/sign in working
- [ ] Theme switcher working
- [ ] Mobile responsive
- [ ] Performance optimized (check Lighthouse score)

## 🐛 Troubleshooting

### Build Fails

```bash
# Clean build cache
bun run clean

# Regenerate routes
bun run generate:routes

# Try building again
bun run build
```

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check Neon project is active (not suspended)
3. Ensure connection string includes `?sslmode=require`
4. Check Neon dashboard for connection limits

### 404 on Routes

- Ensure `vercel.json` rewrites are configured
- Check that all routes are generated in `routeTree.gen.ts`
- Verify TanStack Router configuration

## 📊 Performance Optimization

### Implemented Optimizations

- ✅ Code splitting (React, TanStack, UI vendors)
- ✅ Image optimization with lazy loading
- ✅ CSS minification
- ✅ Gzip compression
- ✅ Cache headers for static assets
- ✅ RSS and Sitemap caching

### Monitoring

Use Vercel Analytics to monitor:

- Page load times
- Core Web Vitals
- Error rates
- Traffic patterns

## 🔐 Security

### Best Practices

- Never commit `.env` or `.env.local` files
- Use environment variables for all secrets
- Generate strong `AUTH_SECRET` with `openssl rand -base64 32`
- Enable HTTPS (automatic on Vercel)
- Use secure session cookies (httpOnly, secure, sameSite)

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [TanStack Start Docs](https://tanstack.com/start)
- [TanStack Router Docs](https://tanstack.com/router)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Check Neon dashboard for database status
4. Verify all environment variables are set correctly
5. Run `bun run db:push` to sync schema
