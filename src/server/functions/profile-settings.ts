import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie, setResponseStatus } from '@tanstack/react-start/server'
import { db } from '../db'
import { users, profiles, type CustomBackground, type LayoutSettings, type ProfileBackup } from '../db/schema'
import { eq } from 'drizzle-orm'
import { validateSession } from '../lib/auth'
import type { TierType } from '../lib/stripe'

async function getAuthenticatedUser() {
  const token = getCookie('session-token')
  if (!token) {
    setResponseStatus(401)
    throw { message: 'Not authenticated', status: 401 }
  }
  const user = await validateSession(token)
  if (!user) {
    setResponseStatus(401)
    throw { message: 'Not authenticated', status: 401 }
  }
  return user
}

async function getUserTier(userId: string): Promise<TierType> {
  const [userData] = await db
    .select({ tier: users.tier })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  
  const tier = userData?.tier || 'free'
  return (tier === 'standard' || !tier ? 'free' : tier) as TierType
}

function canAccessFeature(tier: TierType, feature: 'customBackgrounds' | 'layoutCustomization' | 'profileBackups' | 'extendedThemes'): boolean {
  const proFeatures = ['customBackgrounds', 'layoutCustomization', 'profileBackups', 'extendedThemes']
  if (proFeatures.includes(feature)) {
    return ['pro', 'creator', 'lifetime'].includes(tier)
  }
  return false
}

const customBackgroundSchema = z.object({
  type: z.enum(['solid', 'gradient', 'image', 'video', 'animated']),
  value: z.string(),
  gradientAngle: z.number().min(0).max(360).optional(),
  gradientColors: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
  imageOpacity: z.number().min(0).max(1).optional(),
  imageBlur: z.number().min(0).max(20).optional(),
  videoUrl: z.string().url().optional(),
  videoLoop: z.boolean().optional(),
  videoMuted: z.boolean().optional(),
  animatedPreset: z.string().optional(),
  animatedSpeed: z.enum(['slow', 'normal', 'fast']).optional(),
  animatedIntensity: z.enum(['subtle', 'normal', 'intense']).optional(),
  animatedColors: z.array(z.string()).optional(),
})

const layoutSettingsSchema = z.object({
  cardSpacing: z.number().min(0).max(32),
  cardBorderRadius: z.number().min(0).max(32),
  cardShadow: z.enum(['none', 'sm', 'md', 'lg', 'xl']),
  cardPadding: z.number().min(8).max(32),
  profileLayout: z.enum(['default', 'compact', 'expanded']),
  linkStyle: z.enum(['default', 'minimal', 'bold', 'glass']),
})

export const getProfileSettingsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getAuthenticatedUser()
  const tier = await getUserTier(user.id)

  const [profile] = await db
    .select({
      customBackground: profiles.customBackground,
      layoutSettings: profiles.layoutSettings,
      profileBackups: profiles.profileBackups,
      themeId: profiles.themeId,
      accentColor: profiles.accentColor,
    })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)

  return {
    tier,
    canCustomize: canAccessFeature(tier, 'customBackgrounds'),
    canLayoutCustomize: canAccessFeature(tier, 'layoutCustomization'),
    canBackup: canAccessFeature(tier, 'profileBackups'),
    canExtendedThemes: canAccessFeature(tier, 'extendedThemes'),
    customBackground: profile?.customBackground as CustomBackground | null,
    layoutSettings: profile?.layoutSettings as LayoutSettings | null,
    profileBackups: (profile?.profileBackups || []) as ProfileBackup[],
    themeId: profile?.themeId,
    accentColor: profile?.accentColor,
  }
})

export const updateCustomBackgroundFn = createServerFn({ method: 'POST' })
  .inputValidator(customBackgroundSchema.nullable())
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)

    if (!canAccessFeature(tier, 'customBackgrounds')) {
      setResponseStatus(403)
      throw { message: 'Custom backgrounds require Pro tier or higher', status: 403, code: 'TIER_REQUIRED' }
    }

    await db
      .update(profiles)
      .set({ 
        customBackground: data,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, user.id))

    return { success: true, customBackground: data }
  })

export const updateLayoutSettingsFn = createServerFn({ method: 'POST' })
  .inputValidator(layoutSettingsSchema.partial())
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)

    if (!canAccessFeature(tier, 'layoutCustomization')) {
      setResponseStatus(403)
      throw { message: 'Layout customization requires Pro tier or higher', status: 403, code: 'TIER_REQUIRED' }
    }

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
      .set({ 
        layoutSettings: newSettings,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, user.id))

    return { success: true, layoutSettings: newSettings }
  })

export const createProfileBackupFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ name: z.string().min(1).max(50) }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)

    if (!canAccessFeature(tier, 'profileBackups')) {
      setResponseStatus(403)
      throw { message: 'Profile backups require Pro tier or higher', status: 403, code: 'TIER_REQUIRED' }
    }

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)

    if (!profile) {
      setResponseStatus(404)
      throw { message: 'Profile not found', status: 404 }
    }

    const currentBackups = (profile.profileBackups || []) as ProfileBackup[]
    
    if (currentBackups.length >= 10) {
      setResponseStatus(400)
      throw { message: 'Maximum 10 backups allowed. Delete old backups first.', status: 400 }
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
        socials: profile.socials as Record<string, string> || undefined,
        customBackground: profile.customBackground as CustomBackground || undefined,
        layoutSettings: profile.layoutSettings as LayoutSettings || undefined,
      },
    }

    await db
      .update(profiles)
      .set({ 
        profileBackups: [...currentBackups, newBackup],
        updatedAt: new Date(),
      })
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
    const backup = backups.find(b => b.id === data.backupId)

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
    const filteredBackups = backups.filter(b => b.id !== data.backupId)

    await db
      .update(profiles)
      .set({ 
        profileBackups: filteredBackups,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, user.id))

    return { success: true }
  })

export const updateThemeFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ 
    themeId: z.string().nullable(),
    accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const tier = await getUserTier(user.id)

    const premiumThemes = ['aurora', 'sunset', 'ocean', 'forest', 'neon', 'pastel', 'monochrome', 'cyberpunk']
    if (data.themeId && premiumThemes.includes(data.themeId) && !canAccessFeature(tier, 'extendedThemes')) {
      setResponseStatus(403)
      throw { message: 'Extended themes require Pro tier or higher', status: 403, code: 'TIER_REQUIRED' }
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (data.themeId !== undefined) updateData.themeId = data.themeId
    if (data.accentColor !== undefined) updateData.accentColor = data.accentColor

    await db
      .update(profiles)
      .set(updateData)
      .where(eq(profiles.userId, user.id))

    return { success: true }
  })
