# 🚀 Deployment Guide

This guide covers deploying your portfolio with **Vercel** for frontend hosting and **Appwrite** for backend services (database & storage).

## 🏗️ Architecture

- **Frontend**: Vercel Edge Network (TanStack Start SSR)
- **Backend**: Appwrite Cloud (Database & Storage only)
- **Live Site**: [portfolio.novaplex.xyz](https://portfolio.novaplex.xyz/)

## 📋 Prerequisites

- [Vercel Account](https://vercel.com) - For frontend hosting
- [Appwrite Cloud Account](https://cloud.appwrite.io) - For backend services only
- [Bun](https://bun.sh) or Node.js installed
- Git repository connected to GitHub

## 🔧 Environment Variables

### Required Variables

Create a `.env.local` file (or configure in your hosting platform):

```bash
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=696615c200386f6d3ba3
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=696615c200386f6d3ba3
APPWRITE_API_KEY=your_api_key_here
APPWRITE_BUCKET_ID=portfolio-images

# Server Configuration
PORT=3000
NODE_ENV=production
```

## 🌐 Deploy Frontend to Vercel

**Note**: Vercel hosts the entire frontend application. Appwrite is only used for backend services (database & storage).

### Option 1: GitHub Integration (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository: `XSaitoKungX/portfolio-v2`
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
# Required for all environments (Production, Preview, Development)
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=696615c200386f6d3ba3

# Optional: Server-side API key (if using Appwrite Admin SDK)
APPWRITE_API_KEY=your_api_key_here
APPWRITE_BUCKET_ID=portfolio-images
```

### Custom Domain (Optional)

1. Go to **Project Settings → Domains**
2. Add your custom domain (e.g., `portfolio.novaplex.xyz`)
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning

## ☁️ Appwrite Backend Setup (Database & Storage Only)

### 1. Install Appwrite CLI

```bash
npm install -g appwrite-cli
```

### 2. Login to Appwrite

```bash
appwrite login
```

### 3. Deploy Backend Resources

```bash
# Push database collections
appwrite push

# Select: Collections (Legacy Databases)
# Select: Blog Posts, Projects

# Push storage buckets
appwrite push buckets

# Select: Portfolio Images
```

### 4. Set Permissions

Go to your Appwrite Console:

1. **Database → portfolio-db → blog-posts**
   - Settings → Permissions
   - Add: `Role: Any` with `Read` permission

2. **Database → portfolio-db → projects**
   - Settings → Permissions
   - Add: `Role: Any` with `Read` permission

3. **Storage → portfolio-images**
   - Settings → Permissions
   - Add: `Role: Any` with `Read` permission

## 🔄 Continuous Deployment

### Automatic Deployments (Vercel)

Vercel automatically deploys your frontend:

- **Production**: Pushes to `main` branch → [portfolio.novaplex.xyz](https://portfolio.novaplex.xyz/)
- **Preview**: Pull requests and other branches → `https://portfolio-v2-*.vercel.app`

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
│  portfolio.      │
│  novaplex.xyz    │
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

- [ ] All environment variables configured
- [ ] Appwrite collections and buckets deployed
- [ ] Permissions set correctly (read access for public data)
- [ ] RSS feed accessible at `/rss`
- [ ] Sitemap accessible at `/sitemap`
- [ ] Blog posts loading correctly
- [ ] Images loading from Appwrite storage
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

### Appwrite Connection Issues

1. Verify `VITE_APPWRITE_ENDPOINT` is correct
2. Check `VITE_APPWRITE_PROJECT_ID` matches your project
3. Ensure API key has necessary permissions
4. Check Appwrite console for CORS settings

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
- Keep Appwrite API keys secure
- Enable HTTPS (automatic on Vercel)
- Set proper CORS policies in Appwrite

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Appwrite Documentation](https://appwrite.io/docs)
- [TanStack Router Docs](https://tanstack.com/router)
- [Vite Documentation](https://vitejs.dev)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Check Appwrite console for errors
4. Verify all environment variables are set correctly
