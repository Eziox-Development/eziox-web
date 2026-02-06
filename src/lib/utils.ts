import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Application URL Configuration
 * Uses a hardcoded production URL with localhost detection for development
 * This avoids exposing environment variables in the client bundle
 */
const APP_CONFIG = {
  productionUrl: 'https://www.eziox.link',
  productionHostname: 'www.eziox.link',
} as const

/**
 * Get the application URL
 * In browser: detects localhost for development, otherwise uses production URL
 * On server: always uses production URL
 */
export function getAppUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: detect development environment
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return window.location.origin
    }
  }
  return APP_CONFIG.productionUrl
}

/**
 * Convert a hex color string to an RGB string (e.g. '#ff0000' -> '255, 0, 0')
 * Used for rgba() CSS values throughout the app.
 */
export function hexToRgb(hex: string): string {
  if (!hex.startsWith('#')) return '99, 102, 241'
  const h = hex.slice(1)
  return `${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}`
}

/**
 * Get the application hostname
 * In browser: detects localhost for development, otherwise uses production hostname
 * On server: always uses production hostname
 */
export function getAppHostname(): string {
  if (typeof window !== 'undefined') {
    // Client-side: detect development environment
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return window.location.host // includes port for localhost
    }
  }
  return APP_CONFIG.productionHostname
}
