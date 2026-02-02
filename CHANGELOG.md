# Changelog

All notable changes to Eziox will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.7.0] - 2026-02-02

### Added - Internationalization & Comment System 🌍�

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
- Leet-speak bypass prevention (p@ssw0rd → password)
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

**Documentation System:**

- New `DocsLayout` component with sidebar navigation
- `docs-nav.ts` for documentation structure
- All doc pages updated with consistent styling

**Legal Pages:**

- New `/imprint` (Impressum) page
- New `/widerruf` (Withdrawal) page
- All legal pages with `LegalPageLayout` component
- Consistent styling and i18n support

**Navigation & Footer:**

- Language switcher in navigation
- Updated footer with all legal links
- Improved mobile responsiveness

### Fixed

- TypeScript error in `$username.tsx` with `search.tab` typing
- ESLint errors in `ProfileComments.tsx` with void operators
- Turnstile infinite loop in auth forms
- Session detection on bio pages using `useRouterState`

### Removed

- Old `_bio.tsx` and `_bio/$username.tsx` routes (consolidated)
- Unused `ProfileHeader.tsx`, `ProfileSidebar.tsx`, `ProfileStats.tsx`
- Deprecated `LinkAdvancedSettings.tsx`
- Old `CreatorTab.tsx` and `CustomizationTab.tsx`
- Unused `image-upload.tsx` component
- Old `/referrals` route (moved to profile tab)

### Database Migrations

- `0003_stormy_kinsey_walden.sql` - Email verification fields
- `0004_freezing_violations.sql` - Comment system tables
- `0005_long_gorgon.sql` - Abuse alerts table

### Security

- All verification tokens now SHA256 hashed
- Rate limiting on email verification (3/hour)
- Rate limiting on email changes (3/24h)
- Content filtering for user-generated content
- Abuse detection and reporting system

---

## [2.6.0] - 2026-01-25

### Added - API Access System 🔑

**Complete API Key Management:**

- New `apiKeys` database table with secure key storage
- API key generation with `ezx_` prefix and SHA-256 hashing
- Configurable permissions per key (profile, links, analytics, templates)
- Rate limiting per key (1k-10k requests/hour based on tier)
- Request tracking and usage statistics
- Key expiration support (30d, 90d, 180d, 1y, never)

**Modern ApiAccessTab Component:**

- Full theme integration (cardRadius, glowOpacity, cardStyle, displayFont)
- Animated backgrounds and glow effects matching templates.tsx
- Stats row with animated cards (Total Keys, Active, Requests, Rate Limit)
- Modern API key cards with glass effects and hover animations
- Create modal with permission categories and color-coded checkboxes
- Stats modal with endpoint usage breakdown
- Toast notifications for all actions
- Spring animations with consistent stiffness/damping

**API Documentation Page (`/api-docs`):**

- Animated hero section with quick stats
- Quick start guide with code examples
- Authentication section with security tips
- Rate limits by tier (Free, Pro, Creator, Lifetime)
- Expandable endpoint cards with method badges
- Parameters, request body, and response examples
- Error codes reference

**Server Functions:**

- `getApiKeysFn` - List user's API keys
- `createApiKeyFn` - Generate new API key with permissions
- `updateApiKeyFn` - Toggle active status, rename keys
- `deleteApiKeyFn` - Remove API keys
- `getApiKeyStatsFn` - Usage statistics per key

### Removed - Changelog/Updates Page 🗑️

**Per community recommendations:**

- Removed `/changelog` route and page
- Removed ChangelogModal popup component
- Removed changelog from navigation (Nav.tsx)
- Removed changelog from footer links (Footer.tsx)
- Removed changelog from sitemap
- Removed changelog from reserved usernames

### Added - Documentation System 📚

**File-based Markdown Documentation:**

- New `/docs` route with searchable documentation index
- Individual doc pages at `/docs/[slug]` with full Markdown rendering
- Frontmatter support (title, description, category, icon, order)
- Server functions for reading .md files from `content/docs/`

**Documentation Pages Created:**

- Getting Started - Account setup and basics
- Customization - Themes, backgrounds, layouts
- Analytics - Profile and link tracking
- API Access - REST API integration guide
- Premium Features - Tier comparison and features
- Spotify Integration - Now Playing widget setup
- Security - 2FA, encryption, best practices
- FAQ - Common questions and answers

**Modern UI Features:**

- Category-based grouping with color coding
- Real-time search filtering
- Full Markdown rendering with react-markdown
- GFM support (tables, strikethrough, task lists)
- Code blocks with syntax highlighting and copy button
- Responsive design with theme integration
- Previous/Next navigation between docs

**Navigation Update:**

- Added "Docs" to main navigation (replacing removed Changelog)
- Updated sitemap with all documentation pages

### Fixed

- Profile tab URL parameter (`?tab=api`) now works correctly
- Added 'api' to validTabs in profile.tsx

