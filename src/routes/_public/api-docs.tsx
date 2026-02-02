import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/layout/ThemeProvider'
import {
  Code2,
  Key,
  Shield,
  Zap,
  CheckCircle,
  Copy,
  ChevronRight,
  Terminal,
  Lock,
  Rocket,
  ArrowRight,
  BookOpen,
  Layers,
  BarChart3,
  Link2,
  User,
  AlertTriangle,
} from 'lucide-react'
import { SiTypescript, SiPython, SiGo } from 'react-icons/si'

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
    ],
  }),
})

export function ApiDocsPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('profile')

  const cardRadius = useMemo(
    () =>
      theme.effects.borderRadius === 'pill'
        ? '20px'
        : theme.effects.borderRadius === 'sharp'
          ? '8px'
          : '16px',
    [theme.effects.borderRadius],
  )

  const glowOpacity = useMemo(
    () =>
      theme.effects.glowIntensity === 'strong'
        ? 0.4
        : theme.effects.glowIntensity === 'medium'
          ? 0.25
          : theme.effects.glowIntensity === 'subtle'
            ? 0.15
            : 0,
    [theme.effects.glowIntensity],
  )

  const copyToClipboard = useCallback((text: string, id: string) => {
    void navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  const endpoints = useMemo(
    () => ({
      profile: [
        {
          method: 'GET',
          path: '/v1/profile/:username',
          title: t('apiDocs.endpoints.profile.getPublic.title'),
          description: t('apiDocs.endpoints.profile.getPublic.description'),
          auth: false,
          response: `{
  "username": "string",
  "name": "string",
  "bio": "string",
  "avatar": "string",
  "links": [...]
}`,
        },
        {
          method: 'GET',
          path: '/v1/profile/me',
          title: t('apiDocs.endpoints.profile.getMe.title'),
          description: t('apiDocs.endpoints.profile.getMe.description'),
          auth: true,
          response: `{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "tier": "free|pro|creator",
  "profile": {...},
  "stats": {...}
}`,
        },
        {
          method: 'PATCH',
          path: '/v1/profile/me',
          title: t('apiDocs.endpoints.profile.update.title'),
          description: t('apiDocs.endpoints.profile.update.description'),
          auth: true,
          body: `{
  "name": "string",
  "bio": "string",
  "location": "string"
}`,
          response: `{
  "success": true,
  "profile": {...}
}`,
        },
      ],
      links: [
        {
          method: 'GET',
          path: '/v1/links',
          title: t('apiDocs.endpoints.links.getAll.title'),
          description: t('apiDocs.endpoints.links.getAll.description'),
          auth: true,
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
          path: '/v1/links',
          title: t('apiDocs.endpoints.links.create.title'),
          description: t('apiDocs.endpoints.links.create.description'),
          auth: true,
          body: `{
  "title": "string",
  "url": "string",
  "icon": "string"
}`,
          response: `{
  "success": true,
  "link": {...}
}`,
        },
        {
          method: 'PATCH',
          path: '/v1/links/:id',
          title: t('apiDocs.endpoints.links.update.title'),
          description: t('apiDocs.endpoints.links.update.description'),
          auth: true,
          body: `{
  "title": "string",
  "url": "string"
}`,
          response: `{
  "success": true,
  "link": {...}
}`,
        },
        {
          method: 'DELETE',
          path: '/v1/links/:id',
          title: t('apiDocs.endpoints.links.delete.title'),
          description: t('apiDocs.endpoints.links.delete.description'),
          auth: true,
          response: `{
  "success": true
}`,
        },
      ],
      analytics: [
        {
          method: 'GET',
          path: '/v1/analytics',
          title: t('apiDocs.endpoints.analytics.get.title'),
          description: t('apiDocs.endpoints.analytics.get.description'),
          auth: true,
          params: [{ name: 'days', type: 'number', optional: true }],
          response: `{
  "profileViews": 0,
  "linkClicks": 0,
  "topLinks": [...],
  "dailyStats": [...]
}`,
        },
      ],
    }),
    [t],
  )

  const rateLimits = useMemo(
    () => [
      { tier: 'Free', limit: '1,000', color: '#6b7280' },
      { tier: 'Pro', limit: '5,000', color: theme.colors.primary },
      { tier: 'Creator', limit: '10,000', color: '#f59e0b' },
    ],
    [theme.colors.primary],
  )

  const errorCodes = useMemo(
    () => [
      { code: '400', color: '#f59e0b' },
      { code: '401', color: '#ef4444' },
      { code: '403', color: '#ef4444' },
      { code: '404', color: '#6b7280' },
      { code: '429', color: '#f59e0b' },
      { code: '500', color: '#ef4444' },
    ],
    [],
  )

  const sectionIcons = useMemo(
    () => ({
      profile: User,
      links: Link2,
      analytics: BarChart3,
    }),
    [],
  )

  return (
    <div
      className="min-h-screen"
      style={{
        background: theme.colors.background,
        fontFamily: theme.typography.bodyFont,
      }}
    >
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[200px]"
          style={{
            background: theme.colors.primary,
            opacity: glowOpacity * 0.2,
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[150px]"
          style={{
            background: theme.colors.accent,
            opacity: glowOpacity * 0.15,
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-24">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: `${theme.colors.primary}15`,
              border: `1px solid ${theme.colors.primary}30`,
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Terminal size={16} style={{ color: theme.colors.primary }} />
            <span
              className="text-sm font-medium"
              style={{ color: theme.colors.foreground }}
            >
              {t('apiDocs.badge')}
            </span>
          </motion.div>

          <h1
            className="text-4xl md:text-6xl font-bold mb-6"
            style={{
              color: theme.colors.foreground,
              fontFamily: theme.typography.displayFont,
            }}
          >
            {t('apiDocs.hero.title')}{' '}
            <span
              style={{
                color: theme.colors.primary,
                textShadow:
                  glowOpacity > 0
                    ? `0 0 40px ${theme.colors.primary}60`
                    : undefined,
              }}
            >
              {t('apiDocs.hero.titleHighlight')}
            </span>
          </h1>

          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10"
            style={{ color: theme.colors.foregroundMuted }}
          >
            {t('apiDocs.hero.subtitle')}
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6">
            {[
              {
                icon: Code2,
                label: '8 Endpoints',
                color: theme.colors.primary,
              },
              { icon: Zap, label: '< 50ms', color: '#22c55e' },
              { icon: Shield, label: 'TLS 1.3', color: '#6366f1' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-2 px-4 py-2"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                }}
              >
                <stat.icon size={18} style={{ color: stat.color }} />
                <span
                  className="font-medium"
                  style={{ color: theme.colors.foreground }}
                >
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Start */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="p-2.5 rounded-xl"
              style={{ background: `${theme.colors.primary}15` }}
            >
              <Rocket size={22} style={{ color: theme.colors.primary }} />
            </div>
            <h2
              className="text-2xl font-bold"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              {t('apiDocs.quickStart.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                step: 1,
                title: t('apiDocs.quickStart.step1.title'),
                desc: t('apiDocs.quickStart.step1.description'),
                icon: Key,
              },
              {
                step: 2,
                title: t('apiDocs.quickStart.step2.title'),
                desc: t('apiDocs.quickStart.step2.description'),
                icon: Terminal,
              },
              {
                step: 3,
                title: t('apiDocs.quickStart.step3.title'),
                desc: t('apiDocs.quickStart.step3.description'),
                icon: Layers,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="p-6 relative"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                }}
              >
                <div
                  className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  }}
                >
                  {item.step}
                </div>
                <item.icon
                  size={28}
                  style={{ color: theme.colors.primary }}
                  className="mb-4"
                />
                <h3
                  className="font-semibold mb-2"
                  style={{ color: theme.colors.foreground }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Base URL & Auth */}
        <div className="grid lg:grid-cols-2 gap-6 mb-16">
          {/* Base URL */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: cardRadius,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <BookOpen size={20} style={{ color: theme.colors.primary }} />
              <h3
                className="font-semibold"
                style={{ color: theme.colors.foreground }}
              >
                {t('apiDocs.baseUrl.title')}
              </h3>
            </div>
            <p
              className="text-sm mb-4"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('apiDocs.baseUrl.description')}
            </p>
            <CodeBlock
              code="https://api.eziox.link"
              theme={theme}
              cardRadius={cardRadius}
              onCopy={() =>
                copyToClipboard('https://api.eziox.link', 'baseurl')
              }
              copied={copiedId === 'baseurl'}
              language="text"
            />
          </motion.div>

          {/* Auth */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: cardRadius,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Key size={20} style={{ color: theme.colors.primary }} />
              <h3
                className="font-semibold"
                style={{ color: theme.colors.foreground }}
              >
                {t('apiDocs.auth.title')}
              </h3>
            </div>
            <p
              className="text-sm mb-4"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('apiDocs.auth.description')}
            </p>
            <CodeBlock
              code="Authorization: Bearer ezx_your_api_key"
              theme={theme}
              cardRadius={cardRadius}
              onCopy={() =>
                copyToClipboard('Authorization: Bearer YOUR_API_KEY', 'auth')
              }
              copied={copiedId === 'auth'}
              language="http"
            />
          </motion.div>
        </div>

        {/* Security Warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16 p-5 flex items-start gap-4"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary}10, ${theme.colors.accent}05)`,
            border: `1px solid ${theme.colors.primary}30`,
            borderRadius: cardRadius,
          }}
        >
          <Shield
            size={24}
            style={{ color: theme.colors.primary }}
            className="shrink-0 mt-0.5"
          />
          <div>
            <h4
              className="font-semibold mb-1"
              style={{ color: theme.colors.foreground }}
            >
              {t('apiDocs.auth.warning.title')}
            </h4>
            <p
              className="text-sm"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('apiDocs.auth.warning.description')}
            </p>
          </div>
        </motion.div>

        {/* Endpoints */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="p-2.5 rounded-xl"
              style={{ background: `${theme.colors.primary}15` }}
            >
              <Code2 size={22} style={{ color: theme.colors.primary }} />
            </div>
            <h2
              className="text-2xl font-bold"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              {t('apiDocs.endpoints.title')}
            </h2>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {Object.keys(endpoints).map((section) => {
              const Icon = sectionIcons[section as keyof typeof sectionIcons]
              return (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className="flex items-center gap-2 px-4 py-2.5 font-medium transition-all whitespace-nowrap"
                  style={{
                    background:
                      activeSection === section
                        ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`
                        : theme.colors.backgroundSecondary,
                    color:
                      activeSection === section
                        ? '#fff'
                        : theme.colors.foreground,
                    borderRadius: cardRadius,
                    border:
                      activeSection === section
                        ? 'none'
                        : `1px solid ${theme.colors.border}`,
                  }}
                >
                  <Icon size={16} />
                  {t(`apiDocs.endpoints.${section}.title`)}
                </button>
              )
            })}
          </div>

          {/* Endpoint Cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {endpoints[activeSection as keyof typeof endpoints].map(
                (endpoint, i) => (
                  <EndpointCard
                    key={endpoint.path}
                    endpoint={endpoint}
                    theme={theme}
                    cardRadius={cardRadius}
                    onCopy={copyToClipboard}
                    copiedId={copiedId}
                    index={i}
                    t={t}
                  />
                ),
              )}
            </motion.div>
          </AnimatePresence>
        </motion.section>

        {/* Rate Limits & Errors */}
        <div className="grid lg:grid-cols-2 gap-6 mb-16">
          {/* Rate Limits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="p-6"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: cardRadius,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Zap size={20} style={{ color: '#f59e0b' }} />
              <h3
                className="font-semibold"
                style={{ color: theme.colors.foreground }}
              >
                {t('apiDocs.rateLimits.title')}
              </h3>
            </div>
            <p
              className="text-sm mb-5"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('apiDocs.rateLimits.description')}
            </p>
            <div className="space-y-3">
              {rateLimits.map((item) => (
                <div
                  key={item.tier}
                  className="flex items-center justify-between p-3"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    borderRadius: '12px',
                  }}
                >
                  <span className="font-medium" style={{ color: item.color }}>
                    {item.tier}
                  </span>
                  <span style={{ color: theme.colors.foreground }}>
                    <strong>{item.limit}</strong>{' '}
                    <span style={{ color: theme.colors.foregroundMuted }}>
                      {t('apiDocs.rateLimits.perHour')}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Error Codes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="p-6"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: cardRadius,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={20} style={{ color: '#ef4444' }} />
              <h3
                className="font-semibold"
                style={{ color: theme.colors.foreground }}
              >
                {t('apiDocs.errors.title')}
              </h3>
            </div>
            <p
              className="text-sm mb-5"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('apiDocs.errors.description')}
            </p>
            <div className="space-y-2">
              {errorCodes.map((error) => (
                <div
                  key={error.code}
                  className="flex items-center gap-3 p-2.5"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    borderRadius: '10px',
                  }}
                >
                  <code
                    className="px-2 py-1 rounded font-mono text-sm font-bold"
                    style={{
                      background: `${error.color}20`,
                      color: error.color,
                    }}
                  >
                    {error.code}
                  </code>
                  <span
                    className="text-sm"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {t(`apiDocs.errors.${error.code}`)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* SDKs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="p-2.5 rounded-xl"
              style={{ background: `${theme.colors.primary}15` }}
            >
              <Layers size={22} style={{ color: theme.colors.primary }} />
            </div>
            <h2
              className="text-2xl font-bold"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              {t('apiDocs.sdks.title')}
            </h2>
          </div>
          <p className="mb-6" style={{ color: theme.colors.foregroundMuted }}>
            {t('apiDocs.sdks.description')}
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { name: 'TypeScript', icon: SiTypescript, color: '#3178c6' },
              { name: 'Python', icon: SiPython, color: '#3776ab' },
              { name: 'Go', icon: SiGo, color: '#00add8' },
            ].map((sdk) => (
              <div
                key={sdk.name}
                className="p-5 flex items-center gap-4 opacity-60"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                }}
              >
                <sdk.icon size={32} style={{ color: sdk.color }} />
                <div>
                  <p
                    className="font-medium"
                    style={{ color: theme.colors.foreground }}
                  >
                    {sdk.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {t('apiDocs.sdks.comingSoon')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="text-center py-16 px-6 relative overflow-hidden"
          style={{
            background: theme.colors.card,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: cardRadius,
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 100%, ${theme.colors.primary}15 0%, transparent 60%)`,
            }}
          />

          <div className="relative">
            <motion.div
              className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
              }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Key size={32} className="text-white" />
            </motion.div>

            <h2
              className="text-3xl font-bold mb-4"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              {t('apiDocs.cta.title')}
            </h2>
            <p
              className="mb-8 max-w-md mx-auto"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('apiDocs.cta.subtitle')}
            </p>

            <Link to="/profile" search={{ tab: 'api' }}>
              <motion.button
                className="inline-flex items-center gap-3 px-8 py-4 font-semibold text-white"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  borderRadius: cardRadius,
                  boxShadow:
                    glowOpacity > 0
                      ? `0 15px 40px ${theme.colors.primary}40`
                      : undefined,
                }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Key size={20} />
                {t('apiDocs.cta.button')}
                <ArrowRight size={20} />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

interface CodeBlockProps {
  code: string
  theme: ReturnType<typeof useTheme>['theme']
  cardRadius: string
  onCopy: () => void
  copied: boolean
  language?: string
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
        className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: theme.colors.card,
          color: copied ? '#22c55e' : theme.colors.foregroundMuted,
          borderRadius: '8px',
          border: `1px solid ${theme.colors.border}`,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
      </motion.button>
    </div>
  )
}

interface EndpointCardProps {
  endpoint: {
    method: string
    path: string
    title: string
    description: string
    auth: boolean
    params?: { name: string; type: string; optional?: boolean }[]
    body?: string
    response: string
  }
  theme: ReturnType<typeof useTheme>['theme']
  cardRadius: string
  onCopy: (text: string, id: string) => void
  copiedId: string | null
  index: number
  t: (key: string) => string
}

function EndpointCard({
  endpoint,
  theme,
  cardRadius,
  onCopy,
  copiedId,
  index,
  t,
}: EndpointCardProps) {
  const [expanded, setExpanded] = useState(false)

  const methodColors: Record<string, { bg: string; text: string }> = {
    GET: { bg: '#22c55e20', text: '#22c55e' },
    POST: { bg: '#3b82f620', text: '#3b82f6' },
    PATCH: { bg: '#f59e0b20', text: '#f59e0b' },
    PUT: { bg: '#8b5cf620', text: '#8b5cf6' },
    DELETE: { bg: '#ef444420', text: '#ef4444' },
  }

  const colors = (methodColors[endpoint.method as keyof typeof methodColors] ??
    methodColors.GET) as { bg: string; text: string }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="overflow-hidden"
      style={{
        background: theme.colors.card,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: cardRadius,
      }}
    >
      <button
        className="w-full p-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono"
            style={{ background: colors.bg, color: colors.text }}
          >
            {endpoint.method}
          </span>
          <code
            className="font-mono text-sm flex-1"
            style={{ color: theme.colors.foreground }}
          >
            {endpoint.path}
          </code>
          {endpoint.auth && (
            <span
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
              style={{
                background: `${theme.colors.primary}15`,
                color: theme.colors.primary,
              }}
            >
              <Lock size={10} />
              Auth
            </span>
          )}
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            style={{ color: theme.colors.foregroundMuted }}
          >
            <ChevronRight size={18} />
          </motion.div>
        </div>
        <p
          className="text-sm mt-2 ml-16"
          style={{ color: theme.colors.foregroundMuted }}
        >
          {endpoint.description}
        </p>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t overflow-hidden"
            style={{ borderColor: theme.colors.border }}
          >
            <div className="p-4 space-y-4">
              {endpoint.params && endpoint.params.length > 0 && (
                <div>
                  <h4
                    className="text-sm font-semibold mb-2"
                    style={{ color: theme.colors.foreground }}
                  >
                    {t('apiDocs.params')}
                  </h4>
                  <div className="space-y-2">
                    {endpoint.params.map((param) => (
                      <div
                        key={param.name}
                        className="flex items-center gap-2 p-2 text-sm"
                        style={{
                          background: theme.colors.backgroundSecondary,
                          borderRadius: '8px',
                        }}
                      >
                        <code
                          className="font-mono"
                          style={{ color: theme.colors.primary }}
                        >
                          {param.name}
                        </code>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{
                            background: theme.colors.card,
                            color: theme.colors.foregroundMuted,
                          }}
                        >
                          {param.type}
                        </span>
                        {param.optional && (
                          <span
                            className="text-xs"
                            style={{ color: theme.colors.foregroundMuted }}
                          >
                            ({t('apiDocs.optional')})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {endpoint.body && (
                <div>
                  <h4
                    className="text-sm font-semibold mb-2"
                    style={{ color: theme.colors.foreground }}
                  >
                    {t('apiDocs.requestBody')}
                  </h4>
                  <CodeBlock
                    code={endpoint.body}
                    theme={theme}
                    cardRadius="12px"
                    onCopy={() =>
                      onCopy(endpoint.body!, `body-${endpoint.path}`)
                    }
                    copied={copiedId === `body-${endpoint.path}`}
                  />
                </div>
              )}

              <div>
                <h4
                  className="text-sm font-semibold mb-2"
                  style={{ color: theme.colors.foreground }}
                >
                  {t('apiDocs.response')}
                </h4>
                <CodeBlock
                  code={endpoint.response}
                  theme={theme}
                  cardRadius="12px"
                  onCopy={() =>
                    onCopy(endpoint.response, `response-${endpoint.path}`)
                  }
                  copied={copiedId === `response-${endpoint.path}`}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
