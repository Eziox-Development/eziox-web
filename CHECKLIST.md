# Eziox Development Checklist & Roadmap

> **Eziox Development** · [eziox.link](https://eziox.link)

---

## ✅ Completed Features

### Core Platform
- [x] Bio link pages at `/{username}`
- [x] Link management (`/links`)
- [x] User authentication (sign-up, sign-in, sign-out)
- [x] Profile customization (avatar, banner, bio, socials)
- [x] Leaderboard with podium display
- [x] Theme system (5 variants)
- [x] URL shortener (`/s/{code}`)
- [x] Profile view tracking
- [x] RSS feed & Sitemap

### Recent Updates (2026-01-14)
- [x] Modernized `/links` page with stats cards
- [x] Fixed link click tracking
- [x] Updated documentation for Eziox Development
- [x] Added MIT License

---

## 🔧 Bug Fixes Needed

### High Priority
- [ ] **Link Click Tracking** - Verify clicks increment correctly after fix
- [ ] **Session Persistence** - Check 7-day session expiry works

---

## 🚀 Feature Roadmap

### Phase 1: Social Features (Priority: HIGH)

#### 1. Followers System
- [ ] Follow/Unfollow button on bio pages
- [ ] Followers/Following counts in profile
- [ ] Followers list page (`/profile/followers`)
- [ ] Following list page (`/profile/following`)
- [ ] Follow notifications
- [ ] Update `follows` table usage
- [ ] Increment/decrement `userStats.followers` and `userStats.following`

#### 2. Referral System
- [ ] Generate unique referral codes per user
- [ ] Referral link format: `eziox.link/join/{code}`
- [ ] Track referral signups in database
- [ ] New table: `referrals` (referrer_id, referred_id, code, created_at)
- [ ] Referral stats in profile/dashboard
- [ ] **Owner-only referral code** - Special code only visible to owner
- [ ] Referral rewards system (premium days, badges)

#### 3. Badge System
- [ ] Badge types:
  - [ ] `verified` - Verified creator
  - [ ] `premium` - Premium subscriber
  - [ ] `early_adopter` - Early platform users
  - [ ] `referral_master` - 10+ referrals
  - [ ] `creator` - Content creator badge
  - [ ] `vtuber` - VTuber badge
  - [ ] `streamer` - Streamer badge
  - [ ] `partner` - Official partner
- [ ] Badge display on bio pages
- [ ] Badge management in admin panel
- [ ] Special badges for referred creators

### Phase 2: Creator Features (Priority: HIGH)

#### 4. Creator/Partner Page
- [ ] New route: `/creators` or `/partners`
- [ ] Showcase referred creators (VTubers, Streamers)
- [ ] Creator cards with:
  - [ ] Avatar, name, bio
  - [ ] Platform links (Twitch, YouTube, etc.)
  - [ ] Special partner badge
  - [ ] "Joined via [Owner]'s referral"
- [ ] Featured creators section
- [ ] Filter by category (VTuber, Streamer, Artist, etc.)

#### 5. Spotify Integration
- [ ] Spotify OAuth connection
- [ ] New table: `spotify_connections` (user_id, access_token, refresh_token, expires_at)
- [ ] Display "Currently Listening" on bio page
- [ ] Show:
  - [ ] Song title & artist
  - [ ] Album art
  - [ ] Progress bar (optional)
  - [ ] "Not playing" state
- [ ] Spotify link to song
- [ ] Auto-refresh token handling
- [ ] Privacy toggle (show/hide activity)

### Phase 3: Analytics & Engagement (Priority: MEDIUM)

#### 6. Enhanced Analytics
- [ ] Analytics dashboard (`/analytics`)
- [ ] Charts for:
  - [ ] Profile views over time
  - [ ] Link clicks over time
  - [ ] Top performing links
  - [ ] Visitor sources (referrer)
- [ ] Export analytics data
- [ ] Daily/Weekly/Monthly views

#### 7. Notifications System
- [ ] New table: `notifications`
- [ ] Notification types:
  - [ ] New follower
  - [ ] Profile milestone (100 views, etc.)
  - [ ] Link milestone (100 clicks)
  - [ ] System announcements
- [ ] Notification bell in navbar
- [ ] Mark as read functionality
- [ ] Email notifications (optional)

### Phase 4: Premium Features (Priority: MEDIUM)

#### 8. Premium Tiers
- [ ] Tier system:
  - [ ] **Free** - Basic features, limited links
  - [ ] **Pro** - Unlimited links, analytics, custom themes
  - [ ] **Creator** - All Pro + Spotify, priority support
- [ ] Stripe integration for payments
- [ ] Subscription management
- [ ] Premium badge display

#### 9. Custom Themes
- [ ] Theme builder for premium users
- [ ] Custom colors, fonts, backgrounds
- [ ] Theme presets marketplace
- [ ] Import/Export themes

### Phase 5: Advanced Features (Priority: LOW)

#### 10. Link Scheduling
- [ ] Schedule links to appear/disappear
- [ ] Time-limited links
- [ ] Countdown timer display

#### 11. QR Codes
- [ ] Generate QR code for bio page
- [ ] Downloadable QR images
- [ ] Custom QR colors

#### 12. Link Analytics
- [ ] Per-link click analytics
- [ ] Geographic data (country)
- [ ] Device/browser stats
- [ ] Click heatmap

#### 13. API Access
- [ ] Public API for profile data
- [ ] API keys management
- [ ] Rate limiting
- [ ] Webhook support

---

## 🗄️ Database Schema Updates Needed

### New Tables
```sql
-- Referrals
CREATE TABLE referrals (
  id UUID PRIMARY KEY,
  referrer_id UUID REFERENCES users(id),
  referred_id UUID REFERENCES users(id),
  code VARCHAR(20) UNIQUE,
  created_at TIMESTAMP
);

-- Spotify Connections
CREATE TABLE spotify_connections (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);

-- Badges (extend profiles.badges JSONB or create table)
CREATE TABLE user_badges (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  badge_type VARCHAR(50),
  awarded_at TIMESTAMP,
  awarded_by UUID REFERENCES users(id)
);
```

### Schema Modifications
```sql
-- Add to profiles
ALTER TABLE profiles ADD COLUMN referral_code VARCHAR(20) UNIQUE;
ALTER TABLE profiles ADD COLUMN referred_by UUID REFERENCES users(id);
ALTER TABLE profiles ADD COLUMN creator_type VARCHAR(50); -- vtuber, streamer, artist, etc.
ALTER TABLE profiles ADD COLUMN is_featured BOOLEAN DEFAULT false;

-- Add to user_stats
ALTER TABLE user_stats ADD COLUMN referral_count INTEGER DEFAULT 0;
```

---

## 🔒 Security Considerations

- [ ] Rate limit Spotify API calls
- [ ] Validate referral codes server-side
- [ ] Sanitize creator page content
- [ ] Secure OAuth token storage
- [ ] Admin-only badge assignment

---

## 📱 UI/UX Improvements

- [ ] Mobile app (React Native / PWA)
- [ ] Dark/Light mode toggle
- [ ] Accessibility improvements (ARIA)
- [ ] Loading skeletons
- [ ] Error boundaries
- [ ] Offline support

---

## 🧪 Testing

- [ ] Unit tests for server functions
- [ ] E2E tests with Playwright
- [ ] Load testing for analytics
- [ ] Security audit

---

## 📋 Pre-Deployment Checklist

### Code Quality
- [ ] TypeScript builds (`bun run build`)
- [ ] Linting passes (`bun run lint`)
- [ ] Code formatted (`bun run format`)

### Configuration
- [ ] Environment variables set
- [ ] Database schema pushed
- [ ] SSL certificate active

### Testing
- [ ] All features working
- [ ] Mobile responsive
- [ ] Cross-browser tested

---

**Last Updated**: 2026-01-14  
**Next Review**: Before each major feature release
