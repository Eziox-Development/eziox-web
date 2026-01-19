import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Fragment } from 'react'
import {
  Cookie, Shield, Settings, Eye, Clock, Globe,
  Mail, ChevronRight, CheckCircle, Info,
} from 'lucide-react'

function renderContent(text: string) {
  const parts: React.ReactNode[] = []
  const lines = text.split('\n')
  
  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) parts.push(<br key={`br-${lineIndex}`} />)
    
    let remaining = line
    let partIndex = 0
    
    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/)
      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/)
      const bulletMatch = remaining.match(/^• /)
      
      if (bulletMatch && remaining.startsWith('• ')) {
        parts.push(<span key={`bullet-${lineIndex}-${partIndex}`} className="text-amber-400">• </span>)
        remaining = remaining.slice(2)
        partIndex++
        continue
      }
      
      let nextMatch: { index: number; type: 'bold' | 'link'; length: number } | null = null
      
      if (boldMatch?.index !== undefined) {
        nextMatch = { index: boldMatch.index, type: 'bold', length: boldMatch[0].length }
      }
      if (linkMatch?.index !== undefined && (!nextMatch || linkMatch.index < nextMatch.index)) {
        nextMatch = { index: linkMatch.index, type: 'link', length: linkMatch[0].length }
      }
      
      if (!nextMatch) {
        parts.push(<Fragment key={`text-${lineIndex}-${partIndex}`}>{remaining}</Fragment>)
        break
      }
      
      if (nextMatch.index > 0) {
        parts.push(<Fragment key={`pre-${lineIndex}-${partIndex}`}>{remaining.slice(0, nextMatch.index)}</Fragment>)
        partIndex++
      }
      
      if (nextMatch.type === 'bold' && boldMatch) {
        parts.push(
          <strong key={`bold-${lineIndex}-${partIndex}`} style={{ color: 'var(--foreground)' }}>
            {boldMatch[1]}
          </strong>
        )
      } else if (nextMatch.type === 'link' && linkMatch) {
        parts.push(
          <Link
            key={`link-${lineIndex}-${partIndex}`}
            to={linkMatch[2] as '/'}
            className="underline hover:no-underline"
            style={{ color: '#f59e0b' }}
          >
            {linkMatch[1]}
          </Link>
        )
      }
      
      remaining = remaining.slice(nextMatch.index + nextMatch.length)
      partIndex++
    }
  })
  
  return parts
}

export const Route = createFileRoute('/_public/cookies')({
  head: () => ({
    meta: [
      { title: 'Cookie Policy | Eziox' },
      { name: 'description', content: 'Cookie Policy for Eziox - Learn about how we use cookies and similar technologies.' },
    ],
  }),
  component: CookiesPage,
})

const LAST_UPDATED = 'January 19, 2026'

const COOKIE_TYPES = [
  {
    name: 'Essential Cookies',
    icon: Shield,
    color: '#10b981',
    required: true,
    description: 'These cookies are necessary for the website to function and cannot be disabled.',
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
    description: 'These cookies enable personalized features and remember your preferences.',
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
    description: 'These cookies help us understand how visitors interact with our website.',
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

const SECTIONS = [
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

For general privacy inquiries, please see our Privacy Policy.`,
  },
]

function CookiesPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4" style={{ background: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <Cookie size={16} style={{ color: '#f59e0b' }} />
            <span className="text-sm font-medium" style={{ color: '#f59e0b' }}>Cookie Policy</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Cookie Policy
          </h1>
          <p className="text-lg mb-4" style={{ color: 'var(--foreground-muted)' }}>
            Learn how we use cookies and similar technologies on our platform.
          </p>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Last Updated: {LAST_UPDATED}
          </p>
        </motion.div>

        {/* Cookie Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>Cookies We Use</h2>
          <div className="space-y-6">
            {COOKIE_TYPES.map((type, index) => (
              <motion.div
                key={type.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                className="p-6 rounded-3xl"
                style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${type.color}20` }}>
                      <type.icon size={20} style={{ color: type.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold" style={{ color: 'var(--foreground)' }}>{type.name}</h3>
                      <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{type.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {type.required ? (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <CheckCircle size={12} />
                        Required
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }}>
                        <Info size={12} />
                        Optional
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <th className="text-left py-2 px-3 font-medium" style={{ color: 'var(--foreground-muted)' }}>Cookie Name</th>
                        <th className="text-left py-2 px-3 font-medium" style={{ color: 'var(--foreground-muted)' }}>Purpose</th>
                        <th className="text-left py-2 px-3 font-medium" style={{ color: 'var(--foreground-muted)' }}>Duration</th>
                        <th className="text-left py-2 px-3 font-medium" style={{ color: 'var(--foreground-muted)' }}>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {type.cookies.map((cookie) => (
                        <tr key={cookie.name} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                          <td className="py-2 px-3 font-mono text-xs" style={{ color: type.color }}>{cookie.name}</td>
                          <td className="py-2 px-3" style={{ color: 'var(--foreground)' }}>{cookie.purpose}</td>
                          <td className="py-2 px-3" style={{ color: 'var(--foreground-muted)' }}>{cookie.duration}</td>
                          <td className="py-2 px-3" style={{ color: 'var(--foreground-muted)' }}>{cookie.type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Detailed Sections */}
        <div className="space-y-8">
          {SECTIONS.map((section, index) => (
            <motion.section
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="p-6 rounded-3xl scroll-mt-24"
              style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                  <section.icon size={20} style={{ color: '#f59e0b' }} />
                </div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{section.title}</h2>
              </div>
              <div 
                className="prose prose-invert max-w-none text-sm leading-relaxed space-y-3"
                style={{ color: 'var(--foreground-muted)' }}
              >
                {section.content.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{renderContent(paragraph)}</p>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Related Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 rounded-3xl"
          style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Related Policies</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Privacy Policy', href: '/privacy', icon: Shield },
              { title: 'Terms of Service', href: '/terms', icon: CheckCircle },
              { title: 'About Us', href: '/about', icon: Globe },
            ].map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center justify-between p-4 rounded-xl transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}
              >
                <div className="flex items-center gap-3">
                  <link.icon size={18} style={{ color: '#f59e0b' }} />
                  <span style={{ color: 'var(--foreground)' }}>{link.title}</span>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--foreground-muted)' }} />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
