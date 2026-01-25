import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  varchar,
  jsonb,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// USERS TABLE
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 100 }),
  emailVerified: boolean('email_verified').default(false),
  role: varchar('role', { length: 20 }).default('user'),
  tier: varchar('tier', { length: 20 }).default('free'),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  tierExpiresAt: timestamp('tier_expires_at'),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lockedUntil: timestamp('locked_until'),
  twoFactorSecret: text('two_factor_secret'),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  twoFactorRecoveryCodes: text('two_factor_recovery_codes'),
  passwordResetToken: text('password_reset_token'),
  passwordResetExpires: timestamp('password_reset_expires'),
  emailVerificationToken: text('email_verification_token'),
  emailVerificationExpires: timestamp('email_verification_expires'),
  lastLoginAt: timestamp('last_login_at'),
  lastLoginIp: varchar('last_login_ip', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles),
  links: many(userLinks),
  stats: one(userStats),
}))

// PROFILES TABLE
export interface CustomBackground {
  type: 'solid' | 'gradient' | 'image' | 'video' | 'animated'
  value: string
  gradientAngle?: number
  gradientColors?: string[]
  imageUrl?: string
  imageOpacity?: number
  imageBlur?: number
  videoUrl?: string
  videoLoop?: boolean
  videoMuted?: boolean
  animatedPreset?: string
  animatedSpeed?: 'slow' | 'normal' | 'fast'
  animatedIntensity?: 'subtle' | 'normal' | 'intense'
  animatedColors?: string[]
}

export interface LayoutSettings {
  cardSpacing: number
  cardBorderRadius: number
  cardShadow: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  cardPadding: number
  profileLayout: 'default' | 'compact' | 'expanded'
  linkStyle: 'default' | 'minimal' | 'bold' | 'glass'
}

export interface ProfileBackup {
  id: string
  createdAt: string
  name: string
  data: {
    bio?: string
    avatar?: string
    banner?: string
    accentColor?: string
    socials?: Record<string, string>
    customBackground?: CustomBackground
    layoutSettings?: LayoutSettings
  }
}

export interface CustomFont {
  id: string
  name: string
  url: string
  type: 'display' | 'body'
}

export interface AnimatedProfileSettings {
  enabled: boolean
  avatarAnimation: 'none' | 'pulse' | 'glow' | 'bounce' | 'rotate' | 'shake'
  bannerAnimation: 'none' | 'parallax' | 'gradient-shift' | 'particles'
  linkHoverEffect: 'none' | 'scale' | 'glow' | 'slide' | 'shake' | 'flip'
  pageTransition: 'none' | 'fade' | 'slide' | 'zoom'
}

export interface OpenGraphSettings {
  title?: string
  description?: string
  image?: string
  useCustom: boolean
}

export interface CustomTheme {
  id: string
  name: string
  createdAt: string
  colors: {
    background: string
    backgroundSecondary: string
    foreground: string
    foregroundMuted: string
    primary: string
    accent: string
    border: string
    card: string
  }
  typography: {
    displayFont: string
    bodyFont: string
    displayFontUrl?: string
    bodyFontUrl?: string
  }
  effects: {
    glowIntensity: 'none' | 'subtle' | 'medium' | 'strong'
    borderRadius: 'sharp' | 'rounded' | 'pill'
    cardStyle: 'flat' | 'glass' | 'neon' | 'gradient'
  }
}

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  bio: text('bio'),
  avatar: text('avatar'),
  banner: text('banner'),
  location: varchar('location', { length: 100 }),
  website: varchar('website', { length: 255 }),
  pronouns: varchar('pronouns', { length: 50 }),
  birthday: timestamp('birthday'),
  accentColor: varchar('accent_color', { length: 7 }),
  badges: jsonb('badges').$type<string[]>().default([]),
  socials: jsonb('socials').$type<Record<string, string>>().default({}),
  isPublic: boolean('is_public').default(true),
  showActivity: boolean('show_activity').default(true),
  referralCode: varchar('referral_code', { length: 20 }),
  referredBy: uuid('referred_by').references(() => users.id, {
    onDelete: 'set null',
  }),
  creatorTypes: jsonb('creator_types').$type<string[]>().default([]),
  isFeatured: boolean('is_featured').default(false),
  notifyNewFollower: boolean('notify_new_follower').default(true),
  notifyMilestones: boolean('notify_milestones').default(true),
  notifySystemUpdates: boolean('notify_system_updates').default(true),
  emailLoginAlerts: boolean('email_login_alerts').default(true),
  emailSecurityAlerts: boolean('email_security_alerts').default(true),
  emailWeeklyDigest: boolean('email_weekly_digest').default(true),
  emailProductUpdates: boolean('email_product_updates').default(true),
  lastSeenChangelog: varchar('last_seen_changelog', { length: 20 }),
  customBackground: jsonb('custom_background').$type<CustomBackground>(),
  layoutSettings: jsonb('layout_settings').$type<LayoutSettings>(),
  profileBackups: jsonb('profile_backups').$type<ProfileBackup[]>().default([]),
  themeId: varchar('theme_id', { length: 50 }),
  customCSS: text('custom_css'),
  customFonts: jsonb('custom_fonts').$type<CustomFont[]>().default([]),
  animatedProfile: jsonb('animated_profile').$type<AnimatedProfileSettings>(),
  openGraphSettings: jsonb('open_graph_settings').$type<OpenGraphSettings>(),
  customThemes: jsonb('custom_themes').$type<CustomTheme[]>().default([]),
  activeCustomThemeId: varchar('active_custom_theme_id', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}))

