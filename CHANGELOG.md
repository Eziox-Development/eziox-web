# Changelog

All notable changes to Eziox will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