---

## [2.5.0] - 2026-01-21

### Added - Email Verification System 📧

**Complete Email Verification:**

- New `/verify-email` route with token validation
- Verification email sent automatically on signup
- Resend verification email functionality (rate limited: 3/hour)
- `emailVerificationToken` and `emailVerificationExpires` fields in users table
- Security event logging for email verification

### Added - Modern Bio Page Schema 🚀

**New Database Tables:**

- `linkGroups` - Organize links into collapsible sections
- `profileWidgets` - Customizable widgets (Spotify, Weather, Countdown, Social Feed)
- `socialIntegrations` - Connect YouTube, Twitch, TikTok, etc.
- `mediaLibrary` - Manage uploaded media files
- `scheduledPosts` - Schedule link visibility changes
- `customDomains` - Custom domain support for Creator tier
- `profileViewAnalytics` - Detailed profile view tracking
- `emailSubscribers` - Email collection for creators

**New Link Features:**

- `mediaEmbed` - Spotify, SoundCloud, YouTube, Twitch, TikTok, Apple Music embeds
- `linkType` - Different link types (link, embed, header, divider)
- `groupId` - Assign links to groups
- `password` - Password-protected links
- `qrCodeStyle` - Custom QR code styling

### Changed - Schema Cleanup 🧹

**Removed Deprecated Features:**

- Removed `blogPosts` table (not needed for bio page)
- Removed `projects` table (not needed for bio page)
- Removed A/B testing fields (`abTestEnabled`, `abTestVariants`)
- Removed UTM tracking fields (`utmSource`, `utmMedium`, `utmCampaign`)
- Removed `embedSettings` (replaced by `mediaEmbed`)
- Deleted `/blog` route and `blog.ts` server functions

### Improved - Legal Pages 📜

- Updated Privacy Policy with IP anonymization details
- Updated Cookie Policy date
- Updated Terms of Service date
- Added 2FA/MFA and Cloudflare Turnstile to security section

### Fixed

- Added missing `contactMessagesRelations` to schema
- Added missing type exports for new tables
- Fixed security event types for email verification

---

## [2.4.0] - 2026-01-20

### Changed - Tier System Simplification 💎

**Simplified Subscription Model:**

- **Free Tier Expanded** - All core features now completely free:
  - Unlimited links and short links
  - All 30+ themes and colors
  - All backgrounds (solid, gradient, image, video, animated)
  - All animations and effects
  - Spotify, SoundCloud & YouTube embeds
  - Social media icons
  - Profile picture & banner
  - Full analytics dashboard (30 days retention)
  - Mobile-optimized design

- **Pro Tier (€2.99/month)** - Advanced customization tools:
  - Custom CSS styling
  - Upload custom fonts
  - Remove Eziox branding
  - Profile backups & restore
  - Export analytics (CSV/JSON)
  - Pro badge on profile

- **Creator Tier (€5.99/month)** - Professional features:
  - Everything in Pro
  - Custom domain (yourdomain.com)
  - Password protected links
  - Link expiration dates
  - Email collection from visitors
  - Custom Open Graph previews
  - Priority email support
  - Early access to new features
  - Creator badge on profile

- **Lifetime (€29 one-time)** - Forever access:
  - Everything in Creator
  - All future features included
  - Exclusive Lifetime badge
  - Priority support forever
  - Never pay again

**Removed Artificial Limits:**

- No more link limits for any tier
- No more analytics paywalls
- No more theme restrictions
- No more basic customization locks

**Updated Components:**

- Simplified `stripe.ts` tier configuration
- Removed `canAdvancedBackgrounds` and other redundant checks
- Updated `CustomizationTab` to reflect new free features
- Cleaned up `LinkAdvancedSettings` (removed A/B testing, UTM, embed controls)
- Updated pricing page with new tier structure

### Improved - Profile Page Architecture 🏗️

**Modular Profile System:**

- **ProfileDashboard** - New main container with state management
- **ProfileSidebar** - Categorized navigation (Dashboard, Premium, Account)
- **ProfileHeader** - Banner + Avatar + Badges display
- **ProfileStats** - Animated stats cards
- Centralized constants in `constants.ts`
- Centralized types in `types.ts`

**Profile Route Optimization:**

- Reduced from 461 to 22 lines
- All logic moved to ProfileDashboard component
- Better separation of concerns
- Improved maintainability

**Tab Updates:**

- All tabs now use centralized constants and types
- Consistent theme integration with `useTheme()`
- No hardcoded styles - all use CSS variables
- Fixed TypeScript errors across all tabs

### Improved - Public Pages Redesign 🎨

**About Page:**

- Simplified hero section with cleaner messaging
- "No paywalls" philosophy front and center
- Reduced from verbose to concise feature highlights
- Privacy-first messaging
- Modern tech stack showcase
- Creator quote section with Saito's philosophy

