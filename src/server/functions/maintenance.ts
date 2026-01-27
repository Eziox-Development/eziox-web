import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '@/server/db'
import { siteSettings } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from './auth'
import { siteConfig } from '@/lib/site-config'

// Maintenance mode settings interface
export interface MaintenanceSettings {
  enabled: boolean
  message?: string
  allowedEmails?: string[]
  estimatedEndTime?: string
  enabledAt?: string
  enabledBy?: string
}

const MAINTENANCE_KEY = 'maintenance_mode'

// Get maintenance mode status (public - no auth required)
export const getMaintenanceStatusFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const setting = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, MAINTENANCE_KEY))
        .limit(1)

      if (!setting[0]) {
        return {
          enabled: false,
          message: null,
          estimatedEndTime: null,
        }
      }

      const value = setting[0].value as MaintenanceSettings
      return {
        enabled: value.enabled || false,
        message:
          value.message ||
          'We are currently performing maintenance. Please check back soon.',
        estimatedEndTime: value.estimatedEndTime || null,
      }
    } catch {
      return {
        enabled: false,
        message: null,
        estimatedEndTime: null,
      }
    }
  },
)

// Check if user can bypass maintenance (owner only)
export const canBypassMaintenanceFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        return { canBypass: false }
      }

      // Owner can always bypass
      if (currentUser.role === 'owner') {
        return { canBypass: true }
      }

      // Check if user email is in allowed list
      const setting = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, MAINTENANCE_KEY))
        .limit(1)

      if (!setting[0]) {
        return { canBypass: false }
      }

      const value = setting[0].value as MaintenanceSettings
      const allowedEmails = value.allowedEmails || []

      // Owner email from config always allowed
      const ownerEmail = siteConfig.owner.email
      if (currentUser.email === ownerEmail) {
        return { canBypass: true }
      }

      return { canBypass: allowedEmails.includes(currentUser.email) }
    } catch {
      return { canBypass: false }
    }
  },
)

// Get full maintenance settings (admin only)
export const getMaintenanceSettingsFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== 'owner') {
    throw new Error('Unauthorized: Owner access required')
  }

  const setting = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, MAINTENANCE_KEY))
    .limit(1)

  if (!setting[0]) {
    return {
      enabled: false,
      message:
        'We are currently performing maintenance. Please check back soon.',
      allowedEmails: [],
      estimatedEndTime: undefined,
      enabledAt: undefined,
      enabledBy: undefined,
    } satisfies MaintenanceSettings
  }

  return setting[0].value as MaintenanceSettings
})

// Update maintenance settings (owner only)
export const updateMaintenanceSettingsFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      enabled: z.boolean(),
      message: z.string().max(500).optional(),
      allowedEmails: z.array(z.string().email()).optional(),
      estimatedEndTime: z.string().optional().nullable(),
    }),
  )
  .handler(async ({ data }) => {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'owner') {
      throw new Error('Unauthorized: Owner access required')
    }

    const existingSetting = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, MAINTENANCE_KEY))
      .limit(1)

    const newValue: MaintenanceSettings = {
      enabled: data.enabled,
      message:
        data.message ||
        'We are currently performing maintenance. Please check back soon.',
      allowedEmails: data.allowedEmails || [],
      estimatedEndTime: data.estimatedEndTime || undefined,
      enabledAt: data.enabled ? new Date().toISOString() : undefined,
      enabledBy: data.enabled ? currentUser.id : undefined,
    }

    if (existingSetting[0]) {
      // Preserve enabledAt/enabledBy if already enabled
      const oldValue = existingSetting[0].value as MaintenanceSettings
      if (data.enabled && oldValue.enabled) {
        newValue.enabledAt = oldValue.enabledAt
        newValue.enabledBy = oldValue.enabledBy
      }

      await db
        .update(siteSettings)
        .set({
          value: newValue,
          updatedBy: currentUser.id,
          updatedAt: new Date(),
        })
        .where(eq(siteSettings.key, MAINTENANCE_KEY))
    } else {
      await db.insert(siteSettings).values({
        key: MAINTENANCE_KEY,
        value: newValue,
        description: 'Maintenance mode settings',
        updatedBy: currentUser.id,
      })
    }

    return {
      success: true,
      message: data.enabled
        ? 'Maintenance mode enabled'
        : 'Maintenance mode disabled',
      settings: newValue,
    }
  })

// Quick toggle maintenance mode (owner only)
export const toggleMaintenanceModeFn = createServerFn({
  method: 'POST',
}).handler(async () => {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== 'owner') {
    throw new Error('Unauthorized: Owner access required')
  }

  const existingSetting = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, MAINTENANCE_KEY))
    .limit(1)

  const currentValue = existingSetting[0]?.value as
    | MaintenanceSettings
    | undefined
  const newEnabled = !(currentValue?.enabled || false)

  const newValue: MaintenanceSettings = {
    enabled: newEnabled,
    message:
      currentValue?.message ||
      'We are currently performing maintenance. Please check back soon.',
    allowedEmails: currentValue?.allowedEmails || [],
    estimatedEndTime: currentValue?.estimatedEndTime,
    enabledAt: newEnabled ? new Date().toISOString() : undefined,
    enabledBy: newEnabled ? currentUser.id : undefined,
  }

  if (existingSetting[0]) {
    await db
      .update(siteSettings)
      .set({
        value: newValue,
        updatedBy: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(siteSettings.key, MAINTENANCE_KEY))
  } else {
    await db.insert(siteSettings).values({
      key: MAINTENANCE_KEY,
      value: newValue,
      description: 'Maintenance mode settings',
      updatedBy: currentUser.id,
    })
  }

  return {
    success: true,
    enabled: newEnabled,
    message: newEnabled
      ? 'Maintenance mode enabled'
      : 'Maintenance mode disabled',
  }
})
