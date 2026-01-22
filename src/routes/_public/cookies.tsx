import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import {
  Cookie,
  Shield,
  Settings,
  Eye,
  Clock,
  Globe,
  Mail,
  CheckCircle,
  Info,
  FileText,
} from 'lucide-react'
import {
  LegalPageLayout,
  CookieTable,
  type LegalSection,
  type RelatedLink,
} from '@/components/legal/LegalPageLayout'
import { useTheme } from '@/components/layout/ThemeProvider'

export const Route = createFileRoute('/_public/cookies')({
  head: () => ({
    meta: [
      { title: 'Cookie Policy | Eziox' },
      {
        name: 'description',
        content:
          'Cookie Policy for Eziox - Learn about how we use cookies and similar technologies.',
      },
    ],
  }),
  component: CookiesPage,
})

const LAST_UPDATED = 'January 21, 2026'
const ACCENT_COLOR = '#f59e0b'

const COOKIE_TYPES = [
  {
    name: 'Essential Cookies',
    icon: Shield,
    color: '#10b981',
    required: true,
    description:
      'These cookies are necessary for the website to function and cannot be disabled.',
    cookies: [
      {
        name: 'session-token',
        purpose: 'Maintains your login session',
        duration: '7 days',
        type: 'HTTP Cookie',
      },
      {
        name: 'cf_clearance',
        purpose: 'Cloudflare Turnstile bot protection',
        duration: '30 minutes',
        type: 'HTTP Cookie',
      },
    ],
  },
  {
    name: 'Functional Cookies',
    icon: Settings,
    color: '#3b82f6',
    required: false,
    description:
      'These cookies enable personalized features and remember your preferences.',
    cookies: [
      {
        name: 'theme',
        purpose: 'Stores your preferred color theme',
        duration: 'Persistent',
        type: 'Local Storage',
      },
      {
        name: 'sidebar-collapsed',
        purpose: 'Remembers sidebar state',
        duration: 'Persistent',
        type: 'Local Storage',
      },
    ],
  },
  {
    name: 'Analytics Cookies',
    icon: Eye,
    color: '#8b5cf6',
    required: false,
    description:
      'These cookies help us understand how visitors interact with our website.',
    cookies: [
      {
        name: 'Internal Analytics',
        purpose: 'Anonymized page view tracking',
        duration: 'Session',
        type: 'Server-side',
      },
    ],
  },
]

const SECTIONS: LegalSection[] = [
  {
    id: 'what-are-cookies',
    title: 'What Are Cookies?',
    icon: Cookie,
    content: `Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.

**Types of Storage We Use:**
• **Cookies:** Small text files stored in your browser
• **Local Storage:** Data stored locally in your browser
• **Session Storage:** Temporary data cleared when you close your browser

Cookies can be "first-party" (set by us) or "third-party" (set by other services). We primarily use first-party cookies.`,
  },
  {
    id: 'how-we-use',
    title: 'How We Use Cookies',
    icon: Settings,
    content: `We use cookies for the following purposes:

**Authentication:**
• Keep you logged in across sessions
• Secure your account with HTTP-only cookies
• Validate your session on each request

**Preferences:**
• Remember your theme preference (dark/light mode)
• Store UI settings like sidebar state
• Personalize your experience

**Analytics:**
• Count page views and unique visitors
• Understand which features are most used
• Improve our service based on usage patterns

**We do NOT use cookies for:**
• Advertising or ad targeting
• Cross-site tracking
• Selling data to third parties`,
  },
  {
    id: 'your-choices',
    title: 'Your Cookie Choices',
    icon: CheckCircle,
    content: `You have control over cookies:

**Browser Settings:**
• Most browsers allow you to block or delete cookies
• You can set your browser to notify you when cookies are set
• Private/Incognito mode limits cookie storage

**Our Settings:**
• Essential cookies cannot be disabled (required for login)
• Functional cookies can be cleared by resetting preferences
• We don't use third-party tracking cookies

**Consequences of Disabling Cookies:**
• You won't be able to stay logged in
• Your preferences won't be saved
• Some features may not work properly

**How to Manage Cookies:**
• Chrome: Settings → Privacy and Security → Cookies
• Firefox: Settings → Privacy & Security → Cookies
• Safari: Preferences → Privacy → Cookies
• Edge: Settings → Cookies and Site Permissions`,
  },
  {
    id: 'third-party',
    title: 'Third-Party Services',
    icon: Globe,
    content: `We use minimal third-party services:

**Hosting (Vercel/Netlify):**
• May set performance-related cookies
• Subject to their own privacy policies

**Database (Neon):**
• No client-side cookies
• Data processed server-side only

**CDN Services:**
• May use cookies for load balancing
• Essential for website performance

**We do NOT use:**
• Google Analytics
• Facebook Pixel
• Any advertising networks
• Social media tracking pixels

We are committed to minimizing third-party tracking on our platform.`,
  },
  {
    id: 'data-security',
    title: 'Cookie Security',
    icon: Shield,
    content: `We implement security measures for our cookies:

**HTTP-Only Cookies:**
• Session cookies cannot be accessed by JavaScript
• Protects against XSS (Cross-Site Scripting) attacks

**Secure Flag:**
• Cookies are only sent over HTTPS in production
• Prevents interception on insecure connections

**SameSite Attribute:**
• Set to "Lax" to prevent CSRF attacks
• Cookies not sent with cross-site requests

**Expiration:**
• Session cookies expire after 7 days
• Automatic cleanup of expired sessions`,
  },
  {
    id: 'updates',
    title: 'Policy Updates',
    icon: Clock,
    content: `We may update this Cookie Policy from time to time:

• Changes will be reflected in the "Last Updated" date
• Significant changes will be announced via email or in-app notification
• Continued use of the Service after changes constitutes acceptance

We encourage you to review this policy periodically.`,
  },
  {
    id: 'contact',
    title: 'Contact Us',
    icon: Mail,
    content: `If you have questions about our use of cookies:

**Email:** privacy@eziox.link
**Website:** https://eziox.link/about

For general privacy inquiries, please see our [Privacy Policy](/privacy).`,
  },
]

