/**
 * Comprehensive Email Validation Library
 *
 * Provides multi-layer email validation:
 * 1. Syntax validation (RFC 5322 compliant)
 * 2. DNS/MX record verification
 * 3. Disposable email detection
 * 4. Role-based email detection
 * 5. Typo detection for common domains
 * 6. Risk scoring
 */

import dns from 'dns'
import { promisify } from 'util'

const resolveMx = promisify(dns.resolveMx)

export interface EmailValidationResult {
  valid: boolean
  email: string
  normalized: string
  checks: {
    syntax: boolean
    domain: boolean
    mx: boolean
    disposable: boolean
    roleAccount: boolean
    typo: boolean
  }
  risk: 'low' | 'medium' | 'high'
  riskScore: number
  suggestion?: string
  errors: string[]
  warnings: string[]
}

export interface EmailValidationOptions {
  checkMx?: boolean
  checkDisposable?: boolean
  checkRoleAccount?: boolean
  checkTypo?: boolean
  allowPlusAddressing?: boolean
  timeout?: number
}

const DEFAULT_OPTIONS: EmailValidationOptions = {
  checkMx: true,
  checkDisposable: true,
  checkRoleAccount: true,
  checkTypo: true,
  allowPlusAddressing: true,
  timeout: 5000,
}

const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com',
  '10minutemail.net',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'guerrillamail.org',
  'guerrillamail.net',
  'sharklasers.com',
  'mailinator.com',
  'mailinator.net',
  'throwaway.email',
  'throwawaymail.com',
  'fakeinbox.com',
  'getnada.com',
  'tempail.com',
  'dispostable.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'mytrashmail.com',
  'trash-mail.com',
  'trashmail.com',
  'trashmail.me',
  'trashmail.net',
  'wegwerfmail.de',
  'wegwerfmail.net',
  'spamgourmet.com',
  'mailnesia.com',
  'maildrop.cc',
  'mailsac.com',
  'mohmal.com',
  'tempinbox.com',
  'tempr.email',
  'discard.email',
  'discardmail.com',
  'spambox.us',
  'getairmail.com',
  'mailcatch.com',
  'mailexpire.com',
  'mailmoat.com',
  'mailnull.com',
  'mintemail.com',
  'nowmymail.com',
  'pookmail.com',
  'spamfree24.org',
  'emailondeck.com',
  'emailfake.com',
  'crazymailing.com',
  'tempsky.com',
  'burnermail.io',
  'inboxalias.com',
  'anonymbox.com',
  'fakemailgenerator.com',
  'grr.la',
  'guerrillamail.info',
  'pokemail.net',
  'spam4.me',
  'cool.fr.nf',
  'jetable.fr.nf',
  'mt2009.com',
  'trashemail.de',
  'spamgourmet.net',
  'spamgourmet.org',
  'spamfree24.de',
  'spamfree24.eu',
  'spamfree24.info',
  'spamfree24.net',
  'filzmail.com',
  'mailscrap.com',
  'mailshell.com',
  'mailsiphon.com',
  'mailslite.com',
  'mailzilla.com',
  'mailzilla.org',
  'mytempemail.com',
  'nobulk.com',
  'nospam.ze.tc',
  'nospamfor.us',
  'objectmail.com',
  'obobbo.com',
  'onewaymail.com',
  'owlpic.com',
  'proxymail.eu',
  'rcpt.at',
  'rejectmail.com',
  'rtrtr.com',
  's0ny.net',
  'safe-mail.net',
  'safetymail.info',
  'safetypost.de',
  'sandelf.de',
  'saynotospams.com',
  'selfdestructingmail.com',
  'sendspamhere.com',
  'shiftmail.com',
  'shortmail.net',
  'shut.name',
  'shut.ws',
  'sibmail.com',
  'sinnlos-mail.de',
  'siteposter.net',
  'skeefmail.com',
  'slaskpost.se',
  'slopsbox.com',
  'smellfear.com',
  'snakemail.com',
  'sneakemail.com',
  'snkmail.com',
  'sofimail.com',
  'sofort-mail.de',
  'sogetthis.com',
  'soodonims.com',
  'spam.la',
  'spam.su',
  'spamavert.com',
  'spambob.com',
  'spambob.net',
  'spambob.org',
  'spambog.com',
  'spambog.de',
  'spambog.net',
  'spambog.ru',
  'spambox.info',
  'spamcannon.com',
  'spamcannon.net',
  'spamcero.com',
  'spamcon.org',
  'spamcorptastic.com',
  'spamcowboy.com',
  'spamcowboy.net',
  'spamcowboy.org',
  'spamday.com',
  'spamex.com',
  'spamfree.eu',
  'spamhole.com',
  'spamify.com',
  'spaminator.de',
  'spamkill.info',
  'spaml.com',
  'spaml.de',
  'spammotel.com',
  'spamobox.com',
  'spamoff.de',
  'spamsalad.in',
  'spamslicer.com',
  'spamspot.com',
  'spamstack.net',
  'spamthis.co.uk',
  'spamthisplease.com',
  'spamtrail.com',
  'spamtroll.net',
  'spoofmail.de',
  'squizzy.de',
  'ssoia.com',
  'startkeys.com',
  'stinkefinger.net',
  'streetwisemail.com',
  'stuffmail.de',
  'supergreatmail.com',
  'supermailer.jp',
  'superrito.com',
  'superstachel.de',
  'suremail.info',
  'tafmail.com',
  'taglead.com',
  'tagmymedia.com',
  'tagyourself.com',
  'talkinator.com',
  'techemail.com',
  'techgroup.me',
  'teewars.org',
  'temp.emeraldwebmail.com',
  'tempail.com',
  'tempalias.com',
  'tempe-mail.com',
  'tempemail.biz',
  'tempemail.com',
  'tempemail.net',
  'tempinbox.co.uk',
  'tempmail.co',
  'tempmail.de',
  'tempmail.eu',
  'tempmail.it',
  'tempmail.net',
  'tempmail.us',
  'tempmail2.com',
  'tempmaildemo.com',
  'tempmailer.com',
  'tempmailer.de',
  'tempomail.fr',
  'temporarily.de',
  'temporarioemail.com.br',
  'temporaryemail.net',
  'temporaryemail.us',
  'temporaryforwarding.com',
  'temporaryinbox.com',
  'temporarymailaddress.com',
  'tempthe.net',
  'thisisnotmyrealemail.com',
  'thismail.net',
  'thismail.ru',
  'throam.com',
  'throwam.com',
  'throwawayemailaddress.com',
  'tilien.com',
  'tittbit.in',
  'tmailinator.com',
  'toiea.com',
  'tokenmail.de',
  'tonymanso.com',
  'toomail.biz',
  'topranklist.de',
  'tradermail.info',
  'trash-amil.com',
  'trash-mail.at',
  'trash-mail.cf',
  'trash-mail.de',
  'trash-mail.ga',
  'trash-mail.gq',
  'trash-mail.ml',
  'trash-mail.tk',
  'trash2009.com',
  'trash2010.com',
  'trash2011.com',
  'trashbox.eu',
  'trashdevil.com',
  'trashdevil.de',
  'trashmail.at',
  'trashmail.io',
  'trashmail.org',
  'trashmail.ws',
  'trashmailer.com',
  'trashymail.com',
  'trashymail.net',
])

