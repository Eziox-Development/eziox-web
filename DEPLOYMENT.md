# Eziox Deployment Guide

> **Eziox Development** · [eziox.link](https://eziox.link)

## Architecture

```
User → Vercel Edge → TanStack Start SSR → Neon PostgreSQL
```

| Component | Service |
|-----------|---------|
| Frontend | Vercel Edge Network |
| Database | Neon PostgreSQL (Serverless) |
| ORM | Drizzle ORM |
| Domain | eziox.link |

## Prerequisites

- [Vercel Account](https://vercel.com)
- [Neon Account](https://console.neon.tech)
- [Bun](https://bun.sh) installed
- GitHub repository

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
AUTH_SECRET=your-super-secret-key  # Generate: openssl rand -base64 32
VITE_OWNER_EMAIL=your-email@example.com
NODE_ENV=production

# Optional: Spotify Integration
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SPOTIFY_REDIRECT_URI=https://eziox.link/api/spotify-callback
```

## Deploy to Vercel

### GitHub Integration (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `Eziox-Development/eziox-web`
3. Add environment variables
4. Deploy

### Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

## Neon Database Setup

1. Create project at [console.neon.tech](https://console.neon.tech)
2. Copy connection string to `DATABASE_URL`
3. Push schema: `bun run db:push`

### Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts |
| `profiles` | Bio, avatar, banner |
| `sessions` | Auth sessions |
| `user_links` | Bio links |
| `user_stats` | Views, clicks, score |
| `follows` | Follower relationships |
| `short_links` | URL shortener |
| `spotify_connections` | Spotify OAuth tokens |
| `notifications` | User notifications |
| `analytics_daily` | Aggregated daily analytics |

## Continuous Deployment

- **Production**: Push to `main` → auto-deploy to [eziox.link](https://eziox.link)
- **Preview**: Pull requests → preview URL

## Troubleshooting

### Build Fails

```bash
bun run clean
bun run generate:routes
bun run build
```

### Database Issues

1. Verify `DATABASE_URL` is correct
2. Check Neon project is active
3. Ensure `?sslmode=require` in connection string

## Security

- Never commit `.env` files
- Generate strong `AUTH_SECRET`: `openssl rand -base64 32`
- HTTPS enforced automatically on Vercel

## Resources

- [Vercel Docs](https://vercel.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [TanStack Start](https://tanstack.com/start)

---

**Eziox Development** · [GitHub](https://github.com/Eziox-Development)
