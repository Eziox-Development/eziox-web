/**
 * Eziox License Guard
 *
 * This module provides license validation and protection for the Eziox platform.
 * Licensed under PolyForm Noncommercial 1.0.0
 *
 * Copyright © 2026 Eziox Development. All rights reserved.
 * https://eziox.link
 *
 * WARNING: Tampering with this file violates the license agreement.
 */

// Licensed domains (obfuscated)
const _d = [
  'ZXppb3gubGluaw==',
  'd3d3LmV6aW94Lmxpbms=',
  'bG9jYWxob3N0',
  'MTI3LjAuMC4x',
  'bG9jYWxob3N0OjUxNzM=',
  'bG9jYWxob3N0OjQxNzM=',
  'bG9jYWxob3N0OjMwMDA=',
]

// Decode domains at runtime
const LICENSED_DOMAINS = _d.map(d => {
  try {
    return atob(d)
  } catch {
    return ''
  }
}).filter(Boolean)

// Integrity hash - do not modify
const INTEGRITY_CHECK = 'ez10x_2026_v1'

// Store original console methods
let _originalConsole: {
  log: typeof console.log
  warn: typeof console.warn
  error: typeof console.error
  clear: typeof console.clear
} | null = null

/**
 * Validates if the current domain is licensed to run Eziox
 */
export function validateLicense(): boolean {
  if (typeof window === 'undefined') return true

  const hostname = window.location.hostname
  const hostWithPort = window.location.host

  return LICENSED_DOMAINS.some(
    (domain) =>
      hostname === domain ||
      hostWithPort === domain ||
      hostname.endsWith(`.${domain}`),
  )
}

/**
 * Prints the styled license notice to the console
 */
function printLicenseNotice(): void {
  if (typeof console === 'undefined' || !_originalConsole) return

  const styles = {
    header: 'background: linear-gradient(90deg, #8b5cf6, #06b6d4); color: white; font-size: 14px; font-weight: bold; padding: 10px 20px; border-radius: 8px 8px 0 0;',
    body: 'background: #1a1a2e; color: #e2e8f0; font-size: 12px; padding: 8px 20px; line-height: 1.6;',
    footer: 'background: #1a1a2e; color: #64748b; font-size: 11px; padding: 8px 20px; border-radius: 0 0 8px 8px;',
    link: 'color: #8b5cf6; text-decoration: underline;',
    success: 'color: #22c55e;',
    warning: 'color: #f59e0b;',
  }

  _originalConsole.log('%c 🔐 EZIOX LICENSE ', styles.header)
  _originalConsole.log('%c PolyForm Noncommercial 1.0.0 ', styles.body)
  _originalConsole.log('%c ✅ Personal use, education, research ', styles.body + styles.success)
  _originalConsole.log('%c ❌ Commercial use, SaaS, selling ', styles.body + styles.warning)
  _originalConsole.log('%c © 2026 Eziox Development | business@eziox.link ', styles.footer)
}

/**
 * Protects console from tampering and clearing
 */
function protectConsole(): void {
  if (typeof window === 'undefined' || typeof console === 'undefined') return

  // Store original methods
  _originalConsole = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    clear: console.clear.bind(console),
  }

  // Override console.clear to prevent clearing license notice
  const originalClear = console.clear
  Object.defineProperty(console, 'clear', {
    value: function () {
      originalClear.call(console)
      // Re-print license notice after clear
      setTimeout(() => printLicenseNotice(), 0)
    },
    writable: false,
    configurable: false,
  })

  // Freeze console object to prevent modifications (but allow React DevTools)
  try {
    // Don't freeze console in development to allow React DevTools
    if (import.meta.env.PROD) {
      Object.freeze(console)
    }
  } catch {
    // Some browsers don't allow freezing console
  }
}

/**
 * Detects DevTools opening
 */
