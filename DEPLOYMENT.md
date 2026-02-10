# Eziox Deployment Guide

> **Eziox Development** · [eziox.link](https://eziox.link)

## Architecture

```
User → Vercel Edge → TanStack Start SSR → Neon PostgreSQL
```

| Component | Service                      |
| --------- | ---------------------------- |
| Frontend  | Vercel Edge Network          |
| Database  | Neon PostgreSQL (Serverless) |
| ORM       | Drizzle ORM                  |
| Domain    | eziox.link                   |

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

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Eziox <noreply@eziox.link>
ADMIN_EMAIL=support@eziox.link

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

| Table                 | Purpose                    |
| --------------------- | -------------------------- |
| `users`               | User accounts              |
| `profiles`            | Bio, avatar, banner        |
| `sessions`            | Auth sessions              |
| `user_links`          | Bio links                  |
| `user_stats`          | Views, clicks, score       |
| `follows`             | Follower relationships     |
| `short_links`         | URL shortener              |
| `spotify_connections` | Spotify OAuth tokens       |
| `notifications`       | User notifications         |
| `analytics_daily`     | Aggregated daily analytics |
| `status_incidents`    | Service incident tracking  |
| `status_incident_updates` | Incident timeline updates |
| `status_subscriptions`| Status email subscribers   |
| `support_tickets`     | Support ticket system      |
| `ticket_messages`     | Ticket message threads     |

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

## Resend Email Setup

Eziox uses [Resend](https://resend.com) for all transactional and automated emails.

### 1. Create Resend Account

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (`eziox.link`) under **Domains**
3. Add the required DNS records (SPF, DKIM, DMARC)
4. Generate an API key under **API Keys**
5. Set `RESEND_API_KEY` in your environment

### 2. Domain Verification (DNS Records)

| Type  | Name                        | Value                          |
|-------|-----------------------------|--------------------------------|
| TXT   | `@`                         | `v=spf1 include:resend.com ~all` |
| CNAME | `resend._domainkey`         | *(provided by Resend)*         |
| TXT   | `_dmarc`                    | `v=DMARC1; p=none;`           |

### 3. Email Types & Automation

All emails are sent via `src/server/lib/email.ts` using the `sendEmail()` and `generateEmailTemplate()` helpers.

| Email Type | Trigger | User Opt-out |
|------------|---------|-------------|
| Welcome | User registration | No |
| Email verification | Registration / email change | No |
| Password reset | User request | No |
| Login notification | New login detected | `emailLoginAlerts` |
| Password changed | Password update | No |
| 2FA enabled/disabled | 2FA toggle | No |
| Account deletion | Account deleted | No |
| Subscription events | Stripe webhook | No |
| Ticket confirmation | Support ticket created | No |
| Weekly digest | Cron job (planned) | `emailWeeklyDigest` |
| Product updates | Manual / admin trigger | `emailProductUpdates` |
| Status alerts | Incident created/resolved | `emailStatusAlerts` + status subscription |
| Security alerts | Suspicious activity | `emailSecurityAlerts` |
| Abuse alerts | Abuse detection | Admin only |

### 4. User Email Preferences

Users can opt-in/opt-out of email categories in **Profile → Settings → Notifications**:

- `emailLoginAlerts` — Login notifications (default: on)
- `emailSecurityAlerts` — Security warnings (default: on)
- `emailWeeklyDigest` — Weekly stats summary (default: on)
- `emailProductUpdates` — Product news (default: on)
- `emailStatusAlerts` — Service status incidents (default: off)

These are stored as boolean columns on the `profiles` table.

### 5. Status Subscriptions (Public)

Non-authenticated users can subscribe to status notifications via the `/status` page:

1. User enters email → verification email sent
2. User clicks verification link → subscription confirmed
3. When incidents are created/updated → all verified subscribers notified
4. Each email includes an unsubscribe link with a unique token

### 6. Sending Automated Emails (Code Example)

```typescript
import { sendEmail, generateEmailTemplate } from '../lib/email'

await sendEmail({
  to: 'user@example.com',
  subject: 'Your Subject',
  html: generateEmailTemplate({
    title: 'Email Title',
    subtitle: 'Hey @username, here is your update.',
    content: '<p>Your HTML content here</p>',
    buttonText: 'Call to Action',    // optional
    buttonUrl: 'https://eziox.link', // optional
    footer: 'Additional footer text', // optional
  }),
})
```

### 7. Resend Rate Limits

| Plan | Daily Limit | Rate |
|------|-------------|------|
| Free | 100 emails/day | 1/sec |
| Pro | 50,000 emails/day | 10/sec |
| Enterprise | Unlimited | Custom |

For production, use the **Pro plan** ($20/mo) to handle status notifications and transactional emails at scale.

## Resources

- [Vercel Docs](https://vercel.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [TanStack Start](https://tanstack.com/start)
- [Resend Docs](https://resend.com/docs)
- [Resend Domain Setup](https://resend.com/docs/dashboard/domains/introduction)

---

**Eziox Development** · [GitHub](https://github.com/Eziox-Development)