// USER LINKS TABLE (Linktree-style)
export interface LinkSchedule {
  enabled: boolean
  startDate?: string
  endDate?: string
  timezone?: string
  showCountdown?: boolean
  countdownStyle?: 'minimal' | 'detailed' | 'badge'
  hideWhenExpired?: boolean
}

export interface QRCodeStyle {
  foregroundColor?: string
  backgroundColor?: string
  logoUrl?: string
  cornerStyle?: 'square' | 'rounded' | 'dots'
  size?: number
}

export interface MediaEmbed {
  type:
    | 'spotify'
    | 'soundcloud'
    | 'youtube'
    | 'twitch'
    | 'tiktok'
    | 'apple-music'
  embedId?: string
  embedUrl?: string
  autoplay?: boolean
  showArtwork?: boolean
  theme?: 'light' | 'dark' | 'auto'
  height?: number
  compact?: boolean
}

export const userLinks = pgTable('user_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 100 }).notNull(),
  url: text('url').notNull(),
  icon: varchar('icon', { length: 50 }),
  thumbnail: text('thumbnail'),
  description: varchar('description', { length: 255 }),
  backgroundColor: varchar('background_color', { length: 7 }),
  textColor: varchar('text_color', { length: 7 }),
  isActive: boolean('is_active').default(true),
  clicks: integer('clicks').default(0),
  order: integer('order').default(0),
  isFeatured: boolean('is_featured').default(false),
  featuredStyle: varchar('featured_style', { length: 20 }),
  schedule: jsonb('schedule').$type<LinkSchedule>(),
  password: text('password'),
  qrCodeStyle: jsonb('qr_code_style').$type<QRCodeStyle>(),
  mediaEmbed: jsonb('media_embed').$type<MediaEmbed>(),
  linkType: varchar('link_type', { length: 20 }).default('link'),
  groupId: uuid('group_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const userLinksRelations = relations(userLinks, ({ one }) => ({
  user: one(users, {
    fields: [userLinks.userId],
    references: [users.id],
  }),
  group: one(linkGroups, {
    fields: [userLinks.groupId],
    references: [linkGroups.id],
  }),
}))