function detectDevTools(): void {
  if (typeof window === 'undefined') return

  let devToolsOpen = false

  const checkDevTools = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > 160
    const heightThreshold = window.outerHeight - window.innerHeight > 160

    if ((widthThreshold || heightThreshold) && !devToolsOpen) {
      devToolsOpen = true
      printLicenseNotice()
    } else if (!widthThreshold && !heightThreshold) {
      devToolsOpen = false
    }
  }

  // Check on resize (DevTools opening triggers resize)
  window.addEventListener('resize', checkDevTools)

  // Initial check
  checkDevTools()
}

/**
 * Anti-tampering: Monitors for modifications to critical functions
 */
function setupAntiTampering(): void {
  if (typeof window === 'undefined') return

  // Create a hidden marker
  const marker = Symbol.for(INTEGRITY_CHECK)
  ;(window as unknown as Record<symbol, boolean>)[marker] = true

  // Periodic integrity check
  setInterval(() => {
    if (!(window as unknown as Record<symbol, boolean>)[marker]) {
      if (_originalConsole) {
        _originalConsole.error(
          '%c⚠️ INTEGRITY VIOLATION DETECTED',
          'color: #ef4444; font-size: 16px; font-weight: bold;'
        )
      }
    }
  }, 5000)
}

/**
 * Warns about unlicensed domain usage
 */
function warnUnlicensedDomain(): void {
  if (!_originalConsole) return

  _originalConsole.warn(
    '%c⚠️ UNLICENSED DOMAIN',
    'background: #ef4444; color: white; font-size: 14px; font-weight: bold; padding: 5px 10px; border-radius: 4px;'
  )
  _originalConsole.warn(
    '%cThis domain is not licensed to run Eziox.',
    'color: #f59e0b; font-size: 12px;'
  )
  _originalConsole.warn(
    '%cCommercial use requires a license: business@eziox.link',
    'color: #3b82f6; font-size: 12px;'
  )

  // Add watermark to page for unlicensed domains
  if (typeof document !== 'undefined') {
    const watermark = document.createElement('div')
    watermark.id = 'eziox-license-watermark'
    watermark.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(239, 68, 68, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-family: system-ui, sans-serif;
        font-size: 12px;
        z-index: 999999;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        pointer-events: none;
      ">
        ⚠️ Unlicensed Eziox Instance
      </div>
    `
    document.body?.appendChild(watermark)
  }
}

/**
 * Main initialization - call this at app startup
 */
export function initLicenseGuard(): void {
  if (typeof window === 'undefined') return

  // Protect console first
  protectConsole()

  // Print license notice
  printLicenseNotice()

  // Setup protections
  detectDevTools()
  setupAntiTampering()

  // Check license
  if (!validateLicense()) {
    warnUnlicensedDomain()
  }

  // Make license info available globally (read-only)
  Object.defineProperty(window, 'EZIOX_LICENSE', {
    value: Object.freeze(getLicenseInfo()),
    writable: false,
    configurable: false,
    enumerable: true,
  })
}

/**
 * Returns license information
 */
export function getLicenseInfo() {
  return {
    name: 'PolyForm Noncommercial License 1.0.0',
    url: 'https://polyformproject.org/licenses/noncommercial/1.0.0',
    licensor: 'Eziox Development',
    software: 'Eziox Web Platform',
    website: 'https://eziox.link',
    contact: 'business@eziox.link',
    copyright: '© 2026 Eziox Development. All rights reserved.',
    version: '1.0.0',
    permitted: [
      'Personal use',
      'Educational use',
      'Research and experimentation',
      'Contributing via Issues and PRs',
      'Non-commercial projects',
    ],
    prohibited: [
      'Commercial use without license',
      'Selling or monetizing',
      'Hosting as a service (SaaS)',
      'Removing copyright notices',
      'Tampering with license guard',
    ],
  }
}

// Auto-initialize on import (client-side only)
if (typeof window !== 'undefined') {
  // Use requestIdleCallback or setTimeout for non-blocking init
  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => initLicenseGuard())
  } else {
    setTimeout(initLicenseGuard, 0)
  }
}
