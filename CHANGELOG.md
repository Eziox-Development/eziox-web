# Changelog

All notable changes to Eziox will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/Eziox-Development/eziox-web/compare/v1.4.1...HEAD
[1.4.1]: https://github.com/Eziox-Development/eziox-web/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/Eziox-Development/eziox-web/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/Eziox-Development/eziox-web/compare/v1.0.0...v1.3.0
[1.0.0]: https://github.com/Eziox-Development/eziox-web/releases/tag/v1.0.0