// LINK GROUPS TABLE (for organizing links into sections)
export const linkGroups = pgTable('link_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  icon: varchar('icon', { length: 50 }),
  color: varchar('color', { length: 7 }),
  isCollapsible: boolean('is_collapsible').default(false),
  isCollapsed: boolean('is_collapsed').default(false),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const linkGroupsRelations = relations(linkGroups, ({ one, many }) => ({
  user: one(users, {
    fields: [linkGroups.userId],
    references: [users.id],
  }),
  links: many(userLinks),
}))

// PROFILE WIDGETS TABLE (customizable widgets for bio page)
export interface WidgetSettings {
  size?: 'small' | 'medium' | 'large' | 'full'
  style?: 'minimal' | 'card' | 'glass' | 'neon'
  showTitle?: boolean
  customCSS?: string
}

export interface SpotifyWidgetConfig {
  showRecentlyPlayed?: boolean
  showCurrentlyPlaying?: boolean
  theme?: 'light' | 'dark' | 'auto'
}

export interface WeatherWidgetConfig {
  location?: string
  units?: 'celsius' | 'fahrenheit'
  showForecast?: boolean
}

export interface CountdownWidgetConfig {
  targetDate: string
  title?: string
  showDays?: boolean
  showHours?: boolean
  showMinutes?: boolean
  showSeconds?: boolean
}

export interface SocialFeedWidgetConfig {
  platform: 'twitter' | 'instagram' | 'tiktok' | 'youtube'
  username?: string
  postCount?: number
}

export const profileWidgets = pgTable('profile_widgets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 100 }),
  isActive: boolean('is_active').default(true),
  order: integer('order').default(0),
  settings: jsonb('settings').$type<WidgetSettings>(),
  config: jsonb('config').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const profileWidgetsRelations = relations(profileWidgets, ({ one }) => ({
  user: one(users, {
    fields: [profileWidgets.userId],
    references: [users.id],
  }),
}))

// SOCIAL INTEGRATIONS TABLE (connected social accounts beyond Spotify)
export const socialIntegrations = pgTable('social_integrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  platform: varchar('platform', { length: 50 }).notNull(),
  platformUserId: varchar('platform_user_id', { length: 255 }),
  platformUsername: varchar('platform_username', { length: 255 }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),
  scope: text('scope'),
  showOnProfile: boolean('show_on_profile').default(true),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const socialIntegrationsRelations = relations(
  socialIntegrations,
  ({ one }) => ({
    user: one(users, {
      fields: [socialIntegrations.userId],
      references: [users.id],
    }),
  }),
)

// MEDIA LIBRARY TABLE (for storing uploaded media)
export const mediaLibrary = pgTable('media_library', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }),
  mimeType: varchar('mime_type', { length: 100 }),
  size: integer('size'),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  width: integer('width'),
  height: integer('height'),
  folder: varchar('folder', { length: 100 }),
  alt: varchar('alt', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const mediaLibraryRelations = relations(mediaLibrary, ({ one }) => ({
  user: one(users, {
    fields: [mediaLibrary.userId],
    references: [users.id],
  }),
}))

// SCHEDULED POSTS TABLE (for scheduling link visibility)
export const scheduledPosts = pgTable('scheduled_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  linkId: uuid('link_id').references(() => userLinks.id, {
    onDelete: 'cascade',
  }),
  action: varchar('action', { length: 20 }).notNull(),
  scheduledFor: timestamp('scheduled_for').notNull(),
  executedAt: timestamp('executed_at'),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const scheduledPostsRelations = relations(scheduledPosts, ({ one }) => ({
  user: one(users, {
    fields: [scheduledPosts.userId],
    references: [users.id],
  }),
  link: one(userLinks, {
    fields: [scheduledPosts.linkId],
    references: [userLinks.id],
  }),
}))

// USER STATS TABLE
export const userStats = pgTable('user_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  profileViews: integer('profile_views').default(0),
  totalLinkClicks: integer('total_link_clicks').default(0),
  followers: integer('followers').default(0),
  following: integer('following').default(0),
  referralCount: integer('referral_count').default(0), // Number of users referred
  score: integer('score').default(0), // For ranking
  lastActive: timestamp('last_active').defaultNow(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id],
  }),
}))

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  userAgent: text('user_agent'),
  ipAddress: varchar('ip_address', { length: 45 }),
  rememberMe: boolean('remember_me').default(false),
  lastActivityAt: timestamp('last_activity_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

// FOLLOWS TABLE
export const follows = pgTable('follows', {
  id: uuid('id').primaryKey().defaultRandom(),
  followerId: uuid('follower_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  followingId: uuid('following_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: 'follower',
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: 'following',
  }),
}))

// REFERRALS TABLE
export const referrals = pgTable('referrals', {
  id: uuid('id').primaryKey().defaultRandom(),
  referrerId: uuid('referrer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  referredId: uuid('referred_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(), // Each user can only be referred once
  code: varchar('code', { length: 20 }).notNull(), // The code used for referral
  rewardClaimed: boolean('reward_claimed').default(false), // If referrer claimed reward
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: 'referrer',
  }),
  referred: one(users, {
    fields: [referrals.referredId],
    references: [users.id],
    relationName: 'referred',
  }),
}))

// ACTIVITY LOG TABLE
export const activityLog = pgTable('activity_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // profile_view, link_click, follow, etc.
  targetId: uuid('target_id'), // ID of the target (user, link, etc.)
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id],
  }),
}))

