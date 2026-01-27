import { createFileRoute, Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useTheme } from '@/components/layout/ThemeProvider'
import {
  Code2,
  Key,
  Shield,
  Zap,
  CheckCircle,
  AlertCircle,
  Copy,
  ChevronDown,
  ExternalLink,
  Sparkles,
  Lock,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_public/api-docs')({
  component: ApiDocsPage,
  head: () => ({
    meta: [
      { title: 'API Documentation | Eziox' },
      {
        name: 'description',
        content:
          'Complete API documentation for Eziox. Learn how to integrate with our platform.',
      },
      { property: 'og:title', content: 'API Documentation | Eziox' },
      {
        property: 'og:description',
        content: 'Complete API documentation for Eziox platform integration.',
      },
    ],
  }),
})

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/v1/profile/:username',
    description: 'Get public profile information for any user',
    auth: false,
    params: [
      { name: 'username', type: 'string', description: 'Username to fetch' },
    ],
    response: `{
  "id": "uuid",
  "username": "string",
  "name": "string",
  "bio": "string",
  "avatar": "string",
  "banner": "string",
  "socials": {},
  "links": []
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/profile/me',
    description: 'Get your authenticated profile with full details',
    auth: true,
    params: [],
    response: `{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "tier": "string",
  "profile": {},
  "stats": {}
}`,
  },
  {
    method: 'PATCH',
    path: '/api/v1/profile/me',
    description: 'Update your profile information',
    auth: true,
    params: [],
    body: `{
  "name": "string",
  "bio": "string",
  "website": "string",
  "location": "string"
}`,
    response: `{
  "success": true,
  "profile": {}
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/links',
    description: 'Get all your bio links',
    auth: true,
    params: [],
    response: `{
  "links": [
    {
      "id": "uuid",
      "title": "string",
      "url": "string",
      "clicks": 0,
      "isActive": true
    }
  ]
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/links',
    description: 'Create a new bio link',
    auth: true,
    params: [],
    body: `{
  "title": "string",
  "url": "string",
  "description": "string",
  "icon": "string"
}`,
    response: `{
  "success": true,
  "link": {}
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/analytics',
    description: 'Get your profile and link analytics',
    auth: true,
    params: [
      {
        name: 'days',
        type: 'number',
        description: 'Number of days (default: 30)',
      },
    ],
    response: `{
  "profileViews": 0,
  "linkClicks": 0,
  "topLinks": [],
  "dailyStats": []
}`,
  },
]

const RATE_LIMITS = [
  { tier: 'Free', limit: '1,000', window: 'per hour', color: '#6b7280' },
  { tier: 'Pro', limit: '5,000', window: 'per hour', color: '#3b82f6' },
  { tier: 'Creator', limit: '10,000', window: 'per hour', color: '#f59e0b' },
  { tier: 'Lifetime', limit: '10,000', window: 'per hour', color: '#ec4899' },
]

const ERROR_CODES = [
  {
    code: '400',
    message: 'Bad Request - Invalid parameters',
    color: '#f59e0b',
  },
  {
    code: '401',
    message: 'Unauthorized - Invalid or missing API key',
    color: '#ef4444',
  },
  {
    code: '403',
    message: 'Forbidden - Insufficient permissions',
    color: '#ef4444',
  },
  {
    code: '404',
    message: 'Not Found - Resource does not exist',
    color: '#6b7280',
  },
  {
    code: '429',
    message: 'Too Many Requests - Rate limit exceeded',
    color: '#f59e0b',
  },
  {
    code: '500',
    message: 'Internal Server Error - Something went wrong',
    color: '#ef4444',
  },
]

