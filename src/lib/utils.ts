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
