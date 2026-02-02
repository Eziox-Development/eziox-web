import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/layout/ThemeProvider'
import { DOCS_NAV } from './docs-nav'

// Simple markdown parser for basic formatting
const parseMarkdown = (text: string): React.ReactNode => {
  // Handle bold text **text**
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  // Handle italic text *text*
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>')
  // Handle inline code `code`
  text = text.replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded text-xs font-mono" style="background: rgba(0,0,0,0.1)">$1</code>')
  
  return <span dangerouslySetInnerHTML={{ __html: text }} />
}
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
  Search,
  Menu,
  X,
  Home,
  ExternalLink,
  Hash,
  Clock,
  FileText,
  Zap,
  Settings,
  Users,
  Globe,
  Code,
  Sparkles,
} from 'lucide-react'

export interface DocNavItem {
  slug: string
  titleKey: string
  descriptionKey: string
  category: string
  icon: string
  readTime?: number
}

export interface DocHeading {
  id: string
  text: string
  level: number
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
  FileText,
  Zap,
  Settings,
  Users,
  Globe,
  Code,
  Sparkles,
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


interface DocsLayoutProps {
  children: React.ReactNode
  headings?: DocHeading[]
  slug?: string
  title?: string
  description?: string
  category?: string
  icon?: string
}

export function DocsLayout({ children, headings = [], slug, title, description, category, icon }: DocsLayoutProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const location = useLocation()
  
  // Helper to get text - returns i18n translation if key starts with 'docs.' otherwise returns as-is
  const getText = useCallback((key: string) => {
    if (key.startsWith('docs.')) {
      return t(key)
    }
    return key
  }, [t])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeHeading, setActiveHeading] = useState<string>('')

  const currentDoc = useMemo(() => {
    const currentSlug = slug || location.pathname.split('/').pop()
    const foundDoc = DOCS_NAV.find((doc) => doc.slug === currentSlug)
    
    // Support legacy props (title, description, category, icon)
    if (!foundDoc && title) {
      return {
        slug: currentSlug || '',
        titleKey: title,
        descriptionKey: description || '',
        category: category?.toLowerCase() || 'basics',
        icon: icon || 'BookOpen',
        readTime: 5,
        _isLegacy: true,
      } as DocNavItem & { _isLegacy?: boolean }
    }
    
    return foundDoc
  }, [slug, location.pathname, title, description, category, icon])

  const currentIndex = useMemo(() => {
    return DOCS_NAV.findIndex((doc) => doc.slug === currentDoc?.slug)
  }, [currentDoc])

  const prevDoc = currentIndex > 0 ? DOCS_NAV[currentIndex - 1] : null
  const nextDoc = currentIndex < DOCS_NAV.length - 1 ? DOCS_NAV[currentIndex + 1] : null

  const groupedDocs = useMemo(() => {
    const groups: Record<string, DocNavItem[]> = {}
    const filteredDocs = searchQuery
      ? DOCS_NAV.filter((doc) => {
          const docTitle = getText(doc.titleKey).toLowerCase()
          const desc = getText(doc.descriptionKey).toLowerCase()
          const query = searchQuery.toLowerCase()
          return docTitle.includes(query) || desc.includes(query)
        })
      : DOCS_NAV

    filteredDocs.forEach((doc) => {
      if (!groups[doc.category]) {
        groups[doc.category] = []
      }
      groups[doc.category]!.push(doc)
    })
    return groups
  }, [searchQuery, t])