function ApiDocsPage() {
  const { theme } = useTheme()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const cardRadius =
    theme.effects.borderRadius === 'pill'
      ? '24px'
      : theme.effects.borderRadius === 'sharp'
        ? '8px'
        : '16px'

  const glowOpacity =
    theme.effects.glowIntensity === 'strong'
      ? 0.5
      : theme.effects.glowIntensity === 'medium'
        ? 0.35
        : theme.effects.glowIntensity === 'subtle'
          ? 0.2
          : 0

  const copyToClipboard = (text: string, id: string) => {
    void navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: theme.colors.background }}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full blur-[200px]"
          style={{
            background: theme.colors.primary,
            opacity: glowOpacity * 0.3,
          }}
          animate={{ scale: [1, 1.2, 1], x: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-[500px] h-[500px] rounded-full blur-[180px]"
          style={{
            background: theme.colors.accent,
            opacity: glowOpacity * 0.25,
          }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
              border: `1px solid ${theme.colors.primary}30`,
            }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Code2 size={18} style={{ color: theme.colors.primary }} />
            </motion.div>
            <span
              className="text-sm font-medium"
              style={{ color: theme.colors.foreground }}
            >
              API Documentation
            </span>
            <Sparkles size={14} style={{ color: theme.colors.accent }} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
            style={{
              color: theme.colors.foreground,
              fontFamily: theme.typography.displayFont,
            }}
          >
            Build with{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
              }}
            >
              Eziox API
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg lg:text-xl max-w-2xl mx-auto mb-10"
            style={{ color: theme.colors.foregroundMuted }}
          >
            Integrate Eziox into your applications with our powerful REST API.
            Full access to profiles, links, and analytics.
          </motion.p>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {[
              {
                label: 'Endpoints',
                value: ENDPOINTS.length,
                icon: Code2,
                color: theme.colors.primary,
              },
              {
                label: 'Rate Limits',
                value: '1k-10k/hr',
                icon: Zap,
                color: '#f59e0b',
              },
              {
                label: 'Auth Methods',
                value: 'Bearer',
                icon: Key,
                color: '#22c55e',
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.05 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="px-6 py-4 text-center"
                style={{
                  background:
                    theme.effects.cardStyle === 'glass'
                      ? `${theme.colors.card}90`
                      : theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                  backdropFilter:
                    theme.effects.cardStyle === 'glass'
                      ? 'blur(20px)'
                      : undefined,
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon size={18} style={{ color: stat.color }} />
                  <span
                    className="text-2xl font-bold"
                    style={{ color: theme.colors.foreground }}
                  >
                    {stat.value}
                  </span>
                </div>
                <p
                  className="text-xs"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Quick Start */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <SectionCard
            title="Quick Start"
            icon={Zap}
            iconColor="#f59e0b"
            theme={theme}
            cardRadius={cardRadius}
          >
            <div className="space-y-6">
              <div>
                <h3
                  className="font-semibold mb-2 flex items-center gap-2"
                  style={{ color: theme.colors.foreground }}
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: theme.colors.primary, color: '#fff' }}
                  >
                    1
                  </span>
                  Get your API Key
                </h3>
                <p
                  className="text-sm mb-3"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  Navigate to your{' '}
                  <Link
                    to="/profile"
                    search={{ tab: 'api' }}
                    className="font-medium hover:underline"
                    style={{ color: theme.colors.primary }}
                  >
                    Profile Dashboard → API Access
                  </Link>{' '}
                  to create an API key.
                </p>
              </div>

              <div>
                <h3
                  className="font-semibold mb-3 flex items-center gap-2"
                  style={{ color: theme.colors.foreground }}
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: theme.colors.primary, color: '#fff' }}
                  >
                    2
                  </span>
                  Make your first request
                </h3>
                <CodeBlock
                  code={`curl -X GET https://api.eziox.link/v1/profile/me \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                  theme={theme}
                  cardRadius={cardRadius}
                  onCopy={() =>
                    copyToClipboard(
                      'curl -X GET https://api.eziox.link/v1/profile/me -H "Authorization: Bearer YOUR_API_KEY"',
                      'quick-start',
                    )
                  }
                  copied={copiedCode === 'quick-start'}
                />
              </div>
            </div>
          </SectionCard>
        </motion.section>

        {/* Authentication */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <SectionCard
            title="Authentication"
            icon={Key}
            iconColor={theme.colors.primary}
            theme={theme}
            cardRadius={cardRadius}
          >
            <p className="mb-4" style={{ color: theme.colors.foregroundMuted }}>
              All authenticated API requests require an API key. Include your
              key in the{' '}
              <code
                className="px-2 py-1 rounded text-sm font-mono"
                style={{
                  background: theme.colors.backgroundSecondary,
                  color: theme.colors.primary,
                }}
              >
                Authorization
              </code>{' '}
              header:
            </p>

            <CodeBlock
              code="Authorization: Bearer ezx_your_api_key_here"
              theme={theme}
              cardRadius={cardRadius}
              onCopy={() =>
                copyToClipboard('Authorization: Bearer YOUR_API_KEY', 'auth')
              }
              copied={copiedCode === 'auth'}
            />

            <motion.div
              className="mt-6 p-4 rounded-xl flex items-start gap-3"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}10, ${theme.colors.accent}05)`,
                border: `1px solid ${theme.colors.primary}30`,
              }}
            >
              <Shield
                size={20}
                style={{ color: theme.colors.primary }}
                className="mt-0.5 shrink-0"
              />
              <div>
                <p
                  className="font-semibold mb-1"
                  style={{ color: theme.colors.foreground }}
                >
                  Keep your API key secure
                </p>
                <p
                  className="text-sm"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  Never expose your API key in client-side code or public
                  repositories. Store it securely in environment variables.
                </p>
              </div>
            </motion.div>
          </SectionCard>
        </motion.section>

        {/* Rate Limits */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-12"
        >
          <SectionCard
            title="Rate Limits"
            icon={Clock}
            iconColor="#22c55e"
            theme={theme}
            cardRadius={cardRadius}
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {RATE_LIMITS.map((item, i) => (
                <motion.div
                  key={item.tier}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="p-4 text-center relative overflow-hidden"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    borderRadius: `calc(${cardRadius} - 6px)`,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ background: item.color }}
                  />
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: item.color }}
                  >
                    {item.tier}
                  </p>
                  <p
                    className="text-2xl font-bold mb-1"
                    style={{ color: theme.colors.foreground }}
                  >
                    {item.limit}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {item.window}
                  </p>
                </motion.div>
              ))}
            </div>
          </SectionCard>
        </motion.section>

        {/* Endpoints */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              className="p-3 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}15)`,
              }}
            >
              <TrendingUp size={24} style={{ color: theme.colors.primary }} />
            </motion.div>
            <h2
              className="text-2xl font-bold"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              API Endpoints
            </h2>
          </div>

          <div className="space-y-4">
            {ENDPOINTS.map((endpoint, index) => (
              <EndpointCard
                key={index}
                endpoint={endpoint}
                theme={theme}
                cardRadius={cardRadius}
                onCopy={copyToClipboard}
                copiedCode={copiedCode}
                index={index}
              />
            ))}
          </div>
        </motion.section>

        {/* Error Codes */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <SectionCard
            title="Error Codes"
            icon={AlertCircle}
            iconColor="#ef4444"
            theme={theme}
            cardRadius={cardRadius}
          >
            <div className="space-y-3">
              {ERROR_CODES.map((error, i) => (
                <motion.div
                  key={error.code}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-center gap-4 p-3"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    borderRadius: `calc(${cardRadius} - 6px)`,
                  }}
                >
                  <code
                    className="px-3 py-1.5 rounded-lg font-mono text-sm font-bold"
                    style={{
                      background: `${error.color}20`,
                      color: error.color,
                    }}
                  >
                    {error.code}
                  </code>
                  <span style={{ color: theme.colors.foreground }}>
                    {error.message}
                  </span>
                </motion.div>
              ))}
            </div>
          </SectionCard>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-16 text-center"
        >
          <Link to="/profile" search={{ tab: 'api' }}>
            <motion.button
              className="px-8 py-4 font-semibold text-lg inline-flex items-center gap-3"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                color: '#fff',
                borderRadius: cardRadius,
                boxShadow:
                  glowOpacity > 0
                    ? `0 8px 32px ${theme.colors.primary}40`
                    : undefined,
              }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Key size={20} />
              Get Your API Key
              <ExternalLink size={16} />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

