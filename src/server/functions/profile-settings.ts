import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { setResponseStatus } from '@tanstack/react-start/server'
import { db } from '../db'
import {
  profiles,
  type CustomBackground,
  type LayoutSettings,
  type ProfileBackup,
  type CustomTheme,
} from '../db/schema'
import { eq } from 'drizzle-orm'
import { getAuthenticatedUser, getUserTier } from './auth-helpers'
import {
  type TierType,
  canAccessFeature,
  isPremiumTier,
  TIER_CONFIG,
} from '../lib/stripe'
import { checkRateLimit, RATE_LIMITS } from '@/lib/security'

function getMaxCustomThemes(tier: TierType): number {
  if (tier === 'lifetime') return 20
  if (tier === 'creator') return 10
  if (tier === 'pro') return 5
  return 1
}

function getMaxBackups(tier: TierType): number {
  if (tier === 'lifetime') return 20
  if (tier === 'creator') return 15
  if (tier === 'pro') return 10
  return 0
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const customBackgroundSchema = z.object({
  type: z.enum(['solid', 'gradient', 'image', 'video', 'animated']),
  value: z.string().max(500).default(''),
  gradientAngle: z.number().min(0).max(360).optional(),
  gradientColors: z.array(z.string().max(20)).max(10).optional(),
  imageUrl: z.string().max(2048).optional(),
  imageOpacity: z.number().min(0).max(1).optional(),
  imageBlur: z.number().min(0).max(20).optional(),
  videoUrl: z.string().max(2048).optional(),
  videoLoop: z.boolean().optional(),
  videoMuted: z.boolean().optional(),
  animatedPreset: z.string().max(50).optional(),
  animatedSpeed: z.enum(['slow', 'normal', 'fast']).optional(),
  animatedIntensity: z.enum(['subtle', 'normal', 'intense']).optional(),
  animatedColors: z.array(z.string().max(20)).max(10).optional(),
})

const layoutSettingsSchema = z.object({
  cardLayout: z.enum(['default', 'tilt', 'stack', 'grid', 'minimal']).optional(),
  cardSpacing: z.number().min(0).max(32).optional(),
  cardBorderRadius: z.number().min(0).max(50).optional(),
  cardShadow: z.enum(['none', 'sm', 'md', 'lg', 'xl', 'glow']).optional(),
  cardPadding: z.number().min(0).max(32).optional(),
  cardTiltDegree: z.number().min(0).max(15).optional(),
  profileLayout: z.enum(['default', 'compact', 'expanded', 'centered', 'minimal', 'hero']).optional(),
  linkStyle: z.enum(['default', 'minimal', 'bold', 'glass', 'outline', 'gradient', 'neon']).optional(),
  linkBorderRadius: z.number().min(0).max(50).optional(),
  linkSpacing: z.number().min(0).max(32).optional(),
  showLinkIcons: z.boolean().optional(),
  linkIconPosition: z.enum(['left', 'right', 'none']).optional(),
  avatarSize: z.enum(['small', 'medium', 'large', 'xlarge']).optional(),
  avatarShape: z.enum(['circle', 'rounded', 'square']).optional(),
  avatarBorder: z.boolean().optional(),
  avatarGlow: z.boolean().optional(),
  headerLayout: z.enum(['centered', 'left', 'right', 'split']).optional(),
  showBio: z.boolean().optional(),
  showLocation: z.boolean().optional(),
  showStats: z.boolean().optional(),
  contentMaxWidth: z.number().min(320).max(1200).optional(),
  sectionSpacing: z.number().min(0).max(64).optional(),
  maxWidth: z.number().min(320).max(1200).optional(),
})

const customThemeColorsSchema = z.object({
  background: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  backgroundSecondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  foreground: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  foregroundMuted: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  border: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  card: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
})

const customThemeTypographySchema = z.object({
  displayFont: z.string().max(100),
  bodyFont: z.string().max(100),
  displayFontUrl: z.string().max(500).optional(),
  bodyFontUrl: z.string().max(500).optional(),
})

const customThemeEffectsSchema = z.object({
  glowIntensity: z.enum(['none', 'subtle', 'medium', 'strong']),
  borderRadius: z.enum(['sharp', 'rounded', 'pill']),
  cardStyle: z.enum(['flat', 'glass', 'neon', 'gradient']),
})

const customThemeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  colors: customThemeColorsSchema,
  typography: customThemeTypographySchema,
  effects: customThemeEffectsSchema,
})

