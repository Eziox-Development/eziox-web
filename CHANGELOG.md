# Changelog

All notable changes to Eziox will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Followers System** - Complete follow/unfollow functionality
  - Follow/Unfollow button on all bio pages (`eziox.link/{username}`)
  - Real-time follower count updates with optimistic UI
  - Server functions: `isFollowingFn`, `followUserFn`, `unfollowUserFn`
  - Pagination support for followers/following lists
  - Score system: +2 for each follower gained
  - Sign-in prompt for non-authenticated users
- **Followers/Following List Pages**
  - `eziox.link/{username}/followers` - View all followers
  - `eziox.link/{username}/following` - View all following
  - Clickable stats on bio page linking to lists
  - Follow/unfollow directly from lists
- **Following Count** - Added to bio page stats section
- **CHANGELOG.md** - Project changelog following Keep a Changelog format

### Fixed
- **View Tracking** - Session-based deduplication prevents counting on tab switches
  - Views only count once per browser session
  - Uses `sessionStorage` to track viewed profiles
- **Link Click Tracking** - Fixed with COALESCE for null safety
- **Session Persistence** - 7-day session expiry working correctly
- **Session Detection on Bio Pages** - Fixed using `useRouterState` to access parent loader data

### Changed
- Updated documentation for Eziox Development organization
- Modernized `/links` page with stats cards and improved UI
- Removed all debug console.log statements
- **Bio Page UI Improvements**
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

[Unreleased]: https://github.com/Eziox-Development/eziox-web/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Eziox-Development/eziox-web/releases/tag/v1.0.0
