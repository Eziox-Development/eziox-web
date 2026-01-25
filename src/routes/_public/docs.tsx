import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { motion } from 'motion/react'
import { useTheme } from '@/components/layout/ThemeProvider'
import { getDocsFn, type DocMeta } from '@/server/functions/docs'
import {
  BookOpen,
  Rocket,
  Palette,
  BarChart3,
  Key,
  Crown,
  Music,
  Shield,
  HelpCircle,
  FileText,
  ChevronRight,
  Search,
  Loader2,
} from 'lucide-react'
import { useState, useMemo } from 'react'

export const Route = createFileRoute('/_public/docs')({
  head: () => ({
    meta: [
      { title: 'Documentation | Eziox' },
      {
        name: 'description',
        content:
          'Learn how to use Eziox with our comprehensive documentation and guides.',
      },
    ],
  }),
  component: DocsPage,
})

const ICON_MAP: Record<string, React.ElementType> = {
  Rocket,
  Palette,
  BarChart3,
  Key,
  Crown,
  Music,
  Shield,
  HelpCircle,
  FileText,
  BookOpen,
}

const CATEGORY_COLORS: Record<string, string> = {
  Basics: '#8b5cf6',
  Features: '#3b82f6',
  Integrations: '#10b981',
  Account: '#f59e0b',
  Support: '#ec4899',
}

function DocsPage() {
  const { theme } = useTheme()
  const getDocs = useServerFn(getDocsFn)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['docs'],
    queryFn: () => getDocs(),
  })

  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return docs
    const query = searchQuery.toLowerCase()
    return docs.filter(
      (doc) =>
        doc.title.toLowerCase().includes(query) ||
        doc.description.toLowerCase().includes(query) ||
        doc.category.toLowerCase().includes(query),
    )
  }, [docs, searchQuery])

  const groupedDocs = useMemo(() => {
    const groups: Record<string, DocMeta[]> = {}
    filteredDocs.forEach((doc) => {
      if (!groups[doc.category]) {
        groups[doc.category] = []
      }
      groups[doc.category]!.push(doc)
    })
    return groups
  }, [filteredDocs])

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
            background: theme.colors.primary,
            opacity: glowOpacity * 0.3,
          }}
          animate={{ scale: [1, 1.1, 1], x: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-40 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{
            background: theme.colors.accent,
            opacity: glowOpacity * 0.2,
          }}
          animate={{ scale: [1.1, 1, 1.1], y: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2.5 mb-6"
            style={{
              background: `${theme.colors.primary}15`,
              border: `1px solid ${theme.colors.primary}30`,
              borderRadius: cardRadius,
            }}
          >
            <BookOpen size={16} style={{ color: theme.colors.primary }} />
            <span
              className="text-sm font-semibold"
              style={{ color: theme.colors.foreground }}
            >
              Documentation
            </span>
          </motion.div>

          <h1
            className="text-4xl lg:text-5xl font-bold mb-4"
            style={{
              color: theme.colors.foreground,
              fontFamily: theme.typography.displayFont,
            }}
          >
            Learn Eziox
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto mb-8"
            style={{ color: theme.colors.foregroundMuted }}
          >
            Everything you need to create and customize your perfect bio page.
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto">
            <div
              className="relative"
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
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: theme.colors.foregroundMuted }}
              />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-transparent outline-none"
                style={{
                  color: theme.colors.foreground,
                  borderRadius: cardRadius,
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2
              size={32}
              className="animate-spin"
              style={{ color: theme.colors.primary }}
            />
          </div>
        )}

        {/* Docs Grid */}
        {!isLoading && (
          <div className="space-y-12">
            {Object.entries(groupedDocs).map(([category, categoryDocs]) => (
              <motion.section
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 flex items-center justify-center"
                    style={{
                      background: `${CATEGORY_COLORS[category] || theme.colors.primary}15`,
                      borderRadius: '12px',
                    }}
                  >
                    <BookOpen
                      size={20}
                      style={{
                        color:
                          CATEGORY_COLORS[category] || theme.colors.primary,
                      }}
                    />
                  </div>
                  <h2
                    className="text-2xl font-bold"
                    style={{
                      color: theme.colors.foreground,
                      fontFamily: theme.typography.displayFont,
                    }}
                  >
                    {category}
                  </h2>
                  <span
                    className="text-sm px-2 py-0.5"
                    style={{
                      background: theme.colors.backgroundSecondary,
                      color: theme.colors.foregroundMuted,
                      borderRadius: '6px',
                    }}
                  >
                    {categoryDocs.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryDocs.map((doc, index) => {
                    const IconComponent = ICON_MAP[doc.icon] || FileText
                    const categoryColor =
                      CATEGORY_COLORS[doc.category] || theme.colors.primary

                    return (
                      <motion.div
                        key={doc.slug}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to="/docs/$slug"
                          params={{ slug: doc.slug }}
                          className="block h-full group"
                        >
                          <div
                            className="h-full p-5 transition-all duration-200 hover:scale-[1.02]"
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
                            <div className="flex items-start gap-4">
                              <div
                                className="w-11 h-11 flex items-center justify-center shrink-0"
                                style={{
                                  background: `${categoryColor}15`,
                                  borderRadius: '12px',
                                }}
                              >
                                <IconComponent
                                  size={22}
                                  style={{ color: categoryColor }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h3
                                    className="font-semibold truncate"
                                    style={{ color: theme.colors.foreground }}
                                  >
                                    {doc.title}
                                  </h3>
                                  <ChevronRight
                                    size={16}
                                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{
                                      color: theme.colors.foregroundMuted,
                                    }}
                                  />
                                </div>
                                <p
                                  className="text-sm mt-1 line-clamp-2"
                                  style={{ color: theme.colors.foregroundMuted }}
                                >
                                  {doc.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.section>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredDocs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Search
              size={48}
              className="mx-auto mb-4"
              style={{ color: theme.colors.foregroundMuted }}
            />
            <h3
              className="text-xl font-semibold mb-2"
              style={{ color: theme.colors.foreground }}
            >
              No results found
            </h3>
            <p style={{ color: theme.colors.foregroundMuted }}>
              Try a different search term or browse all documentation.
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  background: theme.colors.primary,
                  color: 'white',
                  borderRadius: cardRadius,
                }}
              >
                Clear Search
              </button>
            )}
          </motion.div>
        )}

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 p-6"
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
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: theme.colors.foreground }}
          >
            Need More Help?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/contact"
              className="flex items-center gap-3 p-4 transition-all hover:scale-[1.02]"
              style={{
                background: theme.colors.backgroundSecondary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: cardRadius,
              }}
            >
              <HelpCircle size={20} style={{ color: theme.colors.primary }} />
              <span style={{ color: theme.colors.foreground }}>
                Contact Support
              </span>
            </Link>
            <Link
              to="/api-docs"
              className="flex items-center gap-3 p-4 transition-all hover:scale-[1.02]"
              style={{
                background: theme.colors.backgroundSecondary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: cardRadius,
              }}
            >
              <Key size={20} style={{ color: theme.colors.primary }} />
              <span style={{ color: theme.colors.foreground }}>
                API Reference
              </span>
            </Link>
            <Link
              to="/pricing"
              className="flex items-center gap-3 p-4 transition-all hover:scale-[1.02]"
              style={{
                background: theme.colors.backgroundSecondary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: cardRadius,
              }}
            >
              <Crown size={20} style={{ color: theme.colors.primary }} />
              <span style={{ color: theme.colors.foreground }}>
                View Pricing
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
