/**
 * VirusTotal API Integration
 * For manual admin URL scanning
 */

const VIRUSTOTAL_API_URL = 'https://www.virustotal.com/api/v3'

export interface VirusTotalScanResult {
  success: boolean
  url: string
  scanId?: string
  stats?: {
    harmless: number
    malicious: number
    suspicious: number
    undetected: number
    timeout: number
  }
  categories?: Record<string, string>
  lastAnalysisDate?: string
  reputation?: number
  error?: string
  requiresApiKey?: boolean
}

export interface VirusTotalUrlReport {
  success: boolean
  url: string
  isMalicious: boolean
  isSuspicious: boolean
  threatLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical'
  detectionRatio: string
  categories: string[]
  engines: {
    name: string
    result: string
    category: string
  }[]
  lastAnalysisDate?: string
  error?: string
}

/**
 * Get VirusTotal API key from environment
 */
function getApiKey(): string | null {
  return process.env.VIRUSTOTAL_API_KEY || null
}

/**
 * Check if VirusTotal API is configured
 */
export function isVirusTotalConfigured(): boolean {
  return !!getApiKey()
}

/**
 * Encode URL for VirusTotal API (base64 without padding)
 */
function encodeUrlForVT(url: string): string {
  const base64 = Buffer.from(url).toString('base64')
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

/**
 * Submit URL for scanning (if not already in database)
 */
export async function submitUrlForScan(url: string): Promise<{ success: boolean; scanId?: string; error?: string }> {
  const apiKey = getApiKey()
  if (!apiKey) {
    return { success: false, error: 'VirusTotal API key not configured' }
  }

  try {
    const response = await fetch(`${VIRUSTOTAL_API_URL}/urls`, {
      method: 'POST',
      headers: {
        'x-apikey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `url=${encodeURIComponent(url)}`,
    })

    if (!response.ok) {
      if (response.status === 429) {
        return { success: false, error: 'Rate limit exceeded. Please try again later.' }
      }
      return { success: false, error: `API error: ${response.status}` }
    }

    const data = await response.json() as { data?: { id?: string } }
    return {
      success: true,
      scanId: data.data?.id,
    }
  } catch (error) {
    return { success: false, error: `Failed to submit URL: ${(error as Error).message}` }
  }
}

/**
 * Get URL report from VirusTotal
 */
export async function getUrlReport(url: string): Promise<VirusTotalUrlReport> {
  const apiKey = getApiKey()
  if (!apiKey) {
    return {
      success: false,
      url,
      isMalicious: false,
      isSuspicious: false,
      threatLevel: 'safe',
      detectionRatio: 'N/A',
      categories: [],
      engines: [],
      error: 'VirusTotal API key not configured. Add VIRUSTOTAL_API_KEY to your environment.',
    }
  }

  try {
    const urlId = encodeUrlForVT(url)
    const response = await fetch(`${VIRUSTOTAL_API_URL}/urls/${urlId}`, {
      method: 'GET',
      headers: {
        'x-apikey': apiKey,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        // URL not in database, submit for scanning
        const submitResult = await submitUrlForScan(url)
        if (submitResult.success) {
          return {
            success: true,
            url,
            isMalicious: false,
            isSuspicious: false,
            threatLevel: 'safe',
            detectionRatio: 'Pending',
            categories: [],
            engines: [],
            error: 'URL submitted for scanning. Please check again in a few seconds.',
          }
        }
        return {
          success: false,
          url,
          isMalicious: false,
          isSuspicious: false,
          threatLevel: 'safe',
          detectionRatio: 'N/A',
          categories: [],
          engines: [],
          error: submitResult.error,
        }
      }
      if (response.status === 429) {
        return {
          success: false,
          url,
          isMalicious: false,
          isSuspicious: false,
          threatLevel: 'safe',
          detectionRatio: 'N/A',
          categories: [],
          engines: [],
          error: 'Rate limit exceeded. Free tier allows 4 requests/minute.',
        }
      }
      return {
        success: false,
        url,
        isMalicious: false,
        isSuspicious: false,
        threatLevel: 'safe',
        detectionRatio: 'N/A',
        categories: [],
        engines: [],
        error: `API error: ${response.status}`,
      }
    }

    const data = await response.json() as {
      data?: {
        attributes?: {
          last_analysis_stats?: {
            harmless?: number
            malicious?: number
            suspicious?: number
            undetected?: number
            timeout?: number
          }
          last_analysis_results?: Record<string, {
            engine_name?: string
            result?: string
            category?: string
          }>
          categories?: Record<string, string>
          last_analysis_date?: number
          reputation?: number
        }
      }
    }
    const attributes = data.data?.attributes

    if (!attributes) {
      return {
        success: false,
        url,
        isMalicious: false,
        isSuspicious: false,
        threatLevel: 'safe',
        detectionRatio: 'N/A',
        categories: [],
        engines: [],
        error: 'Invalid response from VirusTotal',
      }
    }

    const stats = attributes.last_analysis_stats || {}
    const malicious = stats.malicious || 0
    const suspicious = stats.suspicious || 0
    const harmless = stats.harmless || 0
    const undetected = stats.undetected || 0
    const total = malicious + suspicious + harmless + undetected

    // Determine threat level
    let threatLevel: VirusTotalUrlReport['threatLevel'] = 'safe'
    if (malicious >= 5) {
      threatLevel = 'critical'
    } else if (malicious >= 3) {
      threatLevel = 'high'
    } else if (malicious >= 1 || suspicious >= 3) {
      threatLevel = 'medium'
    } else if (suspicious >= 1) {
      threatLevel = 'low'
    }

    // Extract categories
    const categories = attributes.categories
      ? Object.values(attributes.categories)
      : []

    // Extract engine results (only flagged ones)
    const engines: VirusTotalUrlReport['engines'] = []
    if (attributes.last_analysis_results) {
      for (const [, result] of Object.entries(attributes.last_analysis_results)) {
        if (result.category === 'malicious' || result.category === 'suspicious') {
          engines.push({
            name: result.engine_name || 'Unknown',
            result: result.result || 'Unknown',
            category: result.category,
          })
        }
      }
    }

    return {
      success: true,
      url,
      isMalicious: malicious > 0,
      isSuspicious: suspicious > 0,
      threatLevel,
      detectionRatio: `${malicious + suspicious}/${total}`,
      categories,
      engines: engines.slice(0, 10), // Limit to 10 engines
      lastAnalysisDate: attributes.last_analysis_date
        ? new Date(attributes.last_analysis_date * 1000).toISOString()
        : undefined,
    }
  } catch (error) {
    return {
      success: false,
      url,
      isMalicious: false,
      isSuspicious: false,
      threatLevel: 'safe',
      detectionRatio: 'N/A',
      categories: [],
      engines: [],
      error: `Failed to get report: ${(error as Error).message}`,
    }
  }
}

/**
 * Quick check if URL is malicious (for automated checks)
 * Returns cached result if available, otherwise submits for scan
 */
export async function quickUrlCheck(url: string): Promise<{
  isSafe: boolean
  threatLevel: VirusTotalUrlReport['threatLevel']
  error?: string
}> {
  const report = await getUrlReport(url)
  
  if (!report.success) {
    // If API fails, assume safe but log the error
    return {
      isSafe: true,
      threatLevel: 'safe',
      error: report.error,
    }
  }

  return {
    isSafe: !report.isMalicious && report.threatLevel !== 'high' && report.threatLevel !== 'critical',
    threatLevel: report.threatLevel,
  }
}