  const categoryOrder = ['basics', 'features', 'integrations', 'account', 'support']

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -80% 0px' }
    )

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !searchOpen) {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchOpen])

  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveHeading(id)
    }
  }, [])

  const IconComponent = currentDoc ? ICON_MAP[currentDoc.icon] || BookOpen : BookOpen
  const categoryColor = currentDoc ? CATEGORY_COLORS[currentDoc.category] || theme.colors.primary : theme.colors.primary

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
            className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
            style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
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
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: theme.colors.border }}>
                <Search size={20} style={{ color: theme.colors.foregroundMuted }} />
                <input
                  type="text"
                  placeholder={t('docs.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-lg"
                  style={{ color: theme.colors.foreground }}
                  autoFocus
                />
                <kbd
                  className="px-2 py-1 text-xs rounded"
                  style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foregroundMuted }}
                >
                  ESC
                </kbd>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {Object.entries(groupedDocs).length === 0 ? (
                  <div className="p-8 text-center">
                    <Search size={32} className="mx-auto mb-3 opacity-30" />
                    <p style={{ color: theme.colors.foregroundMuted }}>{t('docs.noResults')}</p>
                  </div>
                ) : (
                  Object.entries(groupedDocs)
                    .sort(([a], [b]) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b))
                    .map(([category, docs]) => (
                      <div key={category} className="mb-4">
                        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.colors.foregroundMuted }}>
                          {t(`docs.categories.${category}`)}
                        </p>
                        {docs.map((doc) => {
                          const DocIcon = ICON_MAP[doc.icon] || FileText
                          return (
                            <Link
                              key={doc.slug}
                              to={`/docs/${doc.slug}` as '/'}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all hover:bg-white/5"
                            >
                              <div
                                className="w-10 h-10 flex items-center justify-center rounded-lg"
                                style={{ background: `${CATEGORY_COLORS[doc.category]}15` }}
                              >
                                <DocIcon size={18} style={{ color: CATEGORY_COLORS[doc.category] }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate" style={{ color: theme.colors.foreground }}>
                                  {getText(doc.titleKey)}
                                </p>
                                <p className="text-sm truncate" style={{ color: theme.colors.foregroundMuted }}>
                                  {getText(doc.descriptionKey)}
                                </p>
                              </div>
                              <ChevronRight size={16} style={{ color: theme.colors.foregroundMuted }} />
                            </Link>
                          )
                        })}
                      </div>
                    ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Layout Container */}
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 z-40 h-screen w-72 transform transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{
            background: theme.colors.backgroundSecondary,
            borderRight: `1px solid ${theme.colors.border}`,
          }}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: theme.colors.border }}>
              <Link to="/docs" className="flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center rounded-xl"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
                >
                  <BookOpen size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold" style={{ color: theme.colors.foreground }}>{t('docs.title')}</p>
                  <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>Eziox</p>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg lg:hidden hover:bg-white/5"
              >
                <X size={20} style={{ color: theme.colors.foregroundMuted }} />
              </button>
            </div>

            {/* Search Button */}
            <div className="p-4">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5"
                style={{
                  background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <Search size={16} style={{ color: theme.colors.foregroundMuted }} />
                <span className="flex-1 text-left text-sm" style={{ color: theme.colors.foregroundMuted }}>
                  {t('docs.searchPlaceholder')}
                </span>
                <kbd
                  className="px-2 py-0.5 text-xs rounded"
                  style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foregroundMuted }}
                >
                  /
                </kbd>
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 pb-4">
              {categoryOrder.map((category) => {
                const docs = groupedDocs[category]
                if (!docs || docs.length === 0) return null

                const CategoryIcon = CATEGORY_ICONS[category] || BookOpen

                return (
                  <div key={category} className="mb-6">
                    <div className="flex items-center gap-2 mb-2 px-2">
                      <CategoryIcon size={14} style={{ color: CATEGORY_COLORS[category] }} />
                      <p
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        {t(`docs.categories.${category}`)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      {docs.map((doc) => {
                        const isActive = currentDoc?.slug === doc.slug
                        const DocIcon = ICON_MAP[doc.icon] || FileText

                        return (
                          <Link
                            key={doc.slug}
                            to={`/docs/${doc.slug}` as '/'}
                            onClick={() => setSidebarOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                            style={{
                              background: isActive ? `${CATEGORY_COLORS[doc.category]}15` : 'transparent',
                              color: isActive ? theme.colors.foreground : theme.colors.foregroundMuted,
                              borderLeft: isActive ? `3px solid ${CATEGORY_COLORS[doc.category]}` : '3px solid transparent',
                            }}
                          >
                            <DocIcon size={16} style={{ color: isActive ? CATEGORY_COLORS[doc.category] : theme.colors.foregroundMuted }} />
                            <span className="text-sm font-medium">{getText(doc.titleKey)}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t" style={{ borderColor: theme.colors.border }}>
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:bg-white/5"
                style={{ color: theme.colors.foregroundMuted }}
              >
                <Home size={16} />
                {t('docs.breadcrumb.home')}
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Top Bar */}
          <header
            className="sticky top-16 z-30 flex items-center gap-4 px-4 lg:px-8 py-4 mt-4 border-b backdrop-blur-xl"
            style={{
              background: `${theme.colors.background}95`,
              borderColor: theme.colors.border,
            }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg lg:hidden hover:bg-white/5"
            >
              <Menu size={20} style={{ color: theme.colors.foreground }} />
            </button>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm">
              <Link
                to="/docs"
                className="flex items-center gap-1 transition-colors hover:opacity-80"
                style={{ color: theme.colors.foregroundMuted }}
              >
                <BookOpen size={14} />
                {t('docs.breadcrumb.docs')}
              </Link>
              {currentDoc && (
                <>
                  <ChevronRight size={14} style={{ color: theme.colors.foregroundMuted }} />
                  <span
                    className="px-2 py-0.5 rounded-md text-xs font-medium"
                    style={{ background: `${categoryColor}15`, color: categoryColor }}
                  >
                    {t(`docs.categories.${currentDoc.category}`)}
                  </span>
                  <ChevronRight size={14} style={{ color: theme.colors.foregroundMuted }} />
                  <span style={{ color: theme.colors.foreground }}>{getText(currentDoc.titleKey)}</span>
                </>
              )}
            </nav>

            <div className="flex-1" />

            {/* Search Button (Desktop) */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:bg-white/5"
              style={{
                background: theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <Search size={16} style={{ color: theme.colors.foregroundMuted }} />
              <span className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
                {t('docs.searchPlaceholder')}
              </span>
              <kbd
                className="px-2 py-0.5 text-xs rounded ml-4"
                style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foregroundMuted }}
              >
                /
              </kbd>
            </button>
          </header>

          {/* Content Area */}
          <div className="flex">
            {/* Article */}
            <article className="flex-1 min-w-0 px-4 lg:px-8 pt-12 pb-12 lg:pt-16 lg:pb-16">
              {/* Page Header */}
              {currentDoc && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-10"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-14 h-14 flex items-center justify-center rounded-2xl shrink-0"
                      style={{ background: `${categoryColor}15` }}
                    >
                      <IconComponent size={28} style={{ color: categoryColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1
                        className="text-3xl lg:text-4xl font-bold mb-2"
                        style={{ color: theme.colors.foreground, fontFamily: theme.typography.displayFont }}
                      >
                        {getText(currentDoc.titleKey)}
                      </h1>
                      <p className="text-lg" style={{ color: theme.colors.foregroundMuted }}>
                        {getText(currentDoc.descriptionKey)}
                      </p>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    {currentDoc.readTime && (
                      <div className="flex items-center gap-2 text-sm" style={{ color: theme.colors.foregroundMuted }}>
                        <Clock size={14} />
                        {t('docs.meta.readTime', { minutes: currentDoc.readTime })}
                      </div>
                    )}
                    <div
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ background: `${categoryColor}15`, color: categoryColor }}
                    >
                      {t(`docs.categories.${currentDoc.category}`)}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="prose-container"
              >
                <div
                  className="p-6 lg:p-8 rounded-2xl"
                  style={{
                    background: theme.colors.card,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  {children}
                </div>
              </motion.div>

              {/* Navigation Footer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {prevDoc ? (
                  <Link
                    to={`/docs/${prevDoc.slug}` as '/'}
                    className="group flex items-center gap-4 p-5 rounded-2xl transition-all hover:scale-[1.02]"
                    style={{
                      background: theme.colors.card,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors group-hover:bg-white/10"
                      style={{ background: theme.colors.backgroundSecondary }}
                    >
                      <ChevronLeft size={20} style={{ color: theme.colors.foregroundMuted }} />
                    </div>
                    <div>
                      <span className="text-xs font-medium" style={{ color: theme.colors.foregroundMuted }}>
                        {t('docs.navigation.previous')}
                      </span>
                      <p className="font-semibold" style={{ color: theme.colors.foreground }}>
                        {getText(prevDoc.titleKey)}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div />
                )}

                {nextDoc && (
                  <Link
                    to={`/docs/${nextDoc.slug}` as '/'}
                    className="group flex items-center justify-end gap-4 p-5 rounded-2xl transition-all hover:scale-[1.02] text-right"
                    style={{
                      background: theme.colors.card,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    <div>
                      <span className="text-xs font-medium" style={{ color: theme.colors.foregroundMuted }}>
                        {t('docs.navigation.next')}
                      </span>
                      <p className="font-semibold" style={{ color: theme.colors.foreground }}>
                        {getText(nextDoc.titleKey)}
                      </p>
                    </div>
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors group-hover:bg-white/10"
                      style={{ background: theme.colors.backgroundSecondary }}
                    >
                      <ChevronRight size={20} style={{ color: theme.colors.foregroundMuted }} />
                    </div>
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
                  {t('docs.navigation.backToDocs')}
                </Link>
              </motion.div>
            </article>

            {/* Table of Contents (Desktop) */}
            {headings.length > 0 && (
              <aside className="hidden xl:block w-64 shrink-0 pr-8 pt-16 pb-16">
                <div className="sticky top-40">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-4 px-3"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {t('docs.navigation.onThisPage')}
                  </p>
                  <nav className="space-y-1">
                    {headings.map((heading) => (
                      <button
                        key={heading.id}
                        onClick={() => scrollToHeading(heading.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg transition-all hover:bg-white/5"
                        style={{
                          color: activeHeading === heading.id ? theme.colors.primary : theme.colors.foregroundMuted,
                          paddingLeft: `${(heading.level - 1) * 12 + 12}px`,
                          borderLeft: activeHeading === heading.id ? `2px solid ${theme.colors.primary}` : '2px solid transparent',
                        }}
                      >
                        <Hash size={12} className="shrink-0 opacity-50" />
                        <span className="truncate">{heading.text}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </aside>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

// Styled components for doc content
export function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme()
  return (
    <section className="mb-10">
      <h2
        id={title.toLowerCase().replace(/\s+/g, '-')}
        className="text-2xl font-bold mb-4 scroll-mt-24"
        style={{ color: theme.colors.foreground, fontFamily: theme.typography.displayFont }}
      >
        {parseMarkdown(title)}
      </h2>
      {children}
    </section>
  )
}

export function DocSubSection({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme()
  return (
    <div className="mb-6">
      <h3
        id={title.toLowerCase().replace(/\s+/g, '-')}
        className="text-xl font-semibold mb-3 scroll-mt-24"
        style={{ color: theme.colors.foreground }}
      >
        {parseMarkdown(title)}
      </h3>
      {children}
    </div>
  )
}

export function DocParagraph({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const content = typeof children === 'string' ? parseMarkdown(children) : children
  return (
    <p className="mb-4 leading-relaxed" style={{ color: theme.colors.foregroundMuted }}>
      {content}
    </p>
  )
}

export function DocList({ items }: { items: string[] }) {
  const { theme } = useTheme()
  return (
    <ul className="mb-4 space-y-2 pl-4">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-3"
          style={{ color: theme.colors.foregroundMuted }}
        >
          <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: theme.colors.primary }} />
          {parseMarkdown(item)}
        </li>
      ))}
    </ul>
  )
}

export function DocCode({ children, language }: { children: string; language?: string }) {
  const { theme } = useTheme()
  return (
    <div className="relative mb-4 group">
      {language && (
        <span
          className="absolute top-3 right-3 px-2 py-1 text-xs rounded-md"
          style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foregroundMuted }}
        >
          {language}
        </span>
      )}
      <pre
        className="p-4 overflow-x-auto text-sm font-mono rounded-xl"
        style={{
          background: theme.colors.backgroundSecondary,
          border: `1px solid ${theme.colors.border}`,
          color: theme.colors.foreground,
        }}
      >
        <code>{children}</code>
      </pre>
    </div>
  )
}

export function DocInlineCode({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  return (
    <code
      className="px-1.5 py-0.5 text-sm font-mono rounded-md"
      style={{
        background: theme.colors.backgroundSecondary,
        color: theme.colors.primary,
      }}
    >
      {children}
    </code>
  )
}

export function DocTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  const { theme } = useTheme()
  return (
    <div className="overflow-x-auto mb-4 rounded-xl" style={{ border: `1px solid ${theme.colors.border}` }}>
      <table className="w-full text-sm">
        <thead style={{ background: theme.colors.backgroundSecondary }}>
          <tr>
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left font-semibold"
                style={{ color: theme.colors.foreground }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderTop: `1px solid ${theme.colors.border}` }}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3" style={{ color: theme.colors.foregroundMuted }}>
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

export function DocBlockquote({ children, type = 'info' }: { children: React.ReactNode; type?: 'info' | 'warning' | 'tip' | 'danger' }) {
  const { theme } = useTheme()

  const colors = {
    info: theme.colors.primary,
    warning: '#f59e0b',
    tip: '#10b981',
    danger: '#ef4444',
  }

  const icons = {
    info: BookOpen,
    warning: HelpCircle,
    tip: Sparkles,
    danger: Shield,
  }

  const Icon = icons[type]
  const color = colors[type]

  return (
    <div
      className="flex gap-4 p-4 my-4 rounded-xl"
      style={{
        background: `${color}10`,
        borderLeft: `4px solid ${color}`,
      }}
    >
      <Icon size={20} className="shrink-0 mt-0.5" style={{ color }} />
      <div style={{ color: theme.colors.foregroundMuted }}>{children}</div>
    </div>
  )
}

export function DocLink({ href, children }: { href: string; children: React.ReactNode }) {
  const { theme } = useTheme()
  const isExternal = href.startsWith('http')

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 underline hover:no-underline"
        style={{ color: theme.colors.primary }}
      >
        {children}
        <ExternalLink size={12} />
      </a>
    )
  }

  return (
    <Link to={href as '/'} className="underline hover:no-underline" style={{ color: theme.colors.primary }}>
      {children}
    </Link>
  )
}

export function DocCard({ title, description, href, icon }: { title: string; description: string; href: string; icon?: string }) {
  const { theme } = useTheme()
  const IconComponent = icon ? ICON_MAP[icon] || FileText : FileText

  return (
    <Link
      to={href as '/'}
      className="block p-5 rounded-xl transition-all hover:scale-[1.02]"
      style={{
        background: theme.colors.backgroundSecondary,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 flex items-center justify-center rounded-lg shrink-0"
          style={{ background: `${theme.colors.primary}15` }}
        >
          <IconComponent size={20} style={{ color: theme.colors.primary }} />
        </div>
        <div>
          <h4 className="font-semibold mb-1" style={{ color: theme.colors.foreground }}>
            {title}
          </h4>
          <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}

export function DocGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">{children}</div>
}