// SHORT LINKS TABLE (URL Shortener)
export const shortLinks = pgTable('short_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 20 }).notNull().unique(), // e.g., "abc123"
  targetUrl: text('target_url').notNull(),
  title: varchar('title', { length: 100 }),
  clicks: integer('clicks').default(0),
  isActive: boolean('is_active').default(true),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const shortLinksRelations = relations(shortLinks, ({ one }) => ({
  user: one(users, {
    fields: [shortLinks.userId],
    references: [users.id],
  }),
}))

// PARTNER APPLICATIONS TABLE
export const partnerApplications = pgTable('partner_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  companyName: varchar('company_name', { length: 200 }),
  website: varchar('website', { length: 255 }),
  socialLinks: jsonb('social_links')
    .$type<Record<string, string>>()
    .default({}),
  category: varchar('category', { length: 50 }).notNull(),
  subcategory: varchar('subcategory', { length: 50 }),
  categoryData: jsonb('category_data')
    .$type<Record<string, string | string[] | number | boolean | null>>()
    .default({}),
  audienceSize: varchar('audience_size', { length: 50 }),
  description: text('description').notNull(),
  whyPartner: text('why_partner').notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  adminNotes: text('admin_notes'),
  reviewedBy: uuid('reviewed_by').references(() => users.id, {
    onDelete: 'set null',
  }),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const partnerApplicationsRelations = relations(
  partnerApplications,
  ({ one }) => ({
    user: one(users, {
      fields: [partnerApplications.userId],
      references: [users.id],
    }),
    reviewer: one(users, {
      fields: [partnerApplications.reviewedBy],
      references: [users.id],
    }),
  }),
)

// NOTIFICATIONS TABLE
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // new_follower, profile_milestone, link_milestone, system
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message'),
  data: jsonb('data').$type<Record<string, unknown>>().default({}), // Additional data (e.g., follower info, milestone count)
  isRead: boolean('is_read').default(false),
  actionUrl: text('action_url'), // Optional URL to navigate to
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}))

// ANALYTICS DAILY TABLE (Aggregated daily stats for performance)
export const analyticsDaily = pgTable('analytics_daily', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(), // Date of the analytics (start of day)
  profileViews: integer('profile_views').default(0),
  linkClicks: integer('link_clicks').default(0),
  newFollowers: integer('new_followers').default(0),
  uniqueVisitors: integer('unique_visitors').default(0),
  topLinks: jsonb('top_links')
    .$type<{ linkId: string; clicks: number }[]>()
    .default([]),
  referrers: jsonb('referrers')
    .$type<{ source: string; count: number }[]>()
    .default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const analyticsDailyRelations = relations(analyticsDaily, ({ one }) => ({
  user: one(users, {
    fields: [analyticsDaily.userId],
    references: [users.id],
  }),
}))

// LINK CLICK ANALYTICS TABLE (detailed per-click tracking)
export const linkClickAnalytics = pgTable('link_click_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  linkId: uuid('link_id')
    .notNull()
    .references(() => userLinks.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  country: varchar('country', { length: 2 }),
  city: varchar('city', { length: 100 }),
  region: varchar('region', { length: 100 }),
  device: varchar('device', { length: 20 }),
  browser: varchar('browser', { length: 50 }),
  os: varchar('os', { length: 50 }),
  referrer: text('referrer'),
  userAgent: text('user_agent'),
  ipHash: varchar('ip_hash', { length: 64 }),
  clickedAt: timestamp('clicked_at').defaultNow().notNull(),
})

export const linkClickAnalyticsRelations = relations(
  linkClickAnalytics,
  ({ one }) => ({
    link: one(userLinks, {
      fields: [linkClickAnalytics.linkId],
      references: [userLinks.id],
    }),
    user: one(users, {
      fields: [linkClickAnalytics.userId],
      references: [users.id],
    }),
  }),
)

// CUSTOM DOMAINS TABLE (Creator Tier Feature)
export const customDomains = pgTable('custom_domains', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  domain: varchar('domain', { length: 255 }).notNull().unique(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  verificationToken: text('verification_token'),
  verifiedAt: timestamp('verified_at'),
  sslStatus: varchar('ssl_status', { length: 20 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const customDomainsRelations = relations(customDomains, ({ one }) => ({
  user: one(users, {
    fields: [customDomains.userId],
    references: [users.id],
  }),
}))

// PROFILE VIEW ANALYTICS TABLE (detailed per-view tracking)
export const profileViewAnalytics = pgTable('profile_view_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileUserId: uuid('profile_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  country: varchar('country', { length: 2 }),
  city: varchar('city', { length: 100 }),
  device: varchar('device', { length: 20 }),
  browser: varchar('browser', { length: 50 }),
  os: varchar('os', { length: 50 }),
  referrer: text('referrer'),
  ipHash: varchar('ip_hash', { length: 64 }),
  viewedAt: timestamp('viewed_at').defaultNow().notNull(),
})

export const profileViewAnalyticsRelations = relations(
  profileViewAnalytics,
  ({ one }) => ({
    profileUser: one(users, {
      fields: [profileViewAnalytics.profileUserId],
      references: [users.id],
    }),
  }),
)

// EMAIL SUBSCRIBERS TABLE (Creator Tier Feature)
export const emailSubscribers = pgTable('email_subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }),
  subscribedAt: timestamp('subscribed_at').defaultNow().notNull(),
  unsubscribedAt: timestamp('unsubscribed_at'),
  source: varchar('source', { length: 50 }),
})

export const emailSubscribersRelations = relations(
  emailSubscribers,
  ({ one }) => ({
    user: one(users, {
      fields: [emailSubscribers.userId],
      references: [users.id],
    }),
  }),
)

// SPOTIFY CONNECTIONS TABLE
export const spotifyConnections = pgTable('spotify_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  scope: text('scope'),
  showOnProfile: boolean('show_on_profile').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const spotifyConnectionsRelations = relations(
  spotifyConnections,
  ({ one }) => ({
    user: one(users, {
      fields: [spotifyConnections.userId],
      references: [users.id],
    }),
  }),
)

// SUBSCRIPTIONS TABLE (Stripe subscription tracking)
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 })
    .notNull()
    .unique(),
  stripePriceId: varchar('stripe_price_id', { length: 255 }).notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).notNull(),
  tier: varchar('tier', { length: 20 }).notNull(), // pro, creator
  status: varchar('status', { length: 50 }).notNull(), // active, canceled, past_due, trialing, etc.
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  canceledAt: timestamp('canceled_at'),
  endedAt: timestamp('ended_at'),
  trialStart: timestamp('trial_start'),
  trialEnd: timestamp('trial_end'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}))

