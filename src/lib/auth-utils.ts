import { siteConfig } from './site-config'

export interface User {
  $id: string
  email: string
  name?: string
}

/**
 * Check if a user is the site owner based on email or user ID
 */
export function isOwner(user: User | null | undefined): boolean {
  if (!user) return false
  
  const ownerEmail = siteConfig.owner.email
  const ownerUserId = siteConfig.owner.userId
  
  // Check by email (primary method)
  if (ownerEmail && user.email === ownerEmail) {
    return true
  }
  
  // Check by user ID (if configured)
  if (ownerUserId && user.$id === ownerUserId) {
    return true
  }
  
  return false
}

/**
 * Get owner badge/role for display
 */
export function getOwnerBadge(user: User | null | undefined): string | null {
  return isOwner(user) ? 'Owner' : null
}