// ============================================================================
// GET PROFILE SETTINGS
// ============================================================================

export const getProfileSettingsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getAuthenticatedUser()
  const tier = await getUserTier(user.id)
  const tierConfig = TIER_CONFIG[tier]

  const [profile] = await db
    .select({
      customBackground: profiles.customBackground,
      layoutSettings: profiles.layoutSettings,
      profileBackups: profiles.profileBackups,
      themeId: profiles.themeId,
      accentColor: profiles.accentColor,
      customThemes: profiles.customThemes,
      activeCustomThemeId: profiles.activeCustomThemeId,
    })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)

  return {
    tier,
    tierConfig,
    // Feature access
    features: {
      customCSS: canAccessFeature(tier, 'customCSS'),
      customFonts: canAccessFeature(tier, 'customFonts'),
      profileBackups: canAccessFeature(tier, 'profileBackups'),
      analyticsExport: canAccessFeature(tier, 'analyticsExport'),
      removeBranding: canAccessFeature(tier, 'removeBranding'),
      customDomain: canAccessFeature(tier, 'customDomain'),
      passwordProtectedLinks: canAccessFeature(tier, 'passwordProtectedLinks'),
      linkExpiration: canAccessFeature(tier, 'linkExpiration'),
      emailCollection: canAccessFeature(tier, 'emailCollection'),
      customOpenGraph: canAccessFeature(tier, 'customOpenGraph'),
    },
    // Limits
    limits: {
      maxCustomThemes: getMaxCustomThemes(tier),
      maxBackups: getMaxBackups(tier),
    },
    // Profile data
    customBackground: profile?.customBackground as CustomBackground | null,
    layoutSettings: profile?.layoutSettings as LayoutSettings | null,
    profileBackups: (profile?.profileBackups || []) as ProfileBackup[],
    customThemes: (profile?.customThemes || []) as CustomTheme[],
    activeCustomThemeId: profile?.activeCustomThemeId || null,
    themeId: profile?.themeId || null,
    accentColor: profile?.accentColor || null,
  }
})

// ============================================================================
// UPDATE CUSTOM BACKGROUND
// ============================================================================

export const updateCustomBackgroundFn = createServerFn({ method: 'POST' })
  .inputValidator(customBackgroundSchema.nullable())
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    // Rate limit
    const rateLimitResult = checkRateLimit(
      `settings:${user.id}`,
      RATE_LIMITS.API_SPOTIFY.maxRequests,
      RATE_LIMITS.API_SPOTIFY.windowMs,
    )
    if (!rateLimitResult.allowed) {
      setResponseStatus(429)
      throw { message: 'Rate limited. Please wait.', status: 429, code: 'RATE_LIMITED' }
    }

    // All background types available to all users
    const backgroundData: CustomBackground | null = data
      ? {
          type: data.type,
          value: data.value || '',
          gradientAngle: data.gradientAngle,
          gradientColors: data.gradientColors,
          imageUrl: data.imageUrl,
          imageOpacity: data.imageOpacity,
          imageBlur: data.imageBlur,
          videoUrl: data.videoUrl,
          videoLoop: data.videoLoop,
          videoMuted: data.videoMuted,
          animatedPreset: data.animatedPreset,
          animatedSpeed: data.animatedSpeed,
          animatedIntensity: data.animatedIntensity,
          animatedColors: data.animatedColors,
        }
      : null

    await db
      .update(profiles)
      .set({ customBackground: backgroundData, updatedAt: new Date() })
      .where(eq(profiles.userId, user.id))

    return { success: true, customBackground: backgroundData }
  })

// ============================================================================
// UPDATE LAYOUT SETTINGS
// ============================================================================

export const updateLayoutSettingsFn = createServerFn({ method: 'POST' })
  .inputValidator(layoutSettingsSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    const [currentProfile] = await db
      .select({ layoutSettings: profiles.layoutSettings })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)

    const defaultSettings: LayoutSettings = {
      cardSpacing: 12,
      cardBorderRadius: 16,
      cardShadow: 'md',
      cardPadding: 16,
      profileLayout: 'default',
      linkStyle: 'default',
    }

    const currentSettings = (currentProfile?.layoutSettings as LayoutSettings) || defaultSettings
    const newSettings: LayoutSettings = { ...currentSettings, ...data }

    await db
      .update(profiles)
      .set({ layoutSettings: newSettings, updatedAt: new Date() })
      .where(eq(profiles.userId, user.id))

    return { success: true, layoutSettings: newSettings }
  })