const RELATED_LINKS: RelatedLink[] = [
  { title: 'Privacy Policy', href: '/privacy', icon: Shield },
  { title: 'Terms of Service', href: '/terms', icon: FileText },
  { title: 'About Us', href: '/about', icon: Globe },
]

function CookiesPage() {
  const { theme } = useTheme()
  const cardRadius =
    theme.effects.borderRadius === 'pill'
      ? '24px'
      : theme.effects.borderRadius === 'sharp'
        ? '8px'
        : '16px'

  return (
    <LegalPageLayout
      title="Cookie Policy"
      subtitle="Learn how we use cookies and similar technologies on our platform."
      badge="Cookie Policy"
      badgeIcon={Cookie}
      accentColor={ACCENT_COLOR}
      lastUpdated={LAST_UPDATED}
      sections={SECTIONS}
      relatedLinks={RELATED_LINKS}
    >
      {/* Cookie Overview - Custom Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2
          className="text-2xl font-bold mb-6"
          style={{
            color: theme.colors.foreground,
            fontFamily: theme.typography.displayFont,
          }}
        >
          Cookies We Use
        </h2>
        <div className="space-y-5">
          {COOKIE_TYPES.map((type, index) => (
            <motion.div
              key={type.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              className="p-5"
              style={{
                background:
                  theme.effects.cardStyle === 'glass'
                    ? `${theme.colors.card}80`
                    : theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: cardRadius,
                backdropFilter:
                  theme.effects.cardStyle === 'glass'
                    ? 'blur(10px)'
                    : undefined,
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 flex items-center justify-center"
                    style={{
                      background: `${type.color}20`,
                      borderRadius: '12px',
                    }}
                  >
                    <type.icon size={22} style={{ color: type.color }} />
                  </div>
                  <div>
                    <h3
                      className="font-bold"
                      style={{ color: theme.colors.foreground }}
                    >
                      {type.name}
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {type.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {type.required ? (
                    <span
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
                      style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        borderRadius: '8px',
                      }}
                    >
                      <CheckCircle size={12} />
                      Required
                    </span>
                  ) : (
                    <span
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
                      style={{
                        background: theme.colors.backgroundSecondary,
                        color: theme.colors.foregroundMuted,
                        borderRadius: '8px',
                      }}
                    >
                      <Info size={12} />
                      Optional
                    </span>
                  )}
                </div>
              </div>

              <CookieTable cookies={type.cookies} accentColor={type.color} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </LegalPageLayout>
  )
}
