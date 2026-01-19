<div align="center">

<img src="public/eziox.png" alt="Eziox Logo" width="120" height="120" />

# Eziox

### Modern Bio Link Platform

[![Live Site](https://img.shields.io/badge/🌐_Live-eziox.link-6366f1?style=for-the-badge&labelColor=1e293b)](https://eziox.link)
[![GitHub](https://img.shields.io/badge/GitHub-Eziox--Development-181717?style=for-the-badge&logo=github)](https://github.com/Eziox-Development)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/TanStack_Start-SSR-FF4154?style=flat-square" alt="TanStack Start"/>
  <img src="https://img.shields.io/badge/Bun-Runtime-000000?style=flat-square&logo=bun&logoColor=white" alt="Bun"/>
  <img src="https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=flat-square&logo=postgresql&logoColor=white" alt="Neon"/>
</p>

**Create your personalized bio page • Track analytics • Climb the leaderboard**

[Live Demo](https://eziox.link) · [Report Bug](https://github.com/Eziox-Development/eziox-web/issues) · [Request Feature](https://github.com/Eziox-Development/eziox-web/issues)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔗 **Bio Links** | Linktree-style customizable link pages |
| 💎 **Premium Tiers** | Free, Pro, Creator & Lifetime subscriptions |
| 📊 **Analytics Dashboard** | Track views, clicks, top links, referrers with charts |
| 🔔 **Notifications** | Real-time notification center with bell icon |
| 🎵 **Spotify Integration** | Display currently playing music on bio page |
| 🏆 **Leaderboard** | User ranking system with podium display |
| 👤 **Profiles** | Custom avatars, banners, bios, social links |
| 🔐 **Auth** | Secure session-based authentication |
| 🎨 **Themes** | 30+ beautiful theme variants across 8 categories |
| 🎮 **Playground** | Create & test presets with live preview |
| 📋 **Templates** | Browse & apply community templates |
| 💳 **Stripe Payments** | Secure subscription & one-time payments |
| 📱 **Responsive** | Mobile-first design |
| ⚡ **Fast** | Bun runtime + Vercel Edge |

## 💎 Premium Tiers

| Tier | Price | Highlights |
|------|-------|------------|
| **Eziox Core** | Free | Unlimited links, embeds, basic analytics |
| **Pro** | €4.99/mo | Remove branding, realtime analytics, custom backgrounds |
| **Creator** | €9.99/mo | Custom CSS, fonts, animations, A/B testing, UTM tracking |
| **Lifetime** | €30 once | All Creator features forever, exclusive badge |

## 🛠️ Tech Stack

**Frontend:** React 19 • TypeScript 5.9 • TanStack Start (SSR) • TanStack Router & Query • Tailwind CSS 4 • shadcn/ui • Motion

**Backend:** Neon PostgreSQL • Drizzle ORM • Bun Runtime • bcrypt

**Deployment:** Vercel Edge Network • Automatic CI/CD

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/Eziox-Development/eziox-web.git
cd eziox-web

# Install dependencies
bun install

# Configure environment
cp .env.example .env
# Edit .env with your Neon database URL and auth secret

# Start development server
bun run dev
```

### Environment Variables

```bash
DATABASE_URL=postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require
AUTH_SECRET=your-super-secret-key
VITE_OWNER_EMAIL=your-email@example.com

# Optional: Spotify Integration
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SPOTIFY_REDIRECT_URI=https://your-domain.com/api/spotify-callback

# Optional: Stripe Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_CREATOR_PRICE_ID=price_...
STRIPE_LIFETIME_PRICE_ID=price_...
APP_URL=https://your-domain.com
```

> Get your `DATABASE_URL` from [console.neon.tech](https://console.neon.tech)  
> Get Spotify credentials from [developer.spotify.com](https://developer.spotify.com/dashboard)  
> Get Stripe keys from [dashboard.stripe.com](https://dashboard.stripe.com/apikeys)

## 📜 Scripts

```bash
bun run dev          # Development server
bun run build        # Production build
bun run lint         # Lint code
bun run format       # Format code
bun run db:push      # Push database schema
```

## 📁 Project Structure

```
src/
├── components/      # React components (portfolio/, ui/)
├── hooks/           # Custom React hooks
├── lib/             # Utilities & config
├── routes/          # TanStack Router routes
│   ├── _public/     # Public routes
│   ├── _auth/       # Auth routes
│   ├── _protected/  # Protected routes
│   └── _bio/        # Bio page routes
└── server/          # Server-side code
    ├── db/          # Database schema
    ├── functions/   # Server functions
    └── lib/         # Auth utilities
```

## 🚀 Deployment

Deployed automatically via Vercel on push to `main`.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**[Eziox Development](https://github.com/Eziox-Development)** · Made with ❤️

<p>
  <a href="https://eziox.link">Website</a> •
  <a href="https://github.com/Eziox-Development/eziox-web">GitHub</a> •
  <a href="https://github.com/Eziox-Development/eziox-web/issues">Issues</a>
</p>

</div>