// ============================================================================
// UPDATE THEME
// ============================================================================

export const updateThemeFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      themeId: z.string().nullable().optional(),
      accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (data.themeId !== undefined) updateData.themeId = data.themeId
    if (data.accentColor !== undefined) updateData.accentColor = data.accentColor

    await db.update(profiles).set(updateData).where(eq(profiles.userId, user.id))

    return { success: true }
  })

// ============================================================================
// PROFILE BACKUPS
// ============================================================================

export const createProfileBackupFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ name: z.string().min(1).max(50) }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)

    if (!canAccessFeature(tier, 'profileBackups')) {
      setResponseStatus(403)
      throw { message: 'Profile backups require Pro tier or higher', status: 403, code: 'TIER_REQUIRED' }
    }

    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1)

    if (!profile) {
      setResponseStatus(404)
      throw { message: 'Profile not found', status: 404 }
    }

    const currentBackups = (profile.profileBackups || []) as ProfileBackup[]
    const maxBackups = getMaxBackups(tier)

    if (currentBackups.length >= maxBackups) {
      setResponseStatus(400)
      throw { message: `Maximum ${maxBackups} backups allowed. Delete old backups first.`, status: 400 }
    }

    const newBackup: ProfileBackup = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      name: data.name,
      data: {
        bio: profile.bio || undefined,
        avatar: profile.avatar || undefined,
        banner: profile.banner || undefined,
        accentColor: profile.accentColor || undefined,
        socials: (profile.socials as Record<string, string>) || undefined,
        customBackground: (profile.customBackground as CustomBackground) || undefined,
        layoutSettings: (profile.layoutSettings as LayoutSettings) || undefined,
      },
    }

    await db
      .update(profiles)
      .set({ profileBackups: [...currentBackups, newBackup], updatedAt: new Date() })
      .where(eq(profiles.userId, user.id))

    return { success: true, backup: newBackup }
  })

export const restoreProfileBackupFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ backupId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)

    if (!canAccessFeature(tier, 'profileBackups')) {
      setResponseStatus(403)
      throw { message: 'Profile backups require Pro tier or higher', status: 403, code: 'TIER_REQUIRED' }
    }

    const [profile] = await db
      .select({ profileBackups: profiles.profileBackups })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)

    const backups = (profile?.profileBackups || []) as ProfileBackup[]
    const backup = backups.find((b) => b.id === data.backupId)

    if (!backup) {
      setResponseStatus(404)
      throw { message: 'Backup not found', status: 404 }
    }

    await db
      .update(profiles)
      .set({
        bio: backup.data.bio || null,
        avatar: backup.data.avatar || null,
        banner: backup.data.banner || null,
        accentColor: backup.data.accentColor || null,
        socials: backup.data.socials || {},
        customBackground: backup.data.customBackground || null,
        layoutSettings: backup.data.layoutSettings || null,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, user.id))

    return { success: true, message: 'Profile restored from backup' }
  })

export const deleteProfileBackupFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ backupId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    const [profile] = await db
      .select({ profileBackups: profiles.profileBackups })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)

    const backups = (profile?.profileBackups || []) as ProfileBackup[]
    const filteredBackups = backups.filter((b) => b.id !== data.backupId)

    await db
      .update(profiles)
      .set({ profileBackups: filteredBackups, updatedAt: new Date() })
      .where(eq(profiles.userId, user.id))

    return { success: true }
  })

// ============================================================================
// CUSTOM THEMES
// ============================================================================

export const getCustomThemesFn = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getAuthenticatedUser()
  const tier = await getUserTier(user.id)

  const [profile] = await db
    .select({
      customThemes: profiles.customThemes,
      activeCustomThemeId: profiles.activeCustomThemeId,
    })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)

  return {
    themes: (profile?.customThemes || []) as CustomTheme[],
    activeThemeId: profile?.activeCustomThemeId || null,
    canCreate: true,
    maxThemes: getMaxCustomThemes(tier),
    tier,
  }
})

