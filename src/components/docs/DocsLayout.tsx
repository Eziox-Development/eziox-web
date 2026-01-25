import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useTheme } from '@/components/layout/ThemeProvider'
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Rocket,
  Palette,
  BarChart3,
  Key,
  Crown,
  Music,
  Shield,
  HelpCircle,
} from 'lucide-react'

export interface DocNavItem {
  slug: string
  title: string
  description: string
  category: string
  icon: string
}

const ICON_MAP: Record<string, React.ElementType> = {
  Rocket,
  Palette,
  BarChart3,
  Key,
  Crown,
  Music,
  Shield,
  HelpCircle,
  BookOpen,
}

const CATEGORY_COLORS: Record<string, string> = {
  Basics: '#8b5cf6',
  Features: '#3b82f6',
  Integrations: '#10b981',
  Account: '#f59e0b',
  Support: '#ec4899',
}

export const DOCS_NAV: DocNavItem[] = [
  {
    slug: 'getting-started',
    title: 'Getting Started',
    description: 'Learn how to create your Eziox bio page.',
    category: 'Basics',
    icon: 'Rocket',
  },
  {
    slug: 'customization',
    title: 'Customization',
    description: 'Advanced styling options for your bio page.',
    category: 'Basics',
    icon: 'Palette',
  },
  {
    slug: 'analytics',
    title: 'Analytics',
    description: 'Track your profile performance.',
    category: 'Features',
    icon: 'BarChart3',
  },
  {
    slug: 'api',
    title: 'API Access',
    description: 'Integrate with our REST API.',
    category: 'Features',
    icon: 'Key',
  },
  {
    slug: 'premium',
    title: 'Premium Features',
    description: 'Pro, Creator, and Lifetime plans.',
    category: 'Features',
    icon: 'Crown',
  },
  {
    slug: 'spotify-integration',
    title: 'Spotify Integration',
    description: 'Display your currently playing music.',
    category: 'Integrations',
    icon: 'Music',
  },
  {
    slug: 'security',
    title: 'Security',
    description: 'Security features and best practices.',
    category: 'Account',
    icon: 'Shield',
  },
  {
    slug: 'faq',
    title: 'FAQ',
    description: 'Frequently asked questions.',
    category: 'Support',
    icon: 'HelpCircle',
  },
]

interface DocsLayoutProps {
  title: string
  description: string
  category: string
  icon: string
  children: React.ReactNode
}

