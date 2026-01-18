/**
 * Database Schema
 * Complete schema for user profiles, links, and stats
 */

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

// ============================================================================
// USERS TABLE
// ============================================================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 100 }),
  emailVerified: boolean('email_verified').default(false),
  role: varchar('role', { length: 20 }).default('user'), // user, admin, owner
  tier: varchar('tier', { length: 20 }).default('free'), // free, pro, creator
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  tierExpiresAt: timestamp('tier_expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles),
  links: many(userLinks),
  stats: one(userStats),
}))

// ============================================================================
// PROFILES TABLE
// ============================================================================

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  bio: text('bio'),
  avatar: text('avatar'), // Cloudinary URL
  banner: text('banner'), // Cloudinary URL
  location: varchar('location', { length: 100 }),
  website: varchar('website', { length: 255 }),
  pronouns: varchar('pronouns', { length: 50 }),
  birthday: timestamp('birthday'),
  accentColor: varchar('accent_color', { length: 7 }), // Hex color
  badges: jsonb('badges').$type<string[]>().default([]),
  socials: jsonb('socials').$type<Record<string, string>>().default({}),
  isPublic: boolean('is_public').default(true),
  showActivity: boolean('show_activity').default(true),
  referralCode: varchar('referral_code', { length: 20 }),
  referredBy: uuid('referred_by').references(() => users.id, { onDelete: 'set null' }),
  creatorType: varchar('creator_type', { length: 50 }),
  isFeatured: boolean('is_featured').default(false),
  notifyNewFollower: boolean('notify_new_follower').default(true),
  notifyMilestones: boolean('notify_milestones').default(true),
  notifySystemUpdates: boolean('notify_system_updates').default(true),
  lastSeenChangelog: varchar('last_seen_changelog', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}))

// ============================================================================
// USER LINKS TABLE (Linktree-style)
// ============================================================================

export const userLinks = pgTable('user_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 100 }).notNull(),
  url: text('url').notNull(),
  icon: varchar('icon', { length: 50 }), // Icon name from lucide
  thumbnail: text('thumbnail'), // Optional thumbnail image
  description: varchar('description', { length: 255 }),
  backgroundColor: varchar('background_color', { length: 7 }),
  textColor: varchar('text_color', { length: 7 }),
  isActive: boolean('is_active').default(true),
  clicks: integer('clicks').default(0),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const userLinksRelations = relations(userLinks, ({ one }) => ({
  user: one(users, {
    fields: [userLinks.userId],
    references: [users.id],
  }),
}))

// ============================================================================
// USER STATS TABLE
// ============================================================================

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

// ============================================================================
// SESSIONS TABLE (for auth)
// ============================================================================

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  userAgent: text('user_agent'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

// ============================================================================
// FOLLOWS TABLE
// ============================================================================

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

// ============================================================================
// REFERRALS TABLE
// ============================================================================

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

// ============================================================================
// ACTIVITY LOG TABLE
// ============================================================================

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

// ============================================================================
// BLOG POSTS TABLE
// ============================================================================

export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  coverImage: text('cover_image'),
  category: varchar('category', { length: 50 }),
  tags: jsonb('tags').$type<string[]>().default([]),
  isPublished: boolean('is_published').default(false),
  isFeatured: boolean('is_featured').default(false),
  views: integer('views').default(0),
  likes: integer('likes').default(0),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
}))

// ============================================================================
// PROJECTS TABLE
// ============================================================================

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  content: text('content'),
  coverImage: text('cover_image'),
  liveUrl: text('live_url'),
  sourceUrl: text('source_url'),
  technologies: jsonb('technologies').$type<string[]>().default([]),
  category: varchar('category', { length: 50 }),
  status: varchar('status', { length: 20 }).default('completed'), // in_progress, completed, archived
  isPublished: boolean('is_published').default(false),
  isFeatured: boolean('is_featured').default(false),
  views: integer('views').default(0),
  likes: integer('likes').default(0),
  order: integer('order').default(0),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const projectsRelations = relations(projects, ({ one }) => ({
  author: one(users, {
    fields: [projects.authorId],
    references: [users.id],
  }),
}))

// ============================================================================
// SHORT LINKS TABLE (URL Shortener)
// ============================================================================

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

// ============================================================================
// PARTNER APPLICATIONS TABLE
// ============================================================================

export const partnerApplications = pgTable('partner_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  companyName: varchar('company_name', { length: 200 }),
  website: varchar('website', { length: 255 }),
  socialLinks: jsonb('social_links').$type<Record<string, string>>().default({}),
  category: varchar('category', { length: 50 }).notNull(),
  subcategory: varchar('subcategory', { length: 50 }),
  categoryData: jsonb('category_data').$type<Record<string, string | string[] | number | boolean | null>>().default({}),
  audienceSize: varchar('audience_size', { length: 50 }),
  description: text('description').notNull(),
  whyPartner: text('why_partner').notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  adminNotes: text('admin_notes'),
  reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const partnerApplicationsRelations = relations(partnerApplications, ({ one }) => ({
  user: one(users, {
    fields: [partnerApplications.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [partnerApplications.reviewedBy],
    references: [users.id],
  }),
}))

// ============================================================================
// NOTIFICATIONS TABLE
// ============================================================================

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

// ============================================================================
// ANALYTICS DAILY TABLE (Aggregated daily stats for performance)
// ============================================================================

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
  topLinks: jsonb('top_links').$type<{ linkId: string; clicks: number }[]>().default([]),
  referrers: jsonb('referrers').$type<{ source: string; count: number }[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const analyticsDailyRelations = relations(analyticsDaily, ({ one }) => ({
  user: one(users, {
    fields: [analyticsDaily.userId],
    references: [users.id],
  }),
}))

// ============================================================================
// SPOTIFY CONNECTIONS TABLE
// ============================================================================

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

export const spotifyConnectionsRelations = relations(spotifyConnections, ({ one }) => ({
  user: one(users, {
    fields: [spotifyConnections.userId],
    references: [users.id],
  }),
}))

// ============================================================================
// SUBSCRIPTIONS TABLE (Stripe subscription tracking)
// ============================================================================

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }).notNull().unique(),
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

// ============================================================================
// TYPE EXPORTS
// ============================================================================

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
export type BlogPost = typeof blogPosts.$inferSelect
export type NewBlogPost = typeof blogPosts.$inferInsert
export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
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
