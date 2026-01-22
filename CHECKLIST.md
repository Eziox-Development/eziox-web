# Eziox Development Checklist & Roadmap

> **Eziox Development** · [eziox.link](https://eziox.link)

---

## ✅ Completed Features

### Core Platform

- [x] Bio link pages at `/{username}`
- [x] Link management (integrated in `/profile`)
- [x] User authentication (sign-up, sign-in, sign-out)
- [x] Profile customization (avatar, banner, bio, socials)
- [x] Leaderboard with podium display
- [x] Theme system (30+ themes)
- [x] URL shortener (`/s/{code}`)
- [x] Profile view tracking
- [x] RSS feed & Sitemap
- [x] Email verification system (`/verify-email`)
- [x] Contact form (`/contact`)
- [x] Status page (`/status`)
- [x] Pricing page (`/pricing`)

### Recent Updates (2026-01-22)

- [x] **Profile Tab URL Persistence** - Tabs now use `?tab=` query params
  - [x] Stays on current tab after page reload
  - [x] Shareable tab URLs

### Recent Updates (2026-01-17)

- [x] **Enhanced Analytics Dashboard** - Profile performance tracking
  - [x] Overview stats with change indicators
  - [x] Interactive daily activity chart
  - [x] Top links and referrer tracking
  - [x] Time range selector (7D-1Y)
  - [x] CSV/JSON export (Pro+ tier)
- [x] **Notifications System** - Real-time notification center
  - [x] NotificationBell in navbar
  - [x] Multiple notification types
  - [x] Mark as read / delete functionality
  - [x] Unread count badge
  - [x] Follow notifications (auto-created on follow)

### Previous Updates (2026-01-16)

- [x] **Spotify Integration** - Complete OAuth flow with real-time playback
  - [x] OAuth authentication with token refresh
  - [x] NowPlaying widget on bio pages
  - [x] Live progress bar with animations
  - [x] Offline/Not listening state
  - [x] Privacy toggle in settings
  - [x] SpotifyConnect component

### Previous Updates (2026-01-15)

- [x] **FollowModal Component** - Modern modal-based UI for followers/following
- [x] **Dynamic Page Titles & SEO** - Enhanced metadata across all pages
- [x] **Profile Page Redesign** - 2-column layout with sidebar
- [x] **Leaderboard Redesign** - Enhanced podium with placeholders
- [x] **Public Pages Redesign** - Complete UI overhaul (Home, About, Changelog)
- [x] **React Hydration Error #300** - Fixed SSR/CSR mismatch
- [x] **Avatar Display Fix** - Corrected profile sidebar rendering
- [x] **ESLint Errors** - Code quality improvements

### Previous Updates (2026-01-14)

- [x] Modernized `/links` page with stats cards
- [x] Fixed link click tracking
- [x] Updated documentation for Eziox Development
- [x] Added MIT License
- [x] **Followers System** - Complete with list pages
- [x] **Bio Page UI Improvements** - Glassmorphism, animations
- [x] **Following Count** - Added to stats section
- [x] **CHANGELOG.md** - Created project changelog

---

## 🔧 Bug Fixes Completed

### High Priority ✅

- [x] **Link Click Tracking** - Fixed with COALESCE and proper error handling
- [x] **Session Persistence** - 7-day expiry working correctly
- [x] **View Tracking** - Fixed session-based deduplication (no tab-switch counting)
- [x] **Session Detection** - Fixed on bio pages using useRouterState

---

## 🚀 Feature Roadmap

### Phase 1: Social Features (Priority: HIGH) ✅ COMPLETED

#### 1. Followers System ✅ COMPLETED

- [x] Follow/Unfollow button on bio pages
- [x] Followers/Following counts in profile (real-time)
- [x] Server functions for follow/unfollow
- [x] Optimistic UI updates
- [x] Update `follows` table usage
- [x] Increment/decrement `userStats.followers` and `userStats.following`
- [x] Sign-in prompt for non-authenticated users
- [x] **FollowModal Component** - Modern modal UI (replaces separate pages)
  - [x] Tab-based navigation (Followers/Following)
  - [x] Real-time search and filtering
  - [x] Auto-refresh every 30 seconds
  - [x] Glass-morphism design
  - [x] Follow/unfollow from modal
- [x] Follow notifications (auto-created via `createFollowerNotification`)

#### 2. Referral System ✅ COMPLETED

- [x] Generate unique referral codes per user
- [x] Referral link format: `eziox.link/join/{code}`
- [x] Track referral signups in database
- [x] New table: `referrals` (referrer_id, referred_id, code, created_at)
- [x] Referral stats in profile/dashboard (`/referrals`)
- [x] **Owner-only referral code** - Special "EZIOX" code for owner
- [x] Score rewards (+5 per referral)
- [x] QR code for referral link (using `qrcode` package)
- [ ] Premium days rewards - Future

#### 3. Badge System ✅ COMPLETED

- [x] Badge types:
  - [x] `owner` - Platform owner
  - [x] `admin` - Platform administrator
  - [x] `verified` - Verified creator
  - [x] `premium` - Premium subscriber
  - [x] `early_adopter` - Early platform users (first 100)
  - [x] `referral_master` - 10+ referrals
  - [x] `creator` - Content creator badge
  - [x] `vtuber` - VTuber badge
  - [x] `streamer` - Streamer badge
  - [x] `artist` - Digital artist badge
  - [x] `developer` - Software developer badge
  - [x] `musician` - Music creator badge
  - [x] `gamer` - Gaming enthusiast badge
  - [x] `other` - General creator badge
  - [x] `partner` - Official partner
- [x] Badge configuration (`src/lib/badges.ts`)
- [x] Badge display on bio pages (`BadgeDisplay` component)
- [x] Badge display in profile dashboard
- [x] Badges tab in dashboard with progress tracking
- [x] Badge management in admin panel (`/admin`)
- [x] Auto-award badges on signup (early_adopter, premium, owner, admin)
- [x] Server functions: assign, remove, check badges

### Phase 2: Creator Features (Priority: HIGH) ✅ COMPLETED

#### 4. Creator/Partner Page ✅ COMPLETED

- [x] Routes: `/creators` and `/partners`
- [x] Partner application system (`partnerApplications` table)
- [x] Admin review panel (`/admin/partner-applications`)
- [x] Showcase referred creators (VTubers, Streamers)
- [x] Creator cards with:
  - [x] Avatar, name, bio
  - [x] Platform links (Twitch, YouTube, etc.)
  - [x] Special partner badge
  - [x] "Joined via [Owner]'s referral"
- [x] Featured creators section
- [x] Filter by category (VTuber, Streamer, Artist, etc.)

#### 5. Spotify Integration ✅ COMPLETED

- [x] Spotify OAuth connection
- [x] New table: `spotify_connections` (user_id, access_token, refresh_token, expires_at)
- [x] Display "Currently Listening" on bio page
- [x] Show:
  - [x] Song title & artist
  - [x] Album art
  - [x] Progress bar with live updates
  - [x] "Offline/Not listening" state with animation
- [x] Spotify link to song
- [x] Auto-refresh token handling
- [x] Privacy toggle (show/hide activity in settings)

### Phase 3: Analytics & Engagement (Priority: MEDIUM) ✅ COMPLETED

#### 6. Enhanced Analytics ✅ COMPLETED

- [x] Analytics dashboard (`/analytics`)
- [x] Charts for:
  - [x] Profile views over time
  - [x] Link clicks over time
  - [x] Top performing links
  - [x] Visitor sources (referrer)
- [x] Export analytics data (CSV/JSON) - Pro+ tier
- [x] Daily/Weekly/Monthly views (7D/30D/90D/1Y selector)
- [x] New table: `analytics_daily` for aggregated stats
- [x] New table: `linkClickAnalytics` for detailed per-click tracking
- [x] New table: `profileViewAnalytics` for detailed per-view tracking

#### 7. Notifications System ✅ COMPLETED

- [x] New table: `notifications`
- [x] Notification types:
  - [x] New follower (auto-created on follow)
  - [x] Profile milestone (100 views, etc.)
  - [x] Link milestone (100 clicks)
  - [x] Badge earned
  - [x] System announcements
- [x] Notification bell in navbar (lazy loaded)
- [x] Mark as read functionality (individual & bulk)
- [x] Delete notifications (individual & clear all)
- [x] Unread count badge with auto-refresh
- [x] Notification preferences in settings (toggle per type)
- [ ] Email notifications (optional) - Future

### Phase 4: Premium Features (Priority: MEDIUM) ✅ COMPLETED

#### 8. Premium Tiers ✅ COMPLETED

> **Philosophy:**  
> Free is fully usable. Paid tiers improve comfort, control, and polish — **not access**.  
> Everyone gets the core experience. Premium is about refinement, not restriction.

- [x] Tier system:
  - [x] **Free (Eziox Core)** — The complete Eziox experience
    - Unlimited links and short links
    - All 30+ themes, colors, backgrounds, and animations
    - Spotify, SoundCloud & YouTube embeds
    - Social icons, profile picture, banner & bio customization
    - Full analytics dashboard (30-day retention) with no paywalls
    - Mobile-optimized responsive design + public/private link visibility
    - **Limitations:** Subtle "Powered by Eziox" branding, no custom CSS/domain, analytics exports disabled

  - [x] **Pro** (€2,99/month) — Essential power features
    - Everything in Free, plus:
    - Custom CSS styling (sandboxed, `updateCustomCSSFn`)
    - Upload custom fonts (`addCustomFontFn`, max 4)
    - Remove Eziox branding
    - Profile backups & restore history (`profileBackups` in schema)
    - Export analytics data (CSV/JSON)
    - Pro badge on profile

  - [x] **Creator** (€5,99/month) — Professional toolkit
    - Everything in Pro, plus:
    - Custom domain support (`customDomains` table)
    - Password-protected & expiring links (schema ready)
    - Email collection forms (`emailSubscribers` table)
    - Custom Open Graph previews (`updateOpenGraphFn`)
    - Link scheduling (`updateLinkScheduleFn`)
    - Featured links with styles (`updateFeaturedLinkFn`)
    - Animated profile settings (`updateAnimatedProfileFn`)
    - Priority email support + early access to new features
    - Creator badge on profile

  - [x] **Lifetime** (€29 einmalig) — Forever supporter
    - Everything in Creator, permanently
    - All future Creator features included
    - Exclusive Lifetime badge & priority support forever
    - One-time payment, no renewals ever

- [x] Stripe integration for payments (`/api/webhooks/stripe`)
- [x] Subscription management (`subscriptions` table)
- [x] Premium badge display
- [x] Tier-based feature gating (`canAccessFeature` helper)

#### 9. Custom Themes ✅ COMPLETED

- [x] Theme builder for premium users (`/theme-builder`)
- [x] Custom colors, fonts, backgrounds
- [x] Theme presets (6 quick-start presets)
- [x] Import/Export themes
- [x] Custom theme storage (`customThemes` in profile)

#### 10. Community Templates ✅ COMPLETED

- [x] Templates page (`/templates`)
- [x] New table: `communityTemplates`
- [x] New table: `templateLikes`
- [x] Browse public templates
- [x] Featured templates section
- [x] Category filtering (VTuber, Gamer, Developer, etc.)
- [x] Search and sort (popular, newest, liked)
- [x] Apply template to profile
- [x] Like templates
- [x] Server functions: `getPublicTemplatesFn`, `getFeaturedTemplatesFn`, `applyTemplateFn`, `likeTemplateFn`

### Phase 5: Advanced Features (Priority: LOW)

#### 11. Link Scheduling ✅ COMPLETED

- [x] Schedule links to appear/disappear (`LinkSchedule` schema with startDate/endDate)
- [x] Time-limited links (endDate support with hideWhenExpired option)
- [x] Countdown timer display (showCountdown, countdownStyle: minimal/detailed/badge)
- [x] Server function: `updateLinkScheduleFn`

#### 12. QR Codes ✅ COMPLETED

- [x] QR code for referral links (in ReferralsTab with modal)
- [x] QR code for bio page URL (in ProfileSidebar)
- [x] `qrcode` package installed
- [x] QR code style schema in `userLinks` (`qrCodeStyle`)
- [x] Downloadable QR images (PNG download button)
- [x] Custom QR colors UI (color presets + custom color pickers)
- [x] Share button with Web Share API fallback

#### 13. Link Analytics ✅ COMPLETED

- [x] Per-link click analytics (`linkClickAnalytics` table)
- [x] Geographic data (country, city, region fields)
- [x] Device/browser stats (device, browser, os tracking)
- [x] Click heatmap (hourlyClicks aggregation by day/hour)
- [x] Referrer tracking

#### 14. API Access

- [ ] Public API for profile data
- [ ] API keys management
- [ ] Rate limiting (internal only, no public API yet)
- [ ] Webhook support (Stripe webhooks only)

### Phase 6: Database Features (Schema Ready, UI Pending)

#### 15. Link Groups

- [x] Schema: `linkGroups` table
- [x] Fields: name, icon, color, isCollapsible, isCollapsed, order
- [ ] UI: Group links into sections
- [ ] UI: Collapsible groups on bio page

#### 16. Profile Widgets

- [x] Schema: `profileWidgets` table
- [x] Widget types defined (Spotify, Weather, Countdown, Social Feed)
- [ ] UI: Widget management in dashboard
- [ ] UI: Widget display on bio page

#### 17. Social Integrations (Beyond Spotify)

- [x] Schema: `socialIntegrations` table
- [x] Fields: platform, accessToken, refreshToken, showOnProfile
- [ ] UI: Connect additional platforms (YouTube, Twitch, Discord)
- [ ] OAuth flows for other platforms

#### 18. Media Library

- [x] Schema: `mediaLibrary` table
- [x] Fields: filename, mimeType, size, url, thumbnailUrl, folder
- [ ] UI: Media library in dashboard
- [ ] UI: Reuse uploaded images

#### 19. Scheduled Posts

- [x] Schema: `scheduledPosts` table
- [x] Fields: linkId, action, scheduledFor, executedAt, status
- [ ] Backend: Cron job to execute scheduled actions
- [ ] UI: Schedule link visibility changes

---

## 🔒 Security Considerations

### Authentication & Sessions

- [x] Secure password hashing (bcrypt with cost 12)
- [x] HTTP-only session cookies
- [x] Secure cookie flag in production
- [x] SameSite=Lax cookie policy
- [x] Session expiry (7 days / 30 days with Remember Me)
- [x] Password complexity requirements (uppercase, lowercase, number, min 8 chars)
- [x] Session refresh/rotation on sensitive actions
- [x] "Remember me" option (30 days vs 7 days session)
- [x] Account lockout after 5 failed login attempts (30 min)
- [x] 2FA/MFA support (TOTP with QR code)
- [x] 2FA recovery codes (10 codes, one-time use, regeneratable)
- [x] Password reset with rate limiting (3/hour)
- [x] Login notification emails (Resend integration)
- [x] **User-Agent tracking** with comprehensive browser detection (`user-agent.ts`)
  - Supports: Chrome, Firefox, Safari, Edge, Opera, Brave, Vivaldi, Arc, Tor, OperaGX, Samsung Internet, UC Browser, Yandex, DuckDuckGo, Whale
  - OS detection: Windows 7-11, macOS, Linux, iOS, Android, Chrome OS
  - Device type: Desktop, Mobile, Tablet, Bot
  - Bot detection for crawlers (Google, Bing, Discord, Twitter, etc.)
- [x] **GDPR-compliant IP handling** (`ip-utils.ts`)
  - IP anonymization: Last octet zeroed (IPv4) / Last 80 bits zeroed (IPv6)
  - Secure IP hashing for session security (SHA-256 with salt)
  - IP masking for user display (e.g., "192.168.x.x")
  - Private IP detection (localhost, LAN ranges)
  - Cloudflare/Vercel proxy header support

### Rate Limiting & DDoS Protection

- [x] Global API rate limiting (requests per minute per IP)
- [x] Per-endpoint rate limiting (stricter for auth endpoints)
- [x] Rate limit Spotify API calls (30/min per IP)
- [x] Rate limit file uploads (10/min per user)
- [x] Rate limit profile views tracking (1000/min per profile/IP)
- [x] Implement exponential backoff for repeated failures
- [x] Add Cloudflare/similar DDoS protection (DNS active, WAF/Bot Fight Mode enabled)
- [x] Bot detection and CAPTCHA for forms (Cloudflare Turnstile fully integrated)

### Input Validation & Sanitization

- [x] Zod schema validation on all server functions
- [x] Email validation and normalization (lowercase)
- [x] Username validation (alphanumeric + underscore/hyphen only)
- [x] **Sanitize Custom CSS before injection** (sanitizeCSS in security.ts)
- [x] Sanitize custom font URLs (whitelist trusted font providers)
- [x] Sanitize bio/description content (XSS prevention via sanitizeText)
- [x] Validate and sanitize all URL inputs (sanitizeURL)
- [x] Validate file upload MIME types server-side (JPEG, PNG, WebP, GIF)
- [x] Limit file upload sizes (5MB max)
- [ ] Sanitize OpenGraph metadata

### SQL Injection & Database Security

- [x] Using Drizzle ORM (parameterized queries)
- [x] No raw SQL queries
- [x] Database connection pooling (Neon HTTP handles automatically)
- [x] Database user with minimal permissions (Neon managed)
- [x] Regular database backups (Neon automatic backups)
- [x] Encrypt sensitive data at rest (2FA secrets with AES-256-GCM)
- [x] Deploy ENCRYPTION_KEY to production secrets (generated locally on 2026-01-19)

### XSS (Cross-Site Scripting) Prevention

- [x] React auto-escapes by default
- [x] **Reviewed and secured dangerouslySetInnerHTML in $username.tsx**
- [x] CSP (Content Security Policy) headers defined in security.ts
- [x] Sanitize user-generated HTML content (all user inputs rendered as text, no rich-text editor yet)
- [x] Validate and sanitize custom theme colors (hex only) - isValidColor/sanitizeHexColor
- [ ] Add HTML sanitization library (DOMPurify) when rich-text features are implemented

### CSRF (Cross-Site Request Forgery) Protection

- [x] SameSite cookie policy
- [x] Add CSRF tokens for state-changing operations (getCsrfTokenFn/validateCsrfTokenFn in auth.ts)
- [x] Verify Origin/Referer headers (verifyOrigin in security.ts)

### Authorization & Access Control

- [x] Server-side session validation on protected routes
- [x] Role-based access control (user, admin, owner)
- [x] Tier-based feature gating
- [x] Admin-only badge assignment
- [x] Validate referral codes server-side (isValidReferralCode in security.ts)
- [x] Audit log for admin actions (adminAuditLog table + logAdminAction utility)
- [x] Prevent privilege escalation attacks (canPerformAdminAction/canPerformOwnerAction helpers)
- [x] Resource ownership validation on all mutations (validateResourceOwnership helper, verified in links.ts)

### OAuth & Third-Party Security

- [x] Secure OAuth token storage in database
- [x] Encrypt OAuth tokens at rest (AES-256-GCM via encrypt/decrypt)
- [x] OAuth state parameter validation (Spotify: state cookie with timestamp)
- [x] Token refresh handling (refreshAccessToken in spotify.ts)
- [x] Revoke tokens on account deletion (deleteAccountFn clears spotifyConnections)
- [x] Validate OAuth redirect URIs (hardcoded in env, not user-controllable)

### File Upload Security

- [x] Validate file types (magic bytes, not just extension) - validateMagicBytes in cloudinary.ts
- [ ] Scan uploads for malware (Cloudinary handles basic scanning)
- [x] Store uploads outside web root (Cloudinary CDN)
- [x] Generate random filenames (Cloudinary auto-generates)
- [x] Set proper Content-Type headers on serve (Cloudinary handles)
- [x] Limit upload frequency per user (rate limiting in upload.ts)

### API Security

- [ ] API versioning (not needed for current single-version API)
- [x] Request size limits (Zod schema validation, file size limits)
- [x] Timeout limits on long-running operations (Vercel function timeout)
- [x] Proper error messages (no stack traces in production) - custom error objects
- [x] Remove sensitive data from responses (passwordHash, tokens never exposed)
- [x] Log security events (security-logger.ts with logSecurityEvent)

### Infrastructure Security

- [x] HTTPS everywhere (HSTS headers) - Strict-Transport-Security in SECURITY_HEADERS
- [x] Security headers (X-Frame-Options, X-Content-Type-Options, etc.) - SECURITY_HEADERS in security.ts
- [x] Environment variables for secrets (never in code) - all secrets in .env
- [ ] Regular dependency updates (npm audit) - manual process
- [ ] Secrets rotation policy - document needed
- [x] Monitoring and alerting for suspicious activity - security-logger.ts

### Privacy & Data Protection (GDPR/DSGVO)

- [x] Privacy policy page
- [x] Cookie consent
- [x] Data export functionality (exportUserDataFn + UI in SettingsTab)
- [x] Account deletion with data purge (deleteAccountFn + UI in SettingsTab)
- [ ] Data retention policies - document needed
- [x] Anonymize analytics data (IP addresses not stored in analytics)
- [ ] Document data processing activities - document needed

### Incident Response

- [ ] Security incident response plan - document needed
- [x] Contact email for security reports (security@eziox.link in footer/contact)
- [ ] Bug bounty program consideration - future consideration
- [ ] Regular security audits - manual process

### Email System (Resend)

- [x] Domain verified (eziox.link with DKIM, SPF, MX records)
- [x] Welcome email on signup
- [x] Password reset email with secure token
- [x] Login notification email with device/IP info
- [x] Password changed notification email
- [x] 2FA enabled notification email
- [x] 2FA disabled security alert email (with IP)
- [x] Account deletion confirmation email
- [x] Subscription emails (upgrade/downgrade/cancel/renew)
- [x] Weekly digest email template (stats summary)
- [x] Email verification template (ready for implementation)
- [x] Consistent email template design (dark theme, Eziox branding)
- [x] Footer with Privacy/Terms/Unsubscribe links
- [x] Contact form emails (admin notification + user confirmation)
- [x] Recovery codes download as .txt file
- [x] Email preferences UI in settings (login alerts, security alerts, weekly digest, product updates)
- [ ] Weekly digest cron job (future)

---

## 📱 UI/UX Improvements

- [ ] Mobile app (React Native / PWA) - future consideration
- [x] Accessibility improvements (semantic HTML, focus states, contrast)
- [x] Loading skeletons (Loader2 spinners throughout app)
- [x] Error boundaries (try/catch in server functions, toast notifications)
- [ ] Offline support - future consideration
- [x] Responsive design (mobile-first, all breakpoints)
- [x] Dark theme by default with theme system
- [x] Smooth animations (motion/react throughout)
- [x] Toast notifications (sonner)
- [x] Form validation with error messages

---

## 🧪 Testing

- [ ] Unit tests for server functions - future
- [ ] E2E tests with Playwright - future
- [ ] Load testing for analytics - future
- [x] Security audit (2FA, CSRF, rate limiting, input sanitization)
- [x] Manual testing of all features
- [x] Cross-browser testing (Chrome, Firefox, Safari)

---

## 📋 Pre-Deployment Checklist

### Code Quality

- [x] TypeScript builds (`bun run build`) - passing
- [x] Linting passes (`bun run lint`) - configured
- [x] Code formatted (`bun run format`) - Prettier configured
- [x] No console errors in production
- [x] Bundle size optimized (Vite + tree shaking)

### Configuration

- [x] Environment variables set (Vercel)
- [x] Database schema pushed (Drizzle + Neon)
- [x] SSL certificate active (Vercel automatic)
- [x] Domain configured (eziox.link)
- [x] Email domain verified (Resend DKIM/SPF)
- [x] Stripe webhooks configured
- [x] Cloudflare Turnstile configured

### Testing

- [x] All features working
- [x] Mobile responsive
- [x] Cross-browser tested
- [x] Auth flow tested (signup, login, 2FA, password reset)
- [x] Payment flow tested (Stripe checkout)

---

## 📊 Implementation Summary

### Fully Implemented (Schema + UI + Server Functions)

| Feature          | Tables                                                         | Routes                              | Functions                    |
| ---------------- | -------------------------------------------------------------- | ----------------------------------- | ---------------------------- |
| Auth & Sessions  | `users`, `sessions`                                            | `/sign-in`, `/sign-up`, `/sign-out` | `auth.ts`                    |
| Profiles         | `profiles`, `userStats`                                        | `/{username}`, `/profile`           | `auth.ts`, `stats.ts`        |
| Links            | `userLinks`                                                    | `/profile?tab=links`                | `links.ts`                   |
| Followers        | `follows`                                                      | Modal in bio page                   | `follows.ts`                 |
| Referrals        | `referrals`                                                    | `/referrals`, `/join/{code}`        | `referrals.ts`               |
| Badges           | `profiles.badges`                                              | `/profile?tab=badges`               | `badges.ts`                  |
| Notifications    | `notifications`                                                | NotificationBell                    | `notifications.ts`           |
| Analytics        | `analyticsDaily`, `linkClickAnalytics`, `profileViewAnalytics` | `/analytics`                        | `analytics.ts`               |
| Spotify          | `spotifyConnections`                                           | `/api/spotify-callback`             | `spotify.ts`                 |
| Subscriptions    | `subscriptions`                                                | `/pricing`, `/api/webhooks/stripe`  | `subscriptions.ts`           |
| Templates        | `communityTemplates`, `templateLikes`                          | `/templates`                        | `templates.ts`               |
| Partners         | `partnerApplications`                                          | `/partners`, `/creators`            | `partners.ts`, `creators.ts` |
| Contact          | `contactMessages`                                              | `/contact`                          | `contact.ts`                 |
| Admin            | `adminAuditLog`                                                | `/admin`                            | Various                      |
| Creator Features | `profiles.*`                                                   | `/profile?tab=creator`              | `creator-features.ts`        |
| Custom Themes    | `profiles.customThemes`                                        | `/theme-builder`                    | `profile-settings.ts`        |

### Schema Ready, UI Pending

| Feature             | Tables               | Status                          |
| ------------------- | -------------------- | ------------------------------- |
| Link Groups         | `linkGroups`         | Schema ✅, UI ❌                |
| Profile Widgets     | `profileWidgets`     | Schema ✅, UI ❌                |
| Social Integrations | `socialIntegrations` | Schema ✅, UI ❌ (only Spotify) |
| Media Library       | `mediaLibrary`       | Schema ✅, UI ❌                |
| Scheduled Posts     | `scheduledPosts`     | Schema ✅, Cron ❌              |
| Custom Domains      | `customDomains`      | Schema ✅, Vercel config ❌     |
| Email Subscribers   | `emailSubscribers`   | Schema ✅, UI ❌                |

### Not Started

| Feature                     | Priority |
| --------------------------- | -------- |
| Testimonials / User Reviews | MEDIUM   |
| Public API                  | LOW      |
| API Keys                    | LOW      |
| QR Code for Bio Page        | LOW      |
| Weekly Digest Cron          | LOW      |
| Mobile App / PWA            | FUTURE   |

> **Note:** Testimonials system needs to be implemented before the Home Page "What Users Say" section can display real data. This includes:
>
> - `testimonials` table (userId, content, rating, isApproved, isFeatured, createdAt)
> - Admin approval workflow
> - Display on Home Page

---

**Last Updated**: 2026-01-22  
**Next Review**: Before each major feature release
