/**
 * VirusTotal API Server Functions
 * Admin-only URL scanning endpoints
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAdmin } from './auth-helpers'
import {
  getUrlReport,
  isVirusTotalConfigured,
  type VirusTotalUrlReport,
} from '../lib/virustotal'

// =============================================================================
// Check if VirusTotal is configured
// =============================================================================

export const checkVirusTotalConfigFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requireAdmin()
    return {
      configured: isVirusTotalConfigured(),
      message: isVirusTotalConfigured()
        ? 'VirusTotal API is configured and ready'
        : 'VirusTotal API key not configured. Add VIRUSTOTAL_API_KEY to your environment.',
    }
  },
)

// =============================================================================
// Scan URL with VirusTotal
// =============================================================================

export const scanUrlWithVirusTotalFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      url: z.string().min(1, 'URL is required'),
    }),
  )
  .handler(async ({ data }): Promise<VirusTotalUrlReport> => {
    await requireAdmin()

    // Normalize URL - add https:// if no protocol specified
    let normalizedUrl = data.url.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`
    }

    // Validate URL format
    try {
      new URL(normalizedUrl)
    } catch {
      return {
        success: false,
        url: data.url,
        isMalicious: false,
        isSuspicious: false,
        threatLevel: 'safe',
        detectionRatio: 'N/A',
        categories: [],
        engines: [],
        error: 'Invalid URL format. Please enter a valid URL (e.g., example.com or https://example.com)',
      }
    }

    if (!isVirusTotalConfigured()) {
      return {
        success: false,
        url: normalizedUrl,
        isMalicious: false,
        isSuspicious: false,
        threatLevel: 'safe',
        detectionRatio: 'N/A',
        categories: [],
        engines: [],
        error: 'VirusTotal API key not configured. Add VIRUSTOTAL_API_KEY to your environment.',
      }
    }

    const report = await getUrlReport(normalizedUrl)
    return report
  })

// =============================================================================
// Batch scan multiple URLs
// =============================================================================

export const batchScanUrlsFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      urls: z.array(z.string().url()).max(10, 'Maximum 10 URLs per batch'),
    }),
  )
  .handler(async ({ data }): Promise<{ results: VirusTotalUrlReport[] }> => {
    await requireAdmin()

    if (!isVirusTotalConfigured()) {
      return {
        results: data.urls.map((url) => ({
          success: false,
          url,
          isMalicious: false,
          isSuspicious: false,
          threatLevel: 'safe' as const,
          detectionRatio: 'N/A',
          categories: [],
          engines: [],
          error: 'VirusTotal API key not configured',
        })),
      }
    }

    // Process URLs sequentially to respect rate limits
    const results: VirusTotalUrlReport[] = []
    for (const url of data.urls) {
      const report = await getUrlReport(url)
      results.push(report)
      // Add small delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 250))
    }

    return { results }
  })