**Homepage:**

- Performance optimizations (removed heavy animations)
- Static gradients instead of animated blobs
- Cleaner button hover states (CSS transitions instead of motion)
- New sections: Theme showcase, Integrations, Analytics
- Better mobile responsiveness
- Improved loading performance

**Pricing Page:**

- Updated with new tier structure and pricing
- Clearer feature differentiation
- Reusable CTASection component

### Fixed

- **TypeScript Error** - Removed `canAdvancedBackgrounds` reference in CustomizationTab
- **Build Optimization** - Reduced bundle size with static elements
- **Consistency** - All components now use same theming approach

### Technical

- Build size: 14.8 MB (4.29 MB gzip)
- All TypeScript checks passing
- No console warnings or errors
- Improved code maintainability

---

## [2.3.0] - 2026-01-20

### Added - Playground & Theme Refactor 🎨

**New Playground:**

- **Live Preview** - Real-time preview with actual user data (profile, links, socials, badges)
- **Desktop/Mobile Toggle** - Switch between device views in preview
- **Background Editor** - Edit solid, gradient, image, video, and animated backgrounds
- **Layout Editor** - Customize card spacing, border radius, padding, shadows, and link styles
- **Animated Presets** - 30+ animated background presets in 5 categories:
  - VTuber/Anime: Sakura, Neon City, Starfield, Holographic, Sparkles
  - Gamer: Matrix Rain, Cyber Grid, RGB Wave, Particles, Glitch
  - Developer: Code Rain, Binary Flow, Terminal, Circuit, Gradient Mesh
  - Nature: Aurora, Ocean, Fireflies, Clouds, Rain, Snow
  - Abstract: Fluid, Geometric, Waves, Bokeh, Noise, Vortex

**Theme System Unification:**

- **ThemeSwitcher** now controls all colors (removed redundant accentColor)
- **Appearance Section** removed from Settings (was duplicate of ThemeSwitcher)
- All components now use `theme.colors.primary` instead of `accentColor`

### Fixed

- **Vite HMR Warning** - Moved `ANIMATED_PRESETS` to separate file to fix Fast Refresh
- **Animated Backgrounds** - Fixed z-index issues causing animations to disappear on Bio Page
- **TypeScript Error** - Fixed non-existent `/archive` route in not-found component
- **Contained Animations** - Added `contained` prop for animations in preview containers

### Changed

- **Live Preview** - Now larger and more prominent (80vh desktop, 75vh mobile)
- **Decorative Blobs** - Hidden when animated/video background is active
- **ProfileFormData** - Removed `accentColor` field
- **All Profile Components** - Updated to use `useTheme()` instead of `accentColor` prop

---

## [2.2.0] - 2026-01-20

### Added - Link Analytics & Scheduling System 📊

**Link Scheduling:**

- **Schedule Links** - Set start and end dates for links to appear/disappear automatically
- **Time-Limited Links** - Links can auto-hide when expired with `hideWhenExpired` option
- **Countdown Timer Display** - Show countdown on scheduled links with 3 styles:
  - `minimal` - Simple time remaining
  - `detailed` - Full breakdown (days, hours, minutes)
  - `badge` - Compact badge style
- **Timezone Support** - Schedule respects user timezone settings

**Link Analytics:**

- **Per-Link Click Analytics** - Detailed tracking for each link
- **Geographic Data** - Track country, city, and region of visitors
- **Device/Browser Stats** - Monitor device types (mobile/desktop/tablet), browsers, and OS
- **Click Heatmap** - Visualize clicks by hour (0-23) across days
- **Analytics Tab** - New tab in Link Advanced Settings modal with:
  - Total clicks and period stats
  - Device breakdown visualization
  - Browser distribution
  - Hourly click heatmap

**New Database Schema:**

- `linkClickAnalytics` table for detailed per-click tracking
- Extended `LinkSchedule` interface with countdown options
- Added `schedule` field to `updateLinkSchema`

**UI Improvements:**

- **Footer Full Width** - Footer now uses full viewport width instead of max-w-7xl
- **Highlights Bar** - Changed from centered to space-between distribution
- **Grid Layout** - Optimized column distribution (3-6-3 instead of 4-5-3)
- **Responsive Padding** - Better spacing on all screen sizes

**Pages & Routes:**

- Deleted standalone `/links` route (was not linked anywhere)
- Links management now exclusively in `/profile` → Links Tab
- Added Analytics tab as default in LinkAdvancedSettings

### Fixed

**Cloudflare Turnstile Bug:**

- Fixed infinite verification loop in sign-in/sign-up forms
- Problem: `useCallback` dependencies caused re-renders and widget re-initialization
- Solution: Use refs for callbacks, empty dependency array for useEffect
- Widget now renders once on mount and stays stable

**SEO & Metadata:**