const ROLE_PREFIXES = new Set([
  'admin',
  'administrator',
  'webmaster',
  'hostmaster',
  'postmaster',
  'root',
  'abuse',
  'noc',
  'security',
  'support',
  'sales',
  'marketing',
  'info',
  'contact',
  'help',
  'helpdesk',
  'billing',
  'accounts',
  'hr',
  'jobs',
  'careers',
  'recruitment',
  'press',
  'media',
  'pr',
  'legal',
  'compliance',
  'privacy',
  'gdpr',
  'dpo',
  'feedback',
  'suggestions',
  'complaints',
  'orders',
  'returns',
  'refunds',
  'shipping',
  'delivery',
  'tracking',
  'newsletter',
  'subscribe',
  'unsubscribe',
  'noreply',
  'no-reply',
  'donotreply',
  'do-not-reply',
  'mailer-daemon',
  'daemon',
  'null',
  'devnull',
  'dev-null',
  'test',
  'testing',
  'demo',
  'example',
  'sample',
  'office',
  'reception',
  'enquiries',
  'inquiries',
  'general',
  'team',
  'staff',
  'all',
  'everyone',
  'company',
  'corporate',
  'business',
  'partners',
  'affiliates',
  'vendors',
  'suppliers',
  'investors',
  'shareholders',
  'board',
  'management',
  'ceo',
  'cto',
  'cfo',
  'coo',
  'cio',
  'ciso',
  'founder',
  'founders',
  'owner',
  'owners',
])

const DOMAIN_TYPOS: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmil.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'gmail.om': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gimail.com': 'gmail.com',
  'gemail.com': 'gmail.com',
  'hmail.com': 'gmail.com',
  'fmail.com': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yhoo.com': 'yahoo.com',
  'yhaoo.com': 'yahoo.com',
  'yaoo.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'yahoo.cm': 'yahoo.com',
  'yahoo.om': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'hotmal.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmil.com': 'hotmail.com',
  'hotamil.com': 'hotmail.com',
  'hotmail.co': 'hotmail.com',
  'hotmail.cm': 'hotmail.com',
  'hotnail.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'outlool.com': 'outlook.com',
  'outlook.co': 'outlook.com',
  'outlook.cm': 'outlook.com',
  'outloook.com': 'outlook.com',
  'iclod.com': 'icloud.com',
  'icoud.com': 'icloud.com',
  'icloud.co': 'icloud.com',
  'icloud.cm': 'icloud.com',
  'protonmal.com': 'protonmail.com',
  'protonmai.com': 'protonmail.com',
  'protonmial.com': 'protonmail.com',
  'protonmail.co': 'protonmail.com',
}