export const createCustomThemeFn = createServerFn({ method: 'POST' })
  .inputValidator(customThemeSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)

    const [profile] = await db
      .select({ customThemes: profiles.customThemes })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)

    const existingThemes = (profile?.customThemes || []) as CustomTheme[]
    const maxThemes = getMaxCustomThemes(tier)

    if (existingThemes.length >= maxThemes) {
      setResponseStatus(400)
      throw { message: `Maximum ${maxThemes} custom themes allowed`, status: 400 }
    }

    const newTheme: CustomTheme = {
      ...data,
      createdAt: new Date().toISOString(),
    }

    await db
      .update(profiles)
      .set({ customThemes: [...existingThemes, newTheme], updatedAt: new Date() })
      .where(eq(profiles.userId, user.id))

    return { success: true, theme: newTheme }
  })

export const updateCustomThemeFn = createServerFn({ method: 'POST' })
  .inputValidator(customThemeSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)

    if (!isPremiumTier(tier)) {
      setResponseStatus(403)
      throw { message: 'Custom themes require Pro tier or higher', status: 403, code: 'TIER_REQUIRED' }
    }

    const [profile] = await db
      .select({ customThemes: profiles.customThemes })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)

    const existingThemes = (profile?.customThemes || []) as CustomTheme[]
    const themeIndex = existingThemes.findIndex((t) => t.id === data.id)

    if (themeIndex === -1) {
      setResponseStatus(404)
      throw { message: 'Theme not found', status: 404 }
    }

    const originalCreatedAt = existingThemes[themeIndex]?.createdAt || new Date().toISOString()
    existingThemes[themeIndex] = { ...data, createdAt: originalCreatedAt }

    await db
      .update(profiles)
      .set({ customThemes: existingThemes, updatedAt: new Date() })
      .where(eq(profiles.userId, user.id))

    return { success: true }
  })

export const deleteCustomThemeFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ themeId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    const [profile] = await db
      .select({
        customThemes: profiles.customThemes,
        activeCustomThemeId: profiles.activeCustomThemeId,
      })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)

    const existingThemes = (profile?.customThemes || []) as CustomTheme[]
    const filteredThemes = existingThemes.filter((t) => t.id !== data.themeId)

    const updateData: Record<string, unknown> = {
      customThemes: filteredThemes,
      updatedAt: new Date(),
    }

    if (profile?.activeCustomThemeId === data.themeId) {
      updateData.activeCustomThemeId = null
    }

    await db.update(profiles).set(updateData).where(eq(profiles.userId, user.id))

    return { success: true }
  })

export const setActiveCustomThemeFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ themeId: z.string().uuid().nullable() }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)

    if (!isPremiumTier(tier)) {
      setResponseStatus(403)
      throw { message: 'Custom themes require Pro tier or higher', status: 403, code: 'TIER_REQUIRED' }
    }

    if (data.themeId) {
      const [profile] = await db
        .select({ customThemes: profiles.customThemes })
        .from(profiles)
        .where(eq(profiles.userId, user.id))
        .limit(1)

      const existingThemes = (profile?.customThemes || []) as CustomTheme[]
      const themeExists = existingThemes.some((t) => t.id === data.themeId)

      if (!themeExists) {
        setResponseStatus(404)
        throw { message: 'Theme not found', status: 404 }
      }
    }

    await db
      .update(profiles)
      .set({ activeCustomThemeId: data.themeId, updatedAt: new Date() })
      .where(eq(profiles.userId, user.id))

    return { success: true }
  })

// ============================================================================
// THEME IMPORT/EXPORT
// ============================================================================

export const exportCustomThemeFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ themeId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    const [profile] = await db
      .select({ customThemes: profiles.customThemes })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)

    const existingThemes = (profile?.customThemes || []) as CustomTheme[]
    const theme = existingThemes.find((t) => t.id === data.themeId)

    if (!theme) {
      setResponseStatus(404)
      throw { message: 'Theme not found', status: 404 }
    }

    return {
      success: true,
      data: {
        name: theme.name,
        colors: theme.colors,
        typography: theme.typography,
        effects: theme.effects,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      },
    }
  })