- Enhanced Open Graph tags for better social sharing
- Added Twitter card support with large image
- Discord embed optimization
- Canonical URL and sitemap links
- Updated PWA manifest with Eziox branding
- Improved robots.txt with social crawler rules

### Changed

- **Server Functions:**
  - `trackLinkClickFn` now captures userAgent and referrer
  - New `getLinkAnalyticsFn` for per-link analytics
  - New `getAllLinksAnalyticsFn` for overview
  - Added `linkScheduleSchema` for validation

- **Components:**
  - `LinkAdvancedSettings` - Added Analytics tab with full stats
  - `LinksTab` - Already shows scheduling indicator badge
  - `TurnstileWidget` - Refactored for stability
  - `Footer` - Full width layout

### Removed

- `/links` route page (functionality moved to profile tabs)
- Unused `useCallback` hooks in TurnstileWidget
- `renderedRef` in TurnstileWidget (widgetIdRef is sufficient)

---

## [2.1.0] - 2026-01-19

### Added - Security & Privacy Features 🔒

**Authentication & Bot Protection:**

- **Cloudflare Turnstile Integration** - Replaced custom bot protection with Cloudflare Turnstile
  - Invisible CAPTCHA on sign-up, sign-in, and forgot-password forms
  - Server-side token verification
  - Reusable `TurnstileWidget` component
- **CSRF Protection** - Token generation and validation for state-changing operations
  - `getCsrfTokenFn` and `validateCsrfTokenFn` server functions
  - Origin/Referer header verification
- **2FA Email Notifications** - Login alerts with IP address and timestamp

**Data Security:**

- **OAuth Token Encryption** - AES-256-GCM encryption for Spotify tokens at rest
- **Magic Bytes Validation** - File upload security with MIME type verification
- **Security Event Logging** - Comprehensive logging system for security events
  - Tracks login, logout, signup, account deletion, admin actions
  - `security-logger.ts` utility with event types and filtering

**Admin & Authorization:**

- **Admin Audit Log** - New `adminAuditLog` table for tracking admin actions
  - Logs badge assignments, user bans, role changes
  - `logAdminAction` utility in `audit.ts`
- **Authorization Helpers** - Role-based access control functions
  - `canPerformAdminAction`, `canPerformOwnerAction`
  - `validateResourceOwnership` for mutation protection
  - Server-side referral code validation

**Privacy & GDPR Compliance:**

- **Data Export** - Self-service data export functionality
  - `exportUserDataFn` exports all user data in JSON format
  - UI in Profile Settings → Privacy & Data section
- **Account Deletion** - Complete account deletion with data purge
  - `deleteAccountFn` with password confirmation
  - Revokes OAuth tokens, deletes sessions and user data
  - UI in Profile Settings → Danger Zone

**Infrastructure:**

- **HSTS Headers** - Strict-Transport-Security for HTTPS enforcement
- **Enhanced Security Headers** - Complete set of security headers in `SECURITY_HEADERS`
- **Email Utilities** - Password reset and login notification emails

### Changed

**Security Improvements:**

- Updated CSP headers to include Cloudflare Turnstile domains
- All OAuth tokens now encrypted before database storage
- Enhanced rate limiting on authentication endpoints
- Resource ownership validation on all mutations

**UI/UX Updates:**

- Updated About page security features (Turnstile, Encryption, GDPR)
- Added Privacy & Data section to Profile Settings
- Added Danger Zone section for account deletion
- Updated Privacy Policy with self-service options
- Updated Cookie Policy with Turnstile cookie information
- Added Security contact (security@eziox.link) to footer

**Documentation:**

- Updated all legal pages (Privacy, Terms, Cookies) to January 19, 2026
- Added comprehensive security documentation in CHECKLIST.md
- Documented all new security features and implementations

### Removed

- **Old Bot Protection System** - Removed custom bot protection (`bot-protection.ts`)
  - Deleted Slider, Rotate, and Pattern challenges
  - Removed `TURNSTILE_INTEGRATION.md` guide

### Fixed

- Password reset flow now uses Turnstile for bot protection
- Session validation improved with better error handling
- File upload validation now checks magic bytes, not just extensions

---

## [2.0.0] - 2026-01-19

### Added - Theme System Modernization 🎨