export function DocsLayout({
  title,
  description,
  category,
  icon,
  children,
}: DocsLayoutProps) {
  const { theme } = useTheme()

  const currentIndex = DOCS_NAV.findIndex(
    (doc) => doc.title.toLowerCase() === title.toLowerCase(),
  )
  const prevDoc = currentIndex > 0 ? DOCS_NAV[currentIndex - 1] : null
  const nextDoc =
    currentIndex < DOCS_NAV.length - 1 ? DOCS_NAV[currentIndex + 1] : null

  const IconComponent = ICON_MAP[icon] || BookOpen
  const categoryColor = CATEGORY_COLORS[category] || theme.colors.primary

  const cardRadius =
    theme.effects.borderRadius === 'pill'
      ? '24px'
      : theme.effects.borderRadius === 'sharp'
        ? '8px'
        : '16px'

  const glowOpacity =
    theme.effects.glowIntensity === 'strong'
      ? 0.4
      : theme.effects.glowIntensity === 'medium'
        ? 0.25
        : theme.effects.glowIntensity === 'subtle'
          ? 0.15
          : 0

  return (
    <div
      className="min-h-screen"
      style={{
        background: theme.colors.background,
        fontFamily: theme.typography.bodyFont,
      }}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px]"
          style={{
            background: categoryColor,
            opacity: glowOpacity * 0.3,
          }}
          animate={{ scale: [1, 1.1, 1], x: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-24">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-8"
        >
          <Link
            to="/docs"
            className="flex items-center gap-1 text-sm transition-colors hover:opacity-80"
            style={{ color: theme.colors.foregroundMuted }}
          >
            <BookOpen size={14} />
            Docs
          </Link>
          <ChevronRight
            size={14}
            style={{ color: theme.colors.foregroundMuted }}
          />
          <span
            className="text-sm px-2 py-0.5"
            style={{
              background: `${categoryColor}15`,
              color: categoryColor,
              borderRadius: '6px',
            }}
          >
            {category}
          </span>
          <ChevronRight
            size={14}
            style={{ color: theme.colors.foregroundMuted }}
          />
          <span className="text-sm" style={{ color: theme.colors.foreground }}>
            {title}
          </span>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 flex items-center justify-center"
              style={{
                background: `${categoryColor}15`,
                borderRadius: '16px',
              }}
            >
              <IconComponent size={28} style={{ color: categoryColor }} />
            </div>
            <div>
              <h1
                className="text-3xl lg:text-4xl font-bold"
                style={{
                  color: theme.colors.foreground,
                  fontFamily: theme.typography.displayFont,
                }}
              >
                {title}
              </h1>
              <p
                className="text-lg mt-1"
                style={{ color: theme.colors.foregroundMuted }}
              >
                {description}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div
            className="p-8"
            style={{
              background:
                theme.effects.cardStyle === 'glass'
                  ? `${theme.colors.card}80`
                  : theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: cardRadius,
              backdropFilter:
                theme.effects.cardStyle === 'glass' ? 'blur(10px)' : undefined,
            }}
          >
            {children}
          </div>
        </motion.article>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {prevDoc ? (
            <Link
              to={`/docs/${prevDoc.slug}` as '/'}
              className="flex items-center gap-3 p-4 transition-all hover:scale-[1.02]"
              style={{
                background:
                  theme.effects.cardStyle === 'glass'
                    ? `${theme.colors.card}80`
                    : theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: cardRadius,
              }}
            >
              <ChevronLeft
                size={20}
                style={{ color: theme.colors.foregroundMuted }}
              />
              <div>
                <span
                  className="text-xs"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  Previous
                </span>
                <p
                  className="font-medium"
                  style={{ color: theme.colors.foreground }}
                >
                  {prevDoc.title}
                </p>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextDoc && (
            <Link
              to={`/docs/${nextDoc.slug}` as '/'}
              className="flex items-center justify-end gap-3 p-4 transition-all hover:scale-[1.02] md:text-right"
              style={{
                background:
                  theme.effects.cardStyle === 'glass'
                    ? `${theme.colors.card}80`
                    : theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: cardRadius,
              }}
            >
              <div>
                <span
                  className="text-xs"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  Next
                </span>
                <p
                  className="font-medium"
                  style={{ color: theme.colors.foreground }}
                >
                  {nextDoc.title}
                </p>
              </div>
              <ChevronRight
                size={20}
                style={{ color: theme.colors.foregroundMuted }}
              />
            </Link>
          )}
        </motion.div>

        {/* Back to Docs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Link
            to="/docs"
            className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80"
            style={{ color: theme.colors.foregroundMuted }}
          >
            <ChevronLeft size={14} />
            Back to Documentation
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

// Styled components for doc content
export function DocSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const { theme } = useTheme()
  return (
    <section className="mb-8">
      <h2
        className="text-2xl font-bold mb-4"
        style={{
          color: theme.colors.foreground,
          fontFamily: theme.typography.displayFont,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

export function DocSubSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const { theme } = useTheme()
  return (
    <div className="mb-6">
      <h3
        className="text-xl font-semibold mb-3"
        style={{ color: theme.colors.foreground }}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}

export function DocParagraph({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  return (
    <p
      className="mb-4 leading-relaxed"
      style={{ color: theme.colors.foregroundMuted }}
    >
      {children}
    </p>
  )
}

export function DocList({ items }: { items: string[] }) {
  const { theme } = useTheme()
  return (
    <ul
      className="list-disc list-inside mb-4 space-y-2"
      style={{ color: theme.colors.foregroundMuted }}
    >
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}

export function DocCode({ children }: { children: string }) {
  const { theme } = useTheme()
  return (
    <pre
      className="p-4 overflow-x-auto text-sm font-mono mb-4"
      style={{
        background: theme.colors.backgroundSecondary,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '12px',
        color: theme.colors.foreground,
      }}
    >
      <code>{children}</code>
    </pre>
  )
}

export function DocInlineCode({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  return (
    <code
      className="px-1.5 py-0.5 text-sm font-mono"
      style={{
        background: theme.colors.backgroundSecondary,
        color: theme.colors.primary,
        borderRadius: '4px',
      }}
    >
      {children}
    </code>
  )
}

export function DocTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: string[][]
}) {
  const { theme } = useTheme()
  return (
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-sm">
        <thead style={{ background: theme.colors.backgroundSecondary }}>
          <tr>
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left font-semibold"
                style={{
                  color: theme.colors.foreground,
                  borderBottom: `1px solid ${theme.colors.border}`,
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-4 py-3"
                  style={{
                    color: theme.colors.foregroundMuted,
                    borderBottom: `1px solid ${theme.colors.border}`,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DocBlockquote({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  return (
    <blockquote
      className="border-l-4 pl-4 my-4 italic"
      style={{
        borderColor: theme.colors.primary,
        color: theme.colors.foregroundMuted,
      }}
    >
      {children}
    </blockquote>
  )
}

export function DocLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  const { theme } = useTheme()
  const isExternal = href.startsWith('http')

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:no-underline"
        style={{ color: theme.colors.primary }}
      >
        {children}
      </a>
    )
  }

  return (
    <Link
      to={href as '/'}
      className="underline hover:no-underline"
      style={{ color: theme.colors.primary }}
    >
      {children}
    </Link>
  )
}
