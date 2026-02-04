import { createFileRoute, Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/layout/ThemeProvider'
import { type DocNavItem } from '@/components/docs/DocsLayout'
import { DOCS_NAV } from '@/components/docs/docs-nav'
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
  Zap,
  Globe,
  Clock,
  ArrowRight,
  Sparkles,
  X,
  Command,
} from 'lucide-react'

export const Route = createFileRoute('/_public/docs/')({
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
  component: DocsIndexPage,
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
  Zap,
  Globe,
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  basics: Rocket,
  features: Zap,
  integrations: Globe,
  account: Shield,
  support: HelpCircle,
}

const CATEGORY_COLORS: Record<string, string> = {
  basics: '#8b5cf6',
  features: '#3b82f6',
  integrations: '#10b981',
  account: '#f59e0b',
  support: '#ec4899',
}

const categoryOrder = [
  'basics',
  'features',
  'integrations',
  'account',
  'support',
]

export function DocsIndexPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const getText = (key: string) => {
    if (key.startsWith('docs.')) {
      return t(key)
    }
    return key
  }

  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return DOCS_NAV
    const query = searchQuery.toLowerCase()
    return DOCS_NAV.filter(
      (doc) =>
        getText(doc.titleKey).toLowerCase().includes(query) ||
        getText(doc.descriptionKey).toLowerCase().includes(query) ||
        doc.category.toLowerCase().includes(query),
    )
  }, [searchQuery, t])

  const groupedDocs = useMemo(() => {
    const groups: Record<string, DocNavItem[]> = {}
    filteredDocs.forEach((doc) => {
      if (!groups[doc.category]) {
        groups[doc.category] = []
      }
      groups[doc.category]!.push(doc)
    })
    return groups
  }, [filteredDocs])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === '/' && !searchOpen) {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchOpen])

  const featuredDocs = DOCS_NAV.slice(0, 3)

  return (
    <div
      className="min-h-screen"
      style={{
        background: theme.colors.background,
        fontFamily: theme.typography.bodyFont,
      }}
    >
      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-2xl mx-4 overflow-hidden"
              style={{
                background: theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '20px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center gap-3 p-5 border-b"
                style={{ borderColor: theme.colors.border }}
              >
                <Search
                  size={22}
                  style={{ color: theme.colors.foregroundMuted }}
                />
                <input
                  type="text"
                  placeholder={t('docs.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-lg"
                  style={{ color: theme.colors.foreground }}
                  autoFocus
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X
                    size={18}
                    style={{ color: theme.colors.foregroundMuted }}
                  />
                </button>
              </div>

              <div className="max-h-[50vh] overflow-y-auto p-3">
                {filteredDocs.length === 0 ? (
                  <div className="p-10 text-center">
                    <Search size={40} className="mx-auto mb-4 opacity-30" />
                    <p
                      className="font-medium mb-1"
                      style={{ color: theme.colors.foreground }}
                    >
                      {t('docs.noResults')}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {t('docs.noResultsDesc')}
                    </p>
                  </div>
                ) : (
                  categoryOrder.map((category) => {
                    const docs = groupedDocs[category]
                    if (!docs || docs.length === 0) return null

                    return (
                      <div key={category} className="mb-4">
                        <p
                          className="px-3 py-2 text-xs font-semibold uppercase tracking-wider"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          {t(`docs.categories.${category}`)}
                        </p>
                        {docs.map((doc) => {
                          const DocIcon = ICON_MAP[doc.icon] || FileText
                          return (
                            <Link
                              key={doc.slug}
                              to={`/docs/${doc.slug}` as '/'}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all hover:bg-white/5"
                            >
                              <div
                                className="w-10 h-10 flex items-center justify-center rounded-xl"
                                style={{
                                  background: `${CATEGORY_COLORS[doc.category]}15`,
                                }}
                              >
                                <DocIcon
                                  size={20}
                                  style={{
                                    color: CATEGORY_COLORS[doc.category],
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className="font-medium truncate"
                                  style={{ color: theme.colors.foreground }}
                                >
                                  {getText(doc.titleKey)}
                                </p>
                                <p
                                  className="text-sm truncate"
                                  style={{
                                    color: theme.colors.foregroundMuted,
                                  }}
                                >
                                  {getText(doc.descriptionKey)}
                                </p>
                              </div>
                              <ChevronRight
                                size={18}
                                style={{ color: theme.colors.foregroundMuted }}
                              />
                            </Link>
                          )
                        })}
                      </div>
                    )
                  })
                )}
              </div>

              <div
                className="flex items-center justify-between px-5 py-3 border-t text-xs"
                style={{
                  borderColor: theme.colors.border,
                  color: theme.colors.foregroundMuted,
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd
                      className="px-1.5 py-0.5 rounded"
                      style={{ background: theme.colors.backgroundSecondary }}
                    >
                      ↵
                    </kbd>
                    {t('common.open')}
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd
                      className="px-1.5 py-0.5 rounded"
                      style={{ background: theme.colors.backgroundSecondary }}
                    >
                      ESC
                    </kbd>
                    {t('common.close')}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px]"
            style={{ background: theme.colors.primary, opacity: 0.15 }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px]"
            style={{ background: theme.colors.accent, opacity: 0.1 }}
          />
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}20)`,
                border: `1px solid ${theme.colors.primary}30`,
              }}
            >
              <BookOpen size={16} style={{ color: theme.colors.primary }} />
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                {t('docs.title')}
              </span>
            </div>

            <h1
              className="text-5xl lg:text-7xl font-bold mb-6"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              {t('docs.title')}
            </h1>

            <p
              className="text-xl max-w-2xl mx-auto mb-10"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('docs.subtitle')}
            </p>

            {/* Search Bar */}
            <motion.button
              onClick={() => setSearchOpen(true)}
              className="w-full max-w-xl mx-auto flex items-center gap-4 px-6 py-4 rounded-2xl transition-all hover:scale-[1.02]"
              style={{
                background: theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                boxShadow: `0 10px 40px ${theme.colors.primary}10`,
              }}
              whileHover={{ y: -2 }}
            >
              <Search
                size={22}
                style={{ color: theme.colors.foregroundMuted }}
              />
              <span
                className="flex-1 text-left"
                style={{ color: theme.colors.foregroundMuted }}
              >
                {t('docs.searchPlaceholder')}
              </span>
              <div className="flex items-center gap-1">
                <kbd
                  className="px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    color: theme.colors.foregroundMuted,
                  }}
                >
                  <Command size={12} />K
                </kbd>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Featured Docs */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-2">
              <Sparkles size={20} style={{ color: theme.colors.primary }} />
              <h2
                className="text-2xl font-bold"
                style={{
                  color: theme.colors.foreground,
                  fontFamily: theme.typography.displayFont,
                }}
              >
                {t('docs.categories.basics')}
              </h2>
            </div>
            <p style={{ color: theme.colors.foregroundMuted }}>
              {t('docs.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDocs.map((doc, index) => {
              const IconComponent = ICON_MAP[doc.icon] || FileText
              const categoryColor =
                CATEGORY_COLORS[doc.category] || theme.colors.primary

              return (
                <motion.div
                  key={doc.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/docs/${doc.slug}` as '/'}
                    className="block group h-full"
                  >
                    <div
                      className="h-full p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        background: `linear-gradient(135deg, ${categoryColor}10, ${theme.colors.card})`,
                        border: `1px solid ${theme.colors.border}`,
                      }}
                    >
                      <div
                        className="w-14 h-14 flex items-center justify-center rounded-2xl mb-5"
                        style={{ background: `${categoryColor}20` }}
                      >
                        <IconComponent
                          size={28}
                          style={{ color: categoryColor }}
                        />
                      </div>

                      <h3
                        className="text-xl font-bold mb-2"
                        style={{ color: theme.colors.foreground }}
                      >
                        {getText(doc.titleKey)}
                      </h3>

                      <p
                        className="text-sm mb-4"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        {getText(doc.descriptionKey)}
                      </p>

                      <div className="flex items-center justify-between">
                        {doc.readTime && (
                          <div
                            className="flex items-center gap-1 text-xs"
                            style={{ color: theme.colors.foregroundMuted }}
                          >
                            <Clock size={12} />
                            {t('docs.meta.readTime', { minutes: doc.readTime })}
                          </div>
                        )}
                        <div
                          className="flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: categoryColor }}
                        >
                          {t('common.learnMore')}
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* All Docs by Category */}
      <section
        className="py-16 px-4"
        style={{ background: theme.colors.backgroundSecondary }}
      >
        <div className="max-w-6xl mx-auto">
          {categoryOrder.map((category, categoryIndex) => {
            const docs = groupedDocs[category]
            if (!docs || docs.length === 0) return null

            const CategoryIcon = CATEGORY_ICONS[category] || BookOpen
            const categoryColor =
              CATEGORY_COLORS[category] || theme.colors.primary

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: categoryIndex * 0.1 }}
                className="mb-12 last:mb-0"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 flex items-center justify-center rounded-xl"
                    style={{ background: `${categoryColor}20` }}
                  >
                    <CategoryIcon size={20} style={{ color: categoryColor }} />
                  </div>
                  <h2
                    className="text-2xl font-bold"
                    style={{
                      color: theme.colors.foreground,
                      fontFamily: theme.typography.displayFont,
                    }}
                  >
                    {t(`docs.categories.${category}`)}
                  </h2>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: `${categoryColor}20`,
                      color: categoryColor,
                    }}
                  >
                    {docs.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {docs.map((doc, index) => {
                    const IconComponent = ICON_MAP[doc.icon] || FileText
                    const docColor =
                      CATEGORY_COLORS[doc.category] || theme.colors.primary

                    return (
                      <motion.div
                        key={doc.slug}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={`/docs/${doc.slug}` as '/'}
                          className="block group"
                        >
                          <div
                            className="flex items-center gap-4 p-5 rounded-xl transition-all hover:scale-[1.01]"
                            style={{
                              background: theme.colors.card,
                              border: `1px solid ${theme.colors.border}`,
                            }}
                          >
                            <div
                              className="w-12 h-12 flex items-center justify-center rounded-xl shrink-0"
                              style={{ background: `${docColor}15` }}
                            >
                              <IconComponent
                                size={24}
                                style={{ color: docColor }}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3
                                className="font-semibold mb-1 truncate"
                                style={{ color: theme.colors.foreground }}
                              >
                                {getText(doc.titleKey)}
                              </h3>
                              <p
                                className="text-sm truncate"
                                style={{ color: theme.colors.foregroundMuted }}
                              >
                                {getText(doc.descriptionKey)}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {doc.readTime && (
                                <span
                                  className="text-xs hidden sm:block"
                                  style={{
                                    color: theme.colors.foregroundMuted,
                                  }}
                                >
                                  {doc.readTime} min
                                </span>
                              )}
                              <ChevronRight
                                size={18}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ color: theme.colors.foregroundMuted }}
                              />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Help Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2
              className="text-3xl font-bold mb-4"
              style={{
                color: theme.colors.foreground,
                fontFamily: theme.typography.displayFont,
              }}
            >
              {t('docs.help.title')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Link to="/support" className="block group">
                <div
                  className="p-6 rounded-2xl text-center transition-all hover:scale-[1.02]"
                  style={{
                    background: theme.colors.card,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <div
                    className="w-14 h-14 mx-auto flex items-center justify-center rounded-2xl mb-4"
                    style={{ background: `${theme.colors.primary}20` }}
                  >
                    <HelpCircle
                      size={28}
                      style={{ color: theme.colors.primary }}
                    />
                  </div>
                  <h3
                    className="font-semibold mb-2"
                    style={{ color: theme.colors.foreground }}
                  >
                    {t('docs.help.contactSupport')}
                  </h3>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/api-docs" className="block group">
                <div
                  className="p-6 rounded-2xl text-center transition-all hover:scale-[1.02]"
                  style={{
                    background: theme.colors.card,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <div
                    className="w-14 h-14 mx-auto flex items-center justify-center rounded-2xl mb-4"
                    style={{ background: '#3b82f620' }}
                  >
                    <Key size={28} style={{ color: '#3b82f6' }} />
                  </div>
                  <h3
                    className="font-semibold mb-2"
                    style={{ color: theme.colors.foreground }}
                  >
                    {t('docs.help.apiReference')}
                  </h3>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link to="/pricing" className="block group">
                <div
                  className="p-6 rounded-2xl text-center transition-all hover:scale-[1.02]"
                  style={{
                    background: theme.colors.card,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <div
                    className="w-14 h-14 mx-auto flex items-center justify-center rounded-2xl mb-4"
                    style={{ background: '#f59e0b20' }}
                  >
                    <Crown size={28} style={{ color: '#f59e0b' }} />
                  </div>
                  <h3
                    className="font-semibold mb-2"
                    style={{ color: theme.colors.foreground }}
                  >
                    {t('docs.help.viewPricing')}
                  </h3>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
