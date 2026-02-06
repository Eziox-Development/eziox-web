# Changelog

All notable changes to Eziox will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.9.1] - 2026-02-06

### Changed - UI Modernization & Code Cleanup

**Eziox Aurora Theme Enhancement:**

- Modernized Nav component with gradient brand text matching homepage hero
- Enhanced scrolled state with aurora-tinted glass effect and multi-color gradient line
- Added subtle logo glow ring on hover and improved CTA button styling
- Updated Footer with animated aurora background orbs and glass-style stat cards
- Implemented consistent aurora gradient dividers across navigation components
- Enhanced social link hover effects with colored shadows and backdrop blur

**Code Quality Improvements:**

- **Eliminated 9 duplicate utility functions:**
  - Centralized `hexToRgb` (7 duplicates removed) → single source in `@/lib/utils`
  - Centralized `getOptionalUser` (2 duplicates removed) → moved to `auth-helpers.ts`
- Cleaned up unused imports in `templates.ts` and `tickets.ts`
- Fixed TanStack Start virtual module resolution issue by separating server-only helpers
- All TypeScript compilation passes clean, no breaking changes

**Technical Fixes:**

- Resolved TanStack Start dev server virtual module error (#5709)
- Updated all TanStack packages to synchronized v1.158.x versions
- Maintained backward compatibility while improving maintainability

---

## [2.9.0] - 2026-02-04

### Added - Complete Support Ticket System

**New Ticket Management:**

- Comprehensive support ticket system with 12 categories
  - Categories: General, Technical, Billing, Account, Security, Abuse, Legal, Partnership, Feature, Withdrawal, DMCA, GDPR
  - Priority levels: Low, Normal, High, Urgent
  - Status tracking: Open, In Progress, Waiting User, Waiting Admin, Resolved, Closed
  - Unique ticket numbers: TKT-YYYY-XXXXXX format
- Database schema: `support_tickets` and `ticket_messages` tables
- Guest and user ticket support (non-registered users can submit tickets)

**User-Facing Support:**

- New `/support` page for ticket creation with modern design
- New `/support/tickets` page for users to view and manage their tickets
- Live ticket updates without email spam (only confirmation on creation)
- Ticket filtering by status with modern Select components
- Real-time message threads with admin/user distinction
- Internal notes for admin team (not visible to users)

**Admin Ticket Management:**

- New Tickets tab in admin panel (`/admin?tab=tickets`)
- Complete ticket management: view, reply, update status, change priority
- Ticket statistics dashboard (open, in progress, waiting admin, urgent, today)
- Advanced filtering by status, category, priority, and search
- Bulk ticket operations and internal note system
- Integration with withdrawal requests and other systems

**Technical Implementation:**

- Server functions: `createTicketFn`, `getMyTicketsFn`, `getTicketsFn`, `replyToTicketFn`, etc.
- Email notifications only on ticket creation (no spam on replies)
- Full i18n support (English & German) for all ticket UI
- Modern UI components with shadcn/ui Select dropdowns
- TypeScript type safety with explicit type assertions
- Responsive design with mobile optimization

**Navigation & Accessibility:**

- "View My Tickets" link on support page for logged-in users
- Support section in profile dashboard sidebar
- "My Tickets" and "Help Center" quick links
- Seamless integration with existing auth and admin systems

---

## [2.8.0] - 2026-02-03

### Added - Authentication Overhaul

**New Authentication Methods:**

- Passkey/WebAuthn support for passwordless biometric login
  - Database schema: `passkeys` table for credential storage
  - Server functions: registration, authentication, management
  - Profile Security Tab for passkey management
- OTP (One-Time Password) email login system
  - 6-digit code generation with 10-minute expiry
  - Rate limiting: 5 requests/minute, 10 verification attempts/minute
  - Professional HTML email template for OTP codes
- Discord OAuth integration for login and registration

**Redesigned Auth Pages:**

- Complete redesign of sign-in page with multi-step flow
  - Step 1: Method selection (Discord, Password, OTP, Passkey)
  - Step 2: Credential entry with animated transitions
  - Step 3: OTP code verification with auto-submit
- Complete redesign of sign-up page with wizard flow
  - Step 1: Method selection (Discord or Email)
  - Step 2: User details (name, username, email)
  - Step 3: Password with strength indicator
  - Step 4: Security verification and terms acceptance
- New auth layout with animated background orbs
- Real logo integration (`/icon.png`)
- Grid pattern overlay for visual depth
- Minimal header with home navigation

**Security Tab in Profile Dashboard:**

- New `SecurityTab.tsx` component
- Passkey management (add, rename, delete)
- OTP login status display
- Security tips section
- Full i18n support (English & German)

**Security Event Types:**

- Added `auth.login_otp` for OTP logins
- Added `auth.login_passkey` for passkey logins
- Added `auth.passkey_registered` for new passkey registrations
- Added `auth.passkey_removed` for passkey deletions
- Added `auth.otp_requested` for OTP code requests

### Changed

**Environment Variables:**

- Replaced `VITE_APP_URL` with `APP_URL` for Vercel security
- Updated `social-integrations.ts` to use server-side env vars
- Updated `callback.$platform.ts` for OAuth redirects
- Updated `subscriptions.ts` for Stripe redirects

**i18n Updates:**

- Added `common.continue` key for multi-step forms
- Added `signIn.otp.*` keys for OTP flow
- Added `signIn.passkey.*` keys for passkey flow
- Added `signUp.continueWithEmail` key
- Added `security.*` namespace for Security Tab
- Added `dashboard.tabs.security` for navigation

### Fixed

- Removed duplicate footer/features keys in locale files
- Fixed GitHub icon color in IntegrationsTab (white on white issue)

---

## [2.7.0] - 2026-02-02

### Added - Internationalization & Comment System

**Complete i18n System:**

- Full internationalization with `react-i18next` and `i18next-browser-languagedetector`
- Language files: `src/locales/en.json` and `src/locales/de.json` (2100+ keys each)
- `LanguageSwitcher` component with flag icons and smooth transitions
- Browser language auto-detection with localStorage persistence
- `useLocale` hook for easy language access in components
- All public pages, auth forms, legal pages, and UI components translated

**Profile Comments System:**

- New `profileComments` table with full CRUD operations
- `commentLikes` table for like/unlike functionality
- `commentReports` table for abuse reporting
- `ProfileComments` component with modern grid layout
- Comment sorting (newest, oldest, popular)
- Comment pinning for profile owners
- Content filter library (`src/lib/content-filter/`) with:
  - Profanity detection (300+ blocked words)
  - Excessive caps detection
  - Spam pattern detection
  - Auto-hide threshold for reported comments

**Email Verification Enhancements:**

- `EmailVerificationBanner` component in app root
- `EmailVerificationIndicator` for profile settings
- Email change verification flow with new route `/verify-email-change`
- Rate limiting: max 3 email changes per 24 hours
- Password verification required for email changes
- Token hashing (SHA256) for all verification tokens

**Abuse Detection System:**

- New `abuseAlerts` table for flagged content
- `src/server/lib/abuse-detection.ts` with pattern matching
- Admin panel route `/admin/abuse-alerts` for review
- Server functions for alert management

**Enhanced License Guard:**

- Anti-tampering with Symbol markers and integrity checks
- Console protection (prevents clearing, freezes console)
- DevTools detection via window resize monitoring
- Obfuscated domain list (Base64 encoded)
- Styled console output with license information
- Watermark overlay for unlicensed domains
- Global read-only `window.EZIOX_LICENSE` object
- Auto-initialization via `requestIdleCallback`

**Password Security:**

- New `src/lib/password-security.ts` with comprehensive validation
- Common password detection (1000+ passwords)
- Keyboard pattern detection (qwerty, asdf, etc.)
- Sequential character detection (abc123, etc.)
- Leet-speak bypass prevention (p@ssw0rd -> password)
- Personal info check (blocks email/username in password)
- HaveIBeenPwned API integration with k-anonymity
- Password entropy calculation (min 40 bits)
- Secure password generator utility

**Email Validation:**

- New `src/server/lib/email-validation.ts`
- DNS/MX record verification
- Disposable email filter (300+ domains)
- Typo detection for common domains
- Email normalization (gmail dots, plus addressing)
- Risk scoring for suspicious patterns
- Role account detection (admin@, info@, etc.)

### Changed

**Bio Page Redesign (`$username.tsx`):**

- Moved from `_bio/$username.tsx` to root `$username.tsx`
- Scroll-based section navigation (Profile, Links, Comments)
- URL parameter sync for tabs (`?tab=links`, `?tab=comments`)
- Full-screen sections with smooth scrolling
- Card tilt effect on profile card hover
- Social platform colors refactored to `social-links.ts`

**Authentication Improvements:**

- Sign-in/Sign-up forms with i18n support
- Enhanced Turnstile widget stability
- Better error messages with translations
- Password strength indicator

---

## [2.6.0] - 2026-01-28

### Added - Profile Dashboard Modernization

**Media Library Tab:**

- Complete redesign with grid/list view toggle
- Drag-and-drop file upload with visual feedback
- File type filtering (images, videos, documents)
- Search functionality across all media
- Bulk selection and deletion
- File preview modal with metadata
- Storage usage indicator

**Social Integrations Tab:**

- Discord, Twitch, GitHub, Steam OAuth connections
- Platform-specific colors and icons
- Connection status indicators
- Disconnect functionality with confirmation

**Widgets Tab:**

- Spotify Now Playing widget
- Discord Status widget
- GitHub Activity widget
- Custom HTML widget support

**Theme System Enhancements:**

- Full theme integration across all components
- Dynamic color application via `theme.colors`
- Glass morphism card styles
- Glow intensity settings (none, subtle, medium, strong)
- Animated background effects

### Changed

- Replaced hardcoded colors with theme variables
- Updated all profile tabs to use `useTheme` hook
- Improved responsive design for mobile devices

---

## [2.5.0] - 2026-01-20

### Added - Analytics & Leaderboard

**Link Analytics:**

- Per-link click tracking
- Device type detection (desktop, mobile, tablet)
- Browser identification
- Geographic data (country, city)
- Referrer tracking
- Click heatmaps visualization

**Leaderboard System:**

- User ranking based on profile views and link clicks
- Podium display for top 3 users
- Weekly and all-time rankings
- Badge rewards for top performers

**Link Scheduling:**

- Start and end date configuration
- Countdown timer display
- Automatic link visibility toggle

---

## [2.4.0] - 2026-01-15

### Added - Premium Features

**Stripe Integration:**

- Subscription management (Pro, Creator tiers)
- One-time Lifetime purchase
- Webhook handling for subscription events
- Customer portal for billing management

**Premium Features:**

- Custom CSS injection
- Custom fonts
- Branding removal
- Profile backups
- Custom domains (Creator tier)
- Password-protected links

---

## [2.3.0] - 2026-01-10

### Added - Theme System

**31 Themes across 8 Categories:**

- Dark themes (Midnight, Obsidian, etc.)
- Light themes (Snow, Pearl, etc.)
- Neon themes (Cyberpunk, Synthwave, etc.)
- Nature themes (Forest, Ocean, etc.)
- Minimal themes (Clean, Simple, etc.)
- Gaming themes (RGB, Retro, etc.)
- Seasonal themes (Winter, Summer, etc.)
- Custom themes via Theme Builder

**Theme Builder:**

- Live preview
- Color picker for all theme variables
- Export/import theme configurations
- Community template sharing

---

## [2.2.0] - 2026-01-05

### Added - Notifications & Spotify

**Notification System:**

- Real-time notification center
- Bell icon with unread count
- Notification categories (follows, comments, system)
- Mark as read functionality
- Notification preferences

**Spotify Integration:**

- Currently playing display on bio page
- Album art and track info
- Progress bar
- Spotify OAuth connection

---

## [2.1.0] - 2025-12-28

### Added - Core Features

**Bio Links:**

- Unlimited link creation
- Drag-and-drop reordering
- Icon selection for links
- Link thumbnails
- Click tracking

**User Profiles:**

- Custom avatars (upload or Gravatar)
- Custom banners
- Bio text with markdown support
- Social links integration
- Profile visibility settings

---

## [2.0.0] - 2025-12-20

### Added - Initial Release

**Core Platform:**

- User authentication (email/password)
- Profile creation and management
- Basic link management
- Responsive design
- PostgreSQL database with Drizzle ORM

**Tech Stack:**

- React 19 with TypeScript
- TanStack Start (SSR)
- TanStack Router & Query
- Tailwind CSS
- Vercel deployment

---

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                           EZIOX CHANGELOG                                 ║
║                                                                           ║
║              Documenting the evolution of the platform                    ║
╚═══════════════════════════════════════════════════════════════════════════╝
```