const EMAIL_REGEX =
  /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i

function normalizeEmail(email: string): string {
  const trimmed = email.trim().toLowerCase()
  const parts = trimmed.split('@')
  const localPart = parts[0]
  const domain = parts[1]
  if (!localPart || !domain) return trimmed

  let normalizedLocal = localPart
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    normalizedLocal = localPart.replace(/\./g, '').split('+')[0] ?? localPart
  } else if (localPart.includes('+')) {
    normalizedLocal = localPart.split('+')[0] ?? localPart
  }

  const normalizedDomain = domain === 'googlemail.com' ? 'gmail.com' : domain
  return `${normalizedLocal}@${normalizedDomain}`
}

function validateSyntax(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  if (email.length < 5 || email.length > 254) return false
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return false
  if (localPart.length > 64) return false
  if (domain.length > 253) return false
  return EMAIL_REGEX.test(email)
}

function isDisposableDomain(domain: string): boolean {
  return DISPOSABLE_DOMAINS.has(domain.toLowerCase())
}

function isRoleAccount(localPart: string): boolean {
  const normalized =
    localPart.toLowerCase().split('+')[0] ?? localPart.toLowerCase()
  return ROLE_PREFIXES.has(normalized)
}

function checkTypo(domain: string): string | null {
  const lowerDomain = domain.toLowerCase()
  return DOMAIN_TYPOS[lowerDomain] || null
}

async function checkMxRecords(
  domain: string,
  timeout: number,
): Promise<boolean> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), timeout)
    resolveMx(domain)
      .then((records) => {
        clearTimeout(timer)
        resolve(records && records.length > 0)
      })
      .catch(() => {
        clearTimeout(timer)
        resolve(false)
      })
  })
}

function calculateRiskScore(checks: EmailValidationResult['checks']): number {
  let score = 0
  if (!checks.syntax) score += 100
  if (!checks.domain) score += 50
  if (!checks.mx) score += 30
  if (!checks.disposable) score += 80
  if (!checks.roleAccount) score += 20
  if (!checks.typo) score += 10
  return Math.min(score, 100)
}

function getRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score >= 50) return 'high'
  if (score >= 20) return 'medium'
  return 'low'
}

export async function validateEmail(
  email: string,
  options: EmailValidationOptions = {},
): Promise<EmailValidationResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const errors: string[] = []
  const warnings: string[] = []

  const normalized = normalizeEmail(email)
  const parts = normalized.split('@')
  const localPart = parts[0] ?? ''
  const domain = parts[1] ?? ''

  const checks = {
    syntax: true,
    domain: true,
    mx: true,
    disposable: true,
    roleAccount: true,
    typo: true,
  }

  let suggestion: string | undefined

  if (!validateSyntax(email)) {
    checks.syntax = false
    errors.push('Invalid email format')
  }

  if (checks.syntax && domain) {
    if (opts.checkDisposable && isDisposableDomain(domain)) {
      checks.disposable = false
      errors.push('Disposable email addresses are not allowed')
    }

    if (opts.checkRoleAccount && localPart && isRoleAccount(localPart)) {
      checks.roleAccount = false
      warnings.push('Role-based email addresses may have delivery issues')
    }

    if (opts.checkTypo) {
      const correctedDomain = checkTypo(domain)
      if (correctedDomain) {
        checks.typo = false
        suggestion = `${localPart}@${correctedDomain}`
        warnings.push(`Did you mean ${suggestion}?`)
      }
    }

    if (opts.checkMx) {
      const hasMx = await checkMxRecords(domain, opts.timeout ?? 5000)
      if (!hasMx) {
        checks.mx = false
        checks.domain = false
        errors.push('Domain cannot receive emails (no MX records)')
      }
    }
  }

  const riskScore = calculateRiskScore(checks)
  const risk = getRiskLevel(riskScore)
  const valid = errors.length === 0

  return {
    valid,
    email,
    normalized,
    checks,
    risk,
    riskScore,
    suggestion,
    errors,
    warnings,
  }
}

export function isValidEmailFormat(email: string): boolean {
  return validateSyntax(email)
}

export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]
  return domain ? isDisposableDomain(domain) : false
}

export function getEmailSuggestion(email: string): string | null {
  const domain = email.split('@')[1]
  if (!domain) return null
  const corrected = checkTypo(domain)
  if (corrected) {
    const localPart = email.split('@')[0]
    return `${localPart}@${corrected}`
  }
  return null
}

export { DISPOSABLE_DOMAINS, ROLE_PREFIXES, DOMAIN_TYPOS }