export const importCustomThemeFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      name: z.string().min(1).max(50),
      colors: customThemeColorsSchema,
      typography: customThemeTypographySchema,
      effects: customThemeEffectsSchema,
    }),
  )
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)

    if (!isPremiumTier(tier)) {
      setResponseStatus(403)
      throw { message: 'Custom themes require Pro tier or higher', status: 403, code: 'TIER_REQUIRED' }
    }

    const [profile] = await db
      .select({ customThemes: profiles.customThemes })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)

    const existingThemes = (profile?.customThemes || []) as CustomTheme[]
    const maxThemes = getMaxCustomThemes(tier)

    if (existingThemes.length >= maxThemes) {
      setResponseStatus(400)
      throw { message: `Maximum ${maxThemes} custom themes allowed`, status: 400 }
    }

    const newTheme: CustomTheme = {
      id: crypto.randomUUID(),
      name: data.name,
      createdAt: new Date().toISOString(),
      colors: data.colors,
      typography: data.typography,
      effects: data.effects,
    }

    await db
      .update(profiles)
      .set({ customThemes: [...existingThemes, newTheme], updatedAt: new Date() })
      .where(eq(profiles.userId, user.id))

    return { success: true, theme: newTheme }
  })

// ============================================================================
// INTRO GATE SETTINGS
// ============================================================================

const introGateSchema = z.object({
  enabled: z.boolean(),
  text: z.string().max(200).default(''),
  buttonText: z.string().max(50).default('Enter'),
  style: z.enum(['minimal', 'blur', 'overlay', 'cinematic']).default('blur'),
  showAvatar: z.boolean().default(true),
})

export const updateIntroGateFn = createServerFn({ method: 'POST' })
  .inputValidator(introGateSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    const rateLimitResult = checkRateLimit(
      `settings:${user.id}`,
      RATE_LIMITS.API_SPOTIFY.maxRequests,
      RATE_LIMITS.API_SPOTIFY.windowMs,
    )
    if (!rateLimitResult.allowed) {
      setResponseStatus(429)
      throw { message: 'Rate limited. Please wait.', status: 429, code: 'RATE_LIMITED' }
    }

    await db
      .update(profiles)
      .set({ introGate: data, updatedAt: new Date() })
      .where(eq(profiles.userId, user.id))

    return { success: true, introGate: data }
  })

// ============================================================================
// PROFILE MUSIC SETTINGS
// ============================================================================

const profileMusicSchema = z.object({
  enabled: z.boolean(),
  url: z.string().max(2048).default(''),
  autoplay: z.boolean().default(false),
  volume: z.number().min(0).max(1).default(0.5),
  loop: z.boolean().default(true),
})

export const updateProfileMusicFn = createServerFn({ method: 'POST' })
  .inputValidator(profileMusicSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()

    const rateLimitResult = checkRateLimit(
      `settings:${user.id}`,
      RATE_LIMITS.API_SPOTIFY.maxRequests,
      RATE_LIMITS.API_SPOTIFY.windowMs,
    )
    if (!rateLimitResult.allowed) {
      setResponseStatus(429)
      throw { message: 'Rate limited. Please wait.', status: 429, code: 'RATE_LIMITED' }
    }

    await db
      .update(profiles)
      .set({ profileMusic: data, updatedAt: new Date() })
      .where(eq(profiles.userId, user.id))

    return { success: true, profileMusic: data }
  })

// ============================================================================
// GET INTRO GATE & MUSIC SETTINGS
// ============================================================================

export const getIntroGateAndMusicFn = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getAuthenticatedUser()

  const [profile] = await db
    .select({
      introGate: profiles.introGate,
      profileMusic: profiles.profileMusic,
    })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)

  return {
    introGate: profile?.introGate as import('../db/schema').IntroGateSettings | null,
    profileMusic: profile?.profileMusic as import('../db/schema').ProfileMusicSettings | null,
  }
})

// ============================================================================
// NAME EFFECT SETTINGS
// ============================================================================

const nameEffectSchema = z.object({
  style: z.enum(['none', 'glow', 'gradient', 'rainbow', 'neon', 'glitch', 'typing']).default('none'),
  animation: z.enum(['none', 'typing', 'bounce-in', 'wave', 'flicker', 'pulse', 'float']).optional(),
  gradientColors: z.array(z.string().max(20)).max(5).optional(),
  glowColor: z.string().max(20).optional(),
  glowIntensity: z.enum(['subtle', 'medium', 'strong']).optional(),
  neonFlicker: z.boolean().optional(),
  letterSpacing: z.number().min(0).max(16).optional(),
  textTransform: z.enum(['none', 'uppercase', 'lowercase']).optional(),
})

