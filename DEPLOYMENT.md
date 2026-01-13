# 🚀 Deployment Guide

This guide covers deploying your portfolio to both Vercel and Appwrite.

## 📋 Prerequisites

- [Vercel Account](https://vercel.com)
- [Appwrite Cloud Account](https://cloud.appwrite.io) or self-hosted instance
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

## 🌐 Deploy to Vercel

### Option 1: Vercel CLI (Recommended)

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

### Option 2: GitHub Integration

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `bun run build`
   - **Output Directory**: `dist`
   - **Install Command**: `bun install`
4. Add environment variables in Vercel dashboard
5. Deploy!

### Vercel Environment Variables

Add these in **Project Settings → Environment Variables**:

```
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=696615c200386f6d3ba3
```

## ☁️ Appwrite Backend Setup

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

### Automatic Deployments

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

### Manual Deployment

```bash
# Deploy to production
bun run deploy:vercel

# Deploy preview
bun run deploy:preview
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