interface SectionCardProps {
  title: string
  icon: React.ElementType
  iconColor: string
  theme: ReturnType<typeof useTheme>['theme']
  cardRadius: string
  children: React.ReactNode
}

function SectionCard({
  title,
  icon: Icon,
  iconColor,
  theme,
  cardRadius,
  children,
}: SectionCardProps) {
  return (
    <div
      className="p-6 relative overflow-hidden"
      style={{
        background:
          theme.effects.cardStyle === 'glass'
            ? `${theme.colors.card}90`
            : theme.colors.card,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: cardRadius,
        backdropFilter:
          theme.effects.cardStyle === 'glass' ? 'blur(20px)' : undefined,
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          className="p-3 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${iconColor}20, ${iconColor}10)`,
          }}
        >
          <Icon size={24} style={{ color: iconColor }} />
        </motion.div>
        <h2
          className="text-xl font-bold"
          style={{
            color: theme.colors.foreground,
            fontFamily: theme.typography.displayFont,
          }}
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}

interface CodeBlockProps {
  code: string
  theme: ReturnType<typeof useTheme>['theme']
  cardRadius: string
  onCopy: () => void
  copied: boolean
}

function CodeBlock({
  code,
  theme,
  cardRadius,
  onCopy,
  copied,
}: CodeBlockProps) {
  return (
    <div className="relative group">
      <pre
        className="p-4 overflow-x-auto text-sm font-mono"
        style={{
          background: theme.colors.backgroundSecondary,
          color: theme.colors.foreground,
          borderRadius: cardRadius,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <code>{code}</code>
      </pre>
      <motion.button
        onClick={onCopy}
        className="absolute top-3 right-3 p-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        style={{
          background: theme.colors.card,
          color: copied ? '#22c55e' : theme.colors.foreground,
          borderRadius: '8px',
          border: `1px solid ${theme.colors.border}`,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
      </motion.button>
    </div>
  )
}

interface EndpointParam {
  name: string
  type: string
  description: string
}

interface Endpoint {
  method: string
  path: string
  description: string
  auth: boolean
  params: EndpointParam[]
  body?: string
  response: string
}

interface EndpointCardProps {
  endpoint: Endpoint
  theme: ReturnType<typeof useTheme>['theme']
  cardRadius: string
  onCopy: (text: string, id: string) => void
  copiedCode: string | null
  index: number
}

function EndpointCard({
  endpoint,
  theme,
  cardRadius,
  onCopy,
  copiedCode,
  index,
}: EndpointCardProps) {
  const [expanded, setExpanded] = useState(false)

  const methodColors: Record<string, { bg: string; text: string }> = {
    GET: { bg: '#22c55e20', text: '#22c55e' },
    POST: { bg: '#3b82f620', text: '#3b82f6' },
    PATCH: { bg: '#f59e0b20', text: '#f59e0b' },
    PUT: { bg: '#8b5cf620', text: '#8b5cf6' },
    DELETE: { bg: '#ef444420', text: '#ef4444' },
  }

  const colors = methodColors[endpoint.method] || methodColors.GET

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="overflow-hidden"
      style={{
        background:
          theme.effects.cardStyle === 'glass'
            ? `${theme.colors.card}90`
            : theme.colors.card,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: cardRadius,
        backdropFilter:
          theme.effects.cardStyle === 'glass' ? 'blur(20px)' : undefined,
      }}
    >
      <motion.div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        whileHover={{ background: `${theme.colors.primary}05` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span
              className="px-3 py-1.5 rounded-lg text-xs font-bold shrink-0"
              style={{
                background: colors?.bg || '#22c55e20',
                color: colors?.text || '#22c55e',
              }}
            >
              {endpoint.method}
            </span>
            <code
              className="font-mono text-sm truncate"
              style={{ color: theme.colors.foreground }}
            >
              {endpoint.path}
            </code>
            {endpoint.auth && (
              <span
                className="px-2 py-1 rounded-lg text-xs flex items-center gap-1 shrink-0"
                style={{
                  background: `${theme.colors.primary}15`,
                  color: theme.colors.primary,
                }}
              >
                <Lock size={10} />
                Auth
              </span>
            )}
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ color: theme.colors.foregroundMuted }}
          >
            <ChevronDown size={18} />
          </motion.div>
        </div>

        <p
          className="text-sm mt-2"
          style={{ color: theme.colors.foregroundMuted }}
        >
          {endpoint.description}
        </p>
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t overflow-hidden"
            style={{ borderColor: theme.colors.border }}
          >
            <div className="p-4 space-y-4">
              {endpoint.params && endpoint.params.length > 0 && (
                <div>
                  <h4
                    className="font-semibold mb-3 text-sm"
                    style={{ color: theme.colors.foreground }}
                  >
                    Parameters
                  </h4>
                  <div className="space-y-2">
                    {endpoint.params.map((param) => (
                      <div
                        key={param.name}
                        className="p-3 text-sm flex items-center gap-3"
                        style={{
                          background: theme.colors.backgroundSecondary,
                          borderRadius: '8px',
                        }}
                      >
                        <code
                          className="font-mono font-medium"
                          style={{ color: theme.colors.primary }}
                        >
                          {param.name}
                        </code>
                        <span
                          className="text-xs px-2 py-0.5 rounded"
                          style={{
                            background: theme.colors.card,
                            color: theme.colors.foregroundMuted,
                          }}
                        >
                          {param.type}
                        </span>
                        <span style={{ color: theme.colors.foregroundMuted }}>
                          {param.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {endpoint.body && (
                <div>
                  <h4
                    className="font-semibold mb-3 text-sm"
                    style={{ color: theme.colors.foreground }}
                  >
                    Request Body
                  </h4>
                  <CodeBlock
                    code={endpoint.body}
                    theme={theme}
                    cardRadius={`calc(${cardRadius} - 8px)`}
                    onCopy={() =>
                      onCopy(endpoint.body!, `body-${endpoint.path}`)
                    }
                    copied={copiedCode === `body-${endpoint.path}`}
                  />
                </div>
              )}

              <div>
                <h4
                  className="font-semibold mb-3 text-sm"
                  style={{ color: theme.colors.foreground }}
                >
                  Response
                </h4>
                <CodeBlock
                  code={endpoint.response}
                  theme={theme}
                  cardRadius={`calc(${cardRadius} - 8px)`}
                  onCopy={() =>
                    onCopy(endpoint.response, `response-${endpoint.path}`)
                  }
                  copied={copiedCode === `response-${endpoint.path}`}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
