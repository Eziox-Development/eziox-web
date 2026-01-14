# Eziox Production Checklist

> **Eziox Development** · [eziox.link](https://eziox.link)

## Pre-Deployment

### Code Quality
- [ ] TypeScript builds without errors (`bun run build`)
- [ ] Linting passes (`bun run lint`)
- [ ] Code formatted (`bun run format`)

### Configuration
- [ ] `.env` configured with production values
- [ ] `DATABASE_URL` set to Neon connection string
- [ ] `AUTH_SECRET` generated securely
- [ ] `VITE_OWNER_EMAIL` set to admin email

## Database (Neon)

- [ ] Neon project created
- [ ] Schema pushed (`bun run db:push`)
- [ ] Tables verified:
  - [ ] `users`, `profiles`, `sessions`
  - [ ] `user_links`, `user_stats`
  - [ ] `follows`, `short_links`

## Vercel Deployment

- [ ] GitHub repo connected
- [ ] Environment variables configured
- [ ] Custom domain: `eziox.link`
- [ ] SSL certificate active

## Post-Deployment Testing

### Core Functionality
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Theme switcher functional
- [ ] RSS feed at `/rss`
- [ ] Sitemap at `/sitemap`

### User System
- [ ] Sign up works
- [ ] Sign in works
- [ ] Sign out clears session
- [ ] Profile page loads
- [ ] Public profile at `/{username}`
- [ ] Leaderboard at `/leaderboard`
- [ ] Bio links CRUD
- [ ] Link management at `/links`

### Performance
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Mobile responsive

### Cross-Browser
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

## Security

- [ ] HTTPS enforced
- [ ] Secrets not exposed in client
- [ ] Passwords hashed (bcrypt)
- [ ] Session cookies secure

## Rollback Plan

```bash
# Revert to previous deployment
vercel rollback
```

---

**Last Updated**: 2026-01-14