- **31 Modernized Themes** - Complete overhaul of all themes with modern color palettes
  - New `eziox-default` signature theme with deep black (#030305) and violet (#8b5cf6)
  - All themes aligned with Tailwind CSS color palette
  - Deeper, richer background colors for better contrast

- **Theme Categories Updated**:
  - **General**: eziox-default, obsidian, midnight, ember
  - **Gamer**: neon-green, rgb-fusion, cyberpunk (vibrant neon colors)
  - **VTuber**: kawaii-pink, pastel-dream, anime-night (soft aesthetics)
  - **Anime**: shonen-fire, slice-of-life, mecha-chrome
  - **Developer**: terminal, github-dark, vscode (authentic IDE colors)
  - **Streamer**: twitch, youtube, kick (official brand colors)
  - **Artist**: canvas, watercolor, gallery (elegant palettes)
  - **Minimal**: minimal-dark, minimal-light, aurora
  - **Premium**: ocean-depths, forest-night, neon-tokyo, sakura-bloom, monochrome-pro

- **Modern Typography**:
  - Inter, Plus Jakarta Sans, Outfit for display fonts
  - Space Grotesk, DM Sans for body fonts
  - JetBrains Mono, Fira Code for developer themes

### Changed

- **Site Config Cleanup** - Removed unused properties:
  - Removed: owner (userId, role, bio, extendedBio, avatar, banner, location, availability, badges, stats, socialLinks)
  - Removed: metadata.copyright, header, navigation, footerLinks
  - Removed: SocialLink, NavItem, OwnerStats, HeaderConfig interfaces
  - Kept only: metadata (title, description, url, language, icon), owner (name, email), themes, defaultTheme

- **CSS Variables Updated** - Default theme variables now match eziox-default:
  - Background: #030305 (deeper black)
  - Primary: #8b5cf6 (violet)
  - Accent: #c4b5fd (light violet)
  - Border: #1c1c22 (subtle dark)

### Fixed

- Fixed duplicate `pastel-dream` theme (renamed second instance to `sakura-bloom`)
- Theme IDs cleaned up (removed `-green`, `-purple`, `-red` suffixes from streamer themes)

---

## [1.9.0] - 2026-01-19

### Added - UI Modernization 🎨

- **Templates Page Redesign** - Complete modernization with modern UI/UX
  - Compact hero section with real-time template/featured counts
  - Modern category filters with motion animations
  - Redesigned TemplateCard with hover effects and spring animations
  - Image background preview support in template cards
  - Modernized TemplatePreviewModal with loading states and stats grid
  - Desktop/mobile responsive design throughout

- **Playground Page Rebuild** - Complete rewrite from scratch
  - Fixed nav overlap issue with proper spacing
  - Modern tab-based interface (Background, Layout, CSS, Animations)
  - Live preview panel with desktop/mobile toggle
  - Background types: Solid, Gradient, Image, Video, Animated
  - File upload support for images and videos
  - Gradient editor with color pickers and angle control
  - Animated background presets with speed/intensity controls
  - Layout controls: spacing, border-radius, padding, shadows
  - Link style presets: default, minimal, bold, glass
  - Animation controls: avatar, link hover effects
  - Publish modal with category selection
  - My Templates list with delete functionality

### Improved

- **Theme System** - Consistent use of `theme.colors.*` throughout both pages
- **Motion Animations** - Spring-based hover effects, AnimatePresence for transitions
- **Icons** - Modern Lucide icons (Code2, Wand2, LayoutGrid, FileUp, etc.)
- **Real Data** - All stats and counts from actual database queries
- **Clean Code** - Removed unnecessary comments, compact structure

### Technical

- Replaced deprecated Tailwind classes (`bg-gradient-to-*` → `bg-linear-to-*`)
- Fixed TypeScript errors in preview component
- Optimized component structure for better maintainability

---

## [1.8.0] - 2026-01-18

### Added - Creator Tier Features 🎨

- **Custom CSS Editor** - Sandboxed CSS customization with security validation
  - Real-time CSS input with character counter (10,000 max)
  - Forbidden pattern detection (fixed positioning, imports, expressions)
  - Automatic sanitization with error reporting
  - Tier-gated: Creator & Lifetime only

- **Custom Font Uploads** - Up to 4 custom fonts per profile
  - Support for Google Fonts and custom URLs
  - Display and body font types
  - Font management UI with add/remove functionality

- **Animated Profiles** - Micro-interactions and effects
  - Avatar animations: pulse, glow, bounce, rotate, shake
  - Banner animations: parallax, gradient-shift, particles
  - Link hover effects: scale, glow, slide, shake, flip
  - Page transitions: fade, slide, zoom
  - Enable/disable toggle with live preview

- **Custom Open Graph** - Control social sharing previews
  - Custom title, description, and image URL
  - Live preview of OG image
  - Toggle between default and custom settings

- **Advanced Link Features** - Professional link management
  - **Featured Links**: Highlight important links with 5 styles (default, glow, gradient, outline, neon)
  - **Link Scheduling**: Show/hide links based on start/end dates with timezone support
  - **A/B Testing**: Compare up to 4 link variants with click tracking
  - **UTM Parameters**: Marketing campaign tracking (source, medium, campaign)
  - **Embed Controls**: Advanced settings for Spotify, YouTube, SoundCloud (autoplay, loop, size)

- **Pro Tier Enhancements** 💎
  - 6 new premium themes: Ocean Depths, Forest Night, Neon Tokyo, Pastel Dream, Monochrome Pro, Aurora
  - Theme switcher now shows premium badge and tier-locks for free users
  - Custom backgrounds (solid, gradient, image upload)
  - Layout fine-tuning (spacing, border-radius, shadows, link styles)
  - Profile backups & restore functionality

### Technical

- **New Database Fields**:
  - `profiles`: `customCSS`, `customFonts`, `animatedProfile`, `openGraphSettings`
  - `userLinks`: `isFeatured`, `featuredStyle`, `schedule`, `abTestEnabled`, `abTestVariants`, `utmSource`, `utmMedium`, `utmCampaign`, `embedSettings`
  - `users`: `tier` field now exposed in auth response

- **New Files**:
  - `src/server/functions/creator-features.ts` - All Creator tier server functions
  - `src/components/profile/tabs/CreatorTab.tsx` - Creator settings UI
  - `src/components/profile/LinkAdvancedSettings.tsx` - Advanced link settings modal
  - `drizzle/0004_late_landau.sql` - Database migration

- **Updated Components**:
  - `LinksTab`: Added advanced settings button, featured link indicators, status badges
  - `ThemeSwitcher`: Premium theme badges and tier-gating
  - `profile.tsx`: Integrated Creator tab
  - `auth.ts`: Added tier to user response object

### Security

- CSS sanitization with forbidden pattern detection
- Tier-based access control on all Creator features
- Input validation with Zod schemas

---

## [1.6.0] - 2026-01-17

### Added

- **Enhanced Analytics Dashboard** - Comprehensive profile performance tracking
  - Overview stats: total views, link clicks, followers with change indicators
  - Interactive bar chart for daily activity (views & clicks)
  - Top performing links with click percentages
  - Referrer tracking to see traffic sources
  - Time range selector (7D, 30D, 90D, 1Y)
  - CSV/JSON export functionality
  - New route: `/analytics` (protected)

- **Notifications System** - Real-time notification center
  - NotificationBell component in navbar for logged-in users
  - Notification types: new_follower, profile_milestone, link_milestone, badge_earned, system
  - Mark as read (individual and all)
  - Delete notifications (individual and clear all)
  - Unread count badge with auto-refresh (30s)
  - Animated dropdown with smooth transitions

- **Database Schema Extensions**
  - `notifications` table for user notifications
  - `analytics_daily` table for aggregated daily stats

### Technical

- New files:
  - `src/server/functions/notifications.ts` - Notification CRUD operations
  - `src/server/functions/analytics.ts` - Analytics data aggregation
  - `src/components/notifications/NotificationBell.tsx` - Notification UI
  - `src/routes/_protected/analytics.tsx` - Analytics dashboard page
- Server functions with Zod validation and authentication
- Theme-aware components with motion/react animations

---

## [1.5.0] - 2026-01-16

### Added

- **Spotify Integration** - Complete OAuth flow with real-time playback display
  - OAuth 2.0 authentication with automatic token refresh
  - `spotify_connections` database table for secure token storage
  - Server functions for OAuth flow, token management, and API calls
  - **SpotifyConnect Component** - Connect/disconnect Spotify account in settings
    - Connection status indicator with live dot animation
    - Privacy toggle to show/hide activity on profile
    - Theme-aware styling with modern UI
  - **NowPlaying Component** - Real-time playback widget on bio pages
    - Album art with blur background effect
    - Live progress bar with smooth animations
    - Sound bars animation when playing
    - "Offline/Not listening" state with breathing animation
    - Direct link to Spotify track
    - Auto-refresh every 10 seconds
  - API route: `/api/spotify-callback` for OAuth redirect handling
  - Privacy controls in profile settings
  - Conditional display based on user preferences

### Fixed

- **API Route Structure** - Moved Spotify callback from `_api` to `api` directory
  - Fixed 404 errors on callback route
  - TanStack Router pathless routes (`_api`) don't create URL paths
  - Proper route registration for production deployment

### Technical

- New files:
  - `src/server/functions/spotify.ts` (404 lines)
  - `src/components/spotify/SpotifyConnect.tsx` (218 lines)
  - `src/components/spotify/NowPlaying.tsx` (282 lines)
  - `src/routes/api/spotify-callback.tsx`
- Database migration: `drizzle/0002_tidy_inhumans.sql`
- Environment variables: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REDIRECT_URI`

---

## [1.4.1] - 2026-01-16

### Changed

- **TypeScript 6.0+ Compatibility** - Removed deprecated `baseUrl` from tsconfig.json
  - Migrated to explicit path mappings for future TypeScript compatibility
  - Paths now use full relative paths (e.g., `./src/*`) instead of relying on baseUrl
- **Brand Icons Migration** - Replaced deprecated Lucide brand icons with react-icons/si
  - Migrated Twitter, Instagram, YouTube, Twitch, GitHub, TikTok, Discord icons
  - Using Simple Icons (react-icons/si) for modern, maintained brand icons
  - Updated brand colors to match official guidelines
  - Created centralized social-icons.tsx for icon management

### Fixed

- **Build Configuration** - Cleaned up Vite build warnings
  - Removed `NODE_ENV=production` from .env file (not supported by Vite)
  - Removed conflicting esbuild config (oxc is now the default minifier)
  - Cleaner build output without warnings

### Technical

- Updated 4 route files with new icon imports
- Created `src/lib/social-icons.tsx` for centralized icon management
- All deprecated Lucide brand icons replaced across the codebase

---

## [1.4.0] - 2026-01-16

### Added

- **Enhanced Partner Application System** - Professional multi-category partner program
  - 11 specialized categories: Streamer, VTuber, Content Creator, Gamer, Developer, Game Creator, Artist, Musician, Brand, Agency, Other
  - Dynamic form fields that adapt based on selected category
  - 3-step application wizard with category selection, details, and about sections
  - Category-specific data collection:
    - **Streamers/Content Creators**: Platform selection (TikTok, Twitch, YouTube, etc.), follower ranges, content types
    - **VTubers**: Model types (2D/3D/PNG), platform integration
    - **Gamers**: Main gamer tag, top 50 games selection, gaming platform profiles
    - **Developers**: Developer types (Fullstack, Backend, Frontend, etc.), programming languages, portfolio links
    - **Game Creators**: Game engine selection (Unity, Unreal, Godot, etc.), languages
    - **Artists**: Art types (Digital, Traditional, 3D, etc.), portfolio integration
    - **Musicians**: Musician types, music platform links (Spotify, SoundCloud, etc.)
  - Comprehensive constants library with 50+ games, 15+ programming languages, streaming platforms with brand colors
  - JSONB storage for flexible category-specific data
  - Modern glassmorphism UI with gradient accents
  - Real-time form validation with Zod schemas
- **Partner Categories Constants** (`partner-categories.ts`)
  - Streaming platforms with brand colors and URL prefixes
  - Follower ranges from micro (< 1K) to celebrity (10M+)
  - Top 50 games list for gamer applications
  - Gaming platforms (Steam, Xbox, PlayStation, etc.)
  - Developer specializations with descriptions
  - Programming languages and game engines
  - Artist and musician type classifications
  - Music platforms with URL structures
  - Content types and VTuber model types

### Changed

- **Database Schema** - Extended `partner_applications` table
  - Added `subcategory` varchar field for more specific categorization
  - Added `categoryData` JSONB field for dynamic category-specific data
  - Updated category enum to include all 11 new categories
  - Migration generated and applied successfully
- **Partner Application Server Functions** - Enhanced validation and data handling
  - Extended `submitPartnerApplicationFn` with new category support
  - Added comprehensive Zod schema for category data validation
  - Support for arrays, records, and complex nested data structures
- **Partners Page** - Complete UI redesign
  - Separated application form into reusable component
  - Improved partner display with official and featured sections
  - Enhanced stats display with real-time updates
  - Better empty states and loading indicators

### Technical

- Database migration: `0001_boring_ricochet.sql`
- New component: `PartnerApplicationForm.tsx` (900+ lines)
- Updated server functions with extended type safety
- Build optimization: Partners bundle 45.73 kB (9.31 kB gzip)

---

## [1.3.0] - 2026-01-15

### Added

- **FollowModal Component** - Modern modal-based followers/following UI (2026-01-15)
  - Glass-morphism design with backdrop blur and gradient header
  - Tab-based navigation between Followers/Following
  - Real-time search across name, username, and bio
  - Auto-refresh every 30 seconds with manual refresh button
  - Live follower/following counts in tabs
  - Optimistic UI updates on follow/unfollow
  - Spring animations and smooth transitions
  - Empty states with helpful messages
  - Keyboard-friendly (ESC to close)
  - Replaces separate route pages for better UX
- **Dynamic Page Titles & SEO** - Enhanced metadata across all pages (2026-01-15)
  - Dynamic titles for all routes (bio, profile, links, referrals, etc.)
  - SEO meta tags (description, og:title, robots)
  - User-specific titles on bio pages
  - Improved search engine visibility
- **Profile Page Redesign** - Modern 2-column layout (2026-01-15)
  - Left sidebar with navigation and mini user card
  - Bio link quick copy feature
  - Account details section with blur toggle for sensitive info
  - Improved stats display and organization
  - Better mobile responsiveness
- **Leaderboard Redesign** - Enhanced podium display (2026-01-15)
  - Always shows top 3 spots with placeholders
  - Gradient backgrounds for podium positions
  - Crown icons for top performers
  - Real-time platform stats integration
  - Improved animations and hover effects
- **Public Pages Redesign** - Complete UI overhaul (2026-01-15)
  - Homepage with hero section and feature cards
  - About page with mission statement and team info
  - Changelog page with version history
  - Discord icon integration
  - Extended real-time stats API (totalLinks, totalViews)
- **Referral System** - Complete referral functionality (2026-01-14)
  - Unique referral codes per user (auto-generated)
  - Referral join page at `eziox.link/join/{code}`
  - Referral tracking in database with `referrals` table
  - Referral dashboard at `/referrals` with stats and referred users list
  - Owner-only special code "EZIOX"
  - Score rewards: +5 points per successful referral
  - Schema updates: `referral_code`, `referred_by`, `creator_type`, `is_featured` on profiles
  - Schema updates: `referral_count` on user_stats
- **Followers System** - Complete follow/unfollow functionality (2026-01-14)
  - Follow/Unfollow button on all bio pages (`eziox.link/{username}`)
  - Real-time follower count updates with optimistic UI
  - Server functions: `isFollowingFn`, `followUserFn`, `unfollowUserFn`
  - Pagination support for followers/following lists
  - Score system: +2 for each follower gained
  - Sign-in prompt for non-authenticated users
- **Following Count** - Added to bio page stats section (2026-01-14)
- **CHANGELOG.md** - Project changelog following Keep a Changelog format (2026-01-14)

### Fixed

- **React Hydration Error #300** - Resolved SSR/CSR mismatch (2026-01-15)
  - Removed `isChildRoute` check causing hydration issues
  - Changed followers/following from child routes to sibling routes
  - Fixed route structure to prevent production errors
- **Avatar Display in Profile Sidebar** - Corrected image rendering (2026-01-15)
- **ESLint Errors in FollowModal** - Code quality improvements (2026-01-15)
  - Added await to invalidateQueries calls
  - Proper TypeScript types for filter functions
  - Removed unused imports and invalid property checks
- **View Tracking** - Session-based deduplication prevents counting on tab switches (2026-01-14)
  - Views only count once per browser session
  - Uses `sessionStorage` to track viewed profiles
- **Link Click Tracking** - Fixed with COALESCE for null safety (2026-01-14)
- **Session Persistence** - 7-day session expiry working correctly (2026-01-14)
- **Session Detection on Bio Pages** - Fixed using `useRouterState` to access parent loader data (2026-01-14)

### Changed

- **Followers/Following UX** - Converted from separate pages to modal (2026-01-15)
  - Removed `/followers` and `/following` route pages
  - Integrated modal directly into bio page
  - Click on follower/following stats to open modal
  - Improved user experience with seamless navigation
- **Profile Page Layout** - Complete redesign to 2-column (2026-01-15)
  - Sidebar navigation with quick actions
  - Mini user card with avatar and bio link
  - Blur toggle for sensitive account information
  - Better organization of user data
- **All Public Pages** - Modernized UI/UX (2026-01-15)
  - Homepage, About, Leaderboard, Changelog
  - Consistent design language across platform
  - Improved animations and transitions
- Updated documentation for Eziox Development organization (2026-01-14)
- Modernized `/links` page with stats cards and improved UI (2026-01-14)
- Removed all debug console.log statements (2026-01-14)
- **Bio Page UI Improvements** (2026-01-14)
  - Glassmorphism effect on link cards
  - Spring animations for smoother interactions
  - Hover glow effects with accent color
  - Improved icon animations
  - Better responsive design for stats

---

## [1.0.0] - 2025-01-14

### Added

- Initial release of Eziox Bio Link Platform
- User authentication with secure sessions
- Bio page creation and customization
- Link management with click tracking
- Profile customization (avatar, banner, bio, socials)
- Theme customization with accent colors
- Admin dashboard for platform management
- User stats tracking (views, clicks, followers)
- MIT License

### Technical Stack

- React 19 with TypeScript 5.9
- TanStack Start (SSR), Router & Query
- Neon PostgreSQL with Drizzle ORM
- Bun JavaScript runtime
- shadcn/ui components
- motion/react animations
- Cloudinary for image uploads

---

[Unreleased]: https://github.com/Eziox-Development/eziox-web/compare/v1.9.0...HEAD
[1.9.0]: https://github.com/Eziox-Development/eziox-web/compare/v1.8.0...v1.9.0
[1.8.0]: https://github.com/Eziox-Development/eziox-web/compare/v1.6.0...v1.8.0
[1.6.0]: https://github.com/Eziox-Development/eziox-web/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/Eziox-Development/eziox-web/compare/v1.4.1...v1.5.0
[1.4.1]: https://github.com/Eziox-Development/eziox-web/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/Eziox-Development/eziox-web/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/Eziox-Development/eziox-web/compare/v1.0.0...v1.3.0
[1.0.0]: https://github.com/Eziox-Development/eziox-web/releases/tag/v1.0.0