// COMMUNITY TEMPLATES TABLE
export interface TemplateSettings {
  customBackground?: CustomBackground
  layoutSettings?: LayoutSettings
  customCSS?: string
  customFonts?: CustomFont[]
  animatedProfile?: AnimatedProfileSettings
  accentColor?: string
  themeId?: string
}

export const communityTemplates = pgTable('community_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull(), // vtuber, gamer, developer, minimal, creative, etc.
  tags: jsonb('tags').$type<string[]>().default([]),
  settings: jsonb('settings').$type<TemplateSettings>().notNull(),
  previewImage: text('preview_image'),
  isPublic: boolean('is_public').default(true),
  isFeatured: boolean('is_featured').default(false),
  uses: integer('uses').default(0),
  likes: integer('likes').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const communityTemplatesRelations = relations(
  communityTemplates,
  ({ one }) => ({
    user: one(users, {
      fields: [communityTemplates.userId],
      references: [users.id],
    }),
  }),
)

// TEMPLATE LIKES TABLE
export const templateLikes = pgTable('template_likes', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id')
    .notNull()
    .references(() => communityTemplates.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const templateLikesRelations = relations(templateLikes, ({ one }) => ({
  template: one(communityTemplates, {
    fields: [templateLikes.templateId],
    references: [communityTemplates.id],
  }),
  user: one(users, {
    fields: [templateLikes.userId],
    references: [users.id],
  }),
}))

// ADMIN AUDIT LOG TABLE
export const adminAuditLog = pgTable('admin_audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminId: uuid('admin_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 100 }).notNull(),
  targetType: varchar('target_type', { length: 50 }).notNull(),
  targetId: uuid('target_id'),
  details: jsonb('details'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const adminAuditLogRelations = relations(adminAuditLog, ({ one }) => ({
  admin: one(users, {
    fields: [adminAuditLog.adminId],
    references: [users.id],
  }),
}))

// API KEYS TABLE
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  keyHash: text('key_hash').notNull(),
  keyPrefix: varchar('key_prefix', { length: 20 }).notNull(),
  permissions: jsonb('permissions').notNull(),
  rateLimit: integer('rate_limit').default(1000),
  rateLimitWindow: integer('rate_limit_window').default(3600),
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'),
  isActive: boolean('is_active').default(true).notNull(),
  requestCount: integer('request_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}))

// API REQUEST LOGS TABLE
export const apiRequestLogs = pgTable('api_request_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  apiKeyId: uuid('api_key_id')
    .notNull()
    .references(() => apiKeys.id, { onDelete: 'cascade' }),
  endpoint: varchar('endpoint', { length: 255 }).notNull(),
  method: varchar('method', { length: 10 }).notNull(),
  statusCode: integer('status_code').notNull(),
  responseTime: integer('response_time'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const apiRequestLogsRelations = relations(apiRequestLogs, ({ one }) => ({
  apiKey: one(apiKeys, {
    fields: [apiRequestLogs.apiKeyId],
    references: [apiKeys.id],
  }),
}))

// CONTACT MESSAGES TABLE
export const contactMessages = pgTable('contact_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: varchar('category', { length: 50 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 200 }).notNull(),
  message: text('message').notNull(),
  status: varchar('status', { length: 20 }).default('new').notNull(),
  adminNotes: text('admin_notes'),
  respondedAt: timestamp('responded_at'),
  respondedBy: uuid('responded_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const contactMessagesRelations = relations(
  contactMessages,
  ({ one }) => ({
    responder: one(users, {
      fields: [contactMessages.respondedBy],
      references: [users.id],
    }),
  }),
)

// TYPE EXPORTS
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
export type UserLink = typeof userLinks.$inferSelect
export type NewUserLink = typeof userLinks.$inferInsert
export type UserStats = typeof userStats.$inferSelect
export type Session = typeof sessions.$inferSelect
export type Follow = typeof follows.$inferSelect
export type Referral = typeof referrals.$inferSelect
export type NewReferral = typeof referrals.$inferInsert
export type ActivityLog = typeof activityLog.$inferSelect
export type ShortLink = typeof shortLinks.$inferSelect
export type NewShortLink = typeof shortLinks.$inferInsert
export type PartnerApplication = typeof partnerApplications.$inferSelect
export type NewPartnerApplication = typeof partnerApplications.$inferInsert
export type SpotifyConnection = typeof spotifyConnections.$inferSelect
export type NewSpotifyConnection = typeof spotifyConnections.$inferInsert
export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
export type AnalyticsDaily = typeof analyticsDaily.$inferSelect
export type NewAnalyticsDaily = typeof analyticsDaily.$inferInsert
export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert
export type CommunityTemplate = typeof communityTemplates.$inferSelect
export type NewCommunityTemplate = typeof communityTemplates.$inferInsert
export type TemplateLike = typeof templateLikes.$inferSelect
export type AdminAuditLog = typeof adminAuditLog.$inferSelect
export type NewAdminAuditLog = typeof adminAuditLog.$inferInsert
export type ContactMessage = typeof contactMessages.$inferSelect
export type NewContactMessage = typeof contactMessages.$inferInsert
export type CustomDomain = typeof customDomains.$inferSelect
export type NewCustomDomain = typeof customDomains.$inferInsert
export type ProfileViewAnalytics = typeof profileViewAnalytics.$inferSelect
export type NewProfileViewAnalytics = typeof profileViewAnalytics.$inferInsert
export type EmailSubscriber = typeof emailSubscribers.$inferSelect
export type NewEmailSubscriber = typeof emailSubscribers.$inferInsert
export type LinkClickAnalytics = typeof linkClickAnalytics.$inferSelect
export type NewLinkClickAnalytics = typeof linkClickAnalytics.$inferInsert
export type LinkGroup = typeof linkGroups.$inferSelect
export type NewLinkGroup = typeof linkGroups.$inferInsert
export type ProfileWidget = typeof profileWidgets.$inferSelect
export type NewProfileWidget = typeof profileWidgets.$inferInsert
export type SocialIntegration = typeof socialIntegrations.$inferSelect
export type NewSocialIntegration = typeof socialIntegrations.$inferInsert
export type MediaLibraryItem = typeof mediaLibrary.$inferSelect
export type NewMediaLibraryItem = typeof mediaLibrary.$inferInsert
export type ScheduledPost = typeof scheduledPosts.$inferSelect
export type NewScheduledPost = typeof scheduledPosts.$inferInsert
export type ApiKey = typeof apiKeys.$inferSelect
export type NewApiKey = typeof apiKeys.$inferInsert
export type ApiRequestLog = typeof apiRequestLogs.$inferSelect
export type NewApiRequestLog = typeof apiRequestLogs.$inferInsert