export const updateNameEffectFn = createServerFn({ method: 'POST' })
  .inputValidator(nameEffectSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const rl = checkRateLimit(`settings:${user.id}`, RATE_LIMITS.API_SPOTIFY.maxRequests, RATE_LIMITS.API_SPOTIFY.windowMs)
    if (!rl.allowed) { setResponseStatus(429); throw { message: 'Rate limited.', status: 429 } }
    await db.update(profiles).set({ nameEffect: data, updatedAt: new Date() }).where(eq(profiles.userId, user.id))
    return { success: true, nameEffect: data }
  })

// ============================================================================
// STATUS TEXT SETTINGS
// ============================================================================

const statusTextSchema = z.object({
  enabled: z.boolean(),
  text: z.string().max(200).default(''),
  emoji: z.string().max(10).optional(),
  typewriter: z.boolean().default(false),
  typewriterSpeed: z.number().min(20).max(200).optional(),
  coloredWords: z.array(z.object({ word: z.string().max(50), color: z.string().max(20) })).max(20).optional(),
})

export const updateStatusTextFn = createServerFn({ method: 'POST' })
  .inputValidator(statusTextSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const rl = checkRateLimit(`settings:${user.id}`, RATE_LIMITS.API_SPOTIFY.maxRequests, RATE_LIMITS.API_SPOTIFY.windowMs)
    if (!rl.allowed) { setResponseStatus(429); throw { message: 'Rate limited.', status: 429 } }
    await db.update(profiles).set({ statusText: data, updatedAt: new Date() }).where(eq(profiles.userId, user.id))
    return { success: true, statusText: data }
  })

// ============================================================================
// CUSTOM CURSOR SETTINGS
// ============================================================================

const customCursorSchema = z.object({
  enabled: z.boolean(),
  type: z.enum(['pack', 'browser', 'custom']).default('pack'),
  packId: z.string().max(100).optional(),
  browserPreset: z.enum(['crosshair', 'pointer', 'cell', 'none', 'default']).optional(),
  customUrl: z.string().max(2048).optional(),
})

export const updateCustomCursorFn = createServerFn({ method: 'POST' })
  .inputValidator(customCursorSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const rl = checkRateLimit(`settings:${user.id}`, RATE_LIMITS.API_SPOTIFY.maxRequests, RATE_LIMITS.API_SPOTIFY.windowMs)
    if (!rl.allowed) { setResponseStatus(429); throw { message: 'Rate limited.', status: 429 } }
    await db.update(profiles).set({ customCursor: data, updatedAt: new Date() }).where(eq(profiles.userId, user.id))
    return { success: true, customCursor: data }
  })

// ============================================================================
// PROFILE EFFECTS SETTINGS
// ============================================================================

const profileEffectsSchema = z.object({
  enabled: z.boolean(),
  effect: z.enum(['none', 'sparkles', 'snow', 'rain', 'confetti', 'fireflies', 'bubbles', 'stars', 'matrix']).default('none'),
  intensity: z.enum(['subtle', 'normal', 'intense']).optional(),
  color: z.string().max(20).optional(),
})

export const updateProfileEffectsFn = createServerFn({ method: 'POST' })
  .inputValidator(profileEffectsSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const rl = checkRateLimit(`settings:${user.id}`, RATE_LIMITS.API_SPOTIFY.maxRequests, RATE_LIMITS.API_SPOTIFY.windowMs)
    if (!rl.allowed) { setResponseStatus(429); throw { message: 'Rate limited.', status: 429 } }
    await db.update(profiles).set({ profileEffects: data, updatedAt: new Date() }).where(eq(profiles.userId, user.id))
    return { success: true, profileEffects: data }
  })

// ============================================================================
// GET ALL ADVANCED PROFILE SETTINGS
// ============================================================================

export const getAdvancedProfileSettingsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getAuthenticatedUser()
  const [profile] = await db
    .select({
      nameEffect: profiles.nameEffect,
      statusText: profiles.statusText,
      customCursor: profiles.customCursor,
      profileEffects: profiles.profileEffects,
    })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)

  return {
    nameEffect: profile?.nameEffect as import('../db/schema').NameEffect | null,
    statusText: profile?.statusText as import('../db/schema').StatusText | null,
    customCursor: profile?.customCursor as import('../db/schema').CustomCursor | null,
    profileEffects: profile?.profileEffects as import('../db/schema').ProfileEffects | null,
  }
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { CustomBackground, LayoutSettings, ProfileBackup, CustomTheme }
export type { IntroGateSettings, ProfileMusicSettings, NameEffect, StatusText, CustomCursor, ProfileEffects } from '../db/schema'
