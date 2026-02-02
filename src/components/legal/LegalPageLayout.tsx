import { Fragment, useState, useEffect, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useTheme } from '@/components/layout/ThemeProvider'
import {
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Clock,
  Building2,
  FileText,
  Printer,
  Share2,
  BookOpen,
  ArrowUp,
  ExternalLink,
  Search,
  Check,
} from 'lucide-react'

export interface LegalSection {
  id: string
  title: string
  icon: React.ElementType
  content: string
}

export interface RelatedLink {
  title: string
  href: string
  icon: React.ElementType
}

interface LegalPageLayoutProps {
  title: string
  subtitle: string
  badge: string
  badgeIcon: React.ElementType
  accentColor: string
  lastUpdated: string
  sections: LegalSection[]
  relatedLinks: RelatedLink[]
  generatorCredit?: { text: string; url: string; name: string }
  children?: React.ReactNode
}

export function LegalPageLayout({
  title,
  subtitle,
  badge,
  badgeIcon: BadgeIcon,
  accentColor,
  lastUpdated,
  sections,
  relatedLinks,
  generatorCredit,
  children,
}: LegalPageLayoutProps) {
  const { theme } = useTheme()
  const [activeSection, setActiveSection] = useState<string | null>(
    sections[0]?.id || null,
  )
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map((s) => s.id)),
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [readProgress, setReadProgress] = useState(0)

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

  // Filter sections based on search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections
    const query = searchQuery.toLowerCase()
    return sections.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.content.toLowerCase().includes(query),
    )
  }, [sections, searchQuery])

  // Scroll progress and active section detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight
      setReadProgress(Math.min((scrollTop / docHeight) * 100, 100))
      setShowScrollTop(scrollTop > 500)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // IntersectionObserver for active section
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    sections.forEach((section) => {
      const element = document.getElementById(section.id)
      if (!element) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
              setActiveSection(section.id)
            }
          })
        },
        { rootMargin: '-80px 0px -60% 0px', threshold: [0.2, 0.5] },
      )

      observer.observe(element)
      observers.push(observer)
    })

    return () => observers.forEach((observer) => observer.disconnect())
  }, [sections])

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const expandAll = () =>
    setExpandedSections(new Set(sections.map((s) => s.id)))
  const collapseAll = () => setExpandedSections(new Set())

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' })
      setActiveSection(id)
      setMobileNavOpen(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div
      className="min-h-screen print:bg-white"
      style={{
        background: theme.colors.background,
        fontFamily: theme.typography.bodyFont,
      }}
    >
      {/* Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 z-50 print:hidden"
        style={{ background: theme.colors.border }}
      >
        <motion.div
          className="h-full"
          style={{
            background: `linear-gradient(90deg, ${accentColor}, ${theme.colors.accent})`,
            width: `${readProgress}%`,
          }}
          initial={{ width: 0 }}
        />
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden print:hidden">
        <motion.div
          className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px]"
          style={{ background: accentColor, opacity: glowOpacity * 0.2 }}
          animate={{ scale: [1, 1.1, 1], x: [0, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-40 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px]"
          style={{
            background: theme.colors.accent,
            opacity: glowOpacity * 0.15,
          }}
          animate={{ scale: [1.1, 1, 1.1], y: [0, -20, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      {/* Mobile Navigation Toggle */}
      <motion.button
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
        className="fixed bottom-6 right-6 z-50 lg:hidden w-14 h-14 flex items-center justify-center shadow-2xl print:hidden"
        style={{
          background: `linear-gradient(135deg, ${accentColor}, ${theme.colors.accent})`,
          borderRadius: '50%',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {mobileNavOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <Menu size={24} className="text-white" />
        )}
      </motion.button>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 left-6 z-50 w-12 h-12 flex items-center justify-center shadow-lg print:hidden"
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '50%',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUp size={20} style={{ color: theme.colors.foreground }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden print:hidden"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              className="fixed inset-x-0 bottom-0 z-40 lg:hidden p-4 pb-24 max-h-[75vh] overflow-y-auto print:hidden"
              style={{
                background: theme.colors.card,
                borderTop: `1px solid ${theme.colors.border}`,
                borderRadius: `${cardRadius} ${cardRadius} 0 0`,
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="font-semibold"
                  style={{ color: theme.colors.foreground }}
                >
                  Navigation
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={expandAll}
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      background: theme.colors.backgroundSecondary,
                      color: theme.colors.foregroundMuted,
                    }}
                  >
                    Alle öffnen
                  </button>
                  <button
                    onClick={collapseAll}
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      background: theme.colors.backgroundSecondary,
                      color: theme.colors.foregroundMuted,
                    }}
                  >
                    Alle schließen
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                {sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
                    style={{
                      background:
                        activeSection === section.id
                          ? `${accentColor}15`
                          : 'transparent',
                      borderRadius: '12px',
                      color:
                        activeSection === section.id
                          ? accentColor
                          : theme.colors.foregroundMuted,
                    }}
                  >
                    <span
                      className="w-6 h-6 flex items-center justify-center text-xs font-medium rounded-full"
                      style={{
                        background:
                          activeSection === section.id
                            ? accentColor
                            : theme.colors.backgroundSecondary,
                        color:
                          activeSection === section.id
                            ? '#fff'
                            : theme.colors.foregroundMuted,
                      }}
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium truncate">
                      {section.title}
                    </span>
                    {activeSection === section.id && (
                      <Check
                        size={16}
                        className="ml-auto"
                        style={{ color: accentColor }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-8 pt-16">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 pt-8 print:mb-8 print:pt-4"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 print:hidden"
            style={{
              background: `${accentColor}15`,
              border: `1px solid ${accentColor}30`,
              borderRadius: cardRadius,
            }}
          >
            <BadgeIcon size={16} style={{ color: accentColor }} />
            <span
              className="text-sm font-semibold"
              style={{ color: theme.colors.foreground }}
            >
              {badge}
            </span>
          </motion.div>

          {/* Title */}
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 print:text-3xl"
            style={{
              color: theme.colors.foreground,
              fontFamily: theme.typography.displayFont,
            }}
          >
            {title}
          </h1>
          <p
            className="text-base lg:text-lg max-w-2xl mx-auto mb-6"
            style={{ color: theme.colors.foregroundMuted }}
          >
            {subtitle}
          </p>

          {/* Meta Info */}
          <div
            className="flex flex-wrap items-center justify-center gap-4 text-sm print:gap-2"
            style={{ color: theme.colors.foregroundMuted }}
          >
            <div className="flex items-center gap-2">
              <Clock size={14} style={{ color: accentColor }} />
              <span>
                Zuletzt aktualisiert:{' '}
                <strong style={{ color: theme.colors.foreground }}>
                  {lastUpdated}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 size={14} style={{ color: accentColor }} />
              <span>Eziox · Deutschland</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 mt-6 print:hidden">
            <motion.button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
              style={{
                background: theme.colors.backgroundSecondary,
                color: theme.colors.foreground,
                borderRadius: cardRadius,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Printer size={16} />
              Drucken
            </motion.button>
            <motion.button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
              style={{
                background: theme.colors.backgroundSecondary,
                color: theme.colors.foreground,
                borderRadius: cardRadius,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Share2 size={16} />
              Teilen
            </motion.button>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="flex gap-8 print:block">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block w-80 shrink-0 print:hidden"
          >
            <div
              className="sticky top-20 p-5 max-h-[calc(100vh-100px)] overflow-y-auto"
              style={{
                background:
                  theme.effects.cardStyle === 'glass'
                    ? `${theme.colors.card}90`
                    : theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: cardRadius,
                backdropFilter:
                  theme.effects.cardStyle === 'glass'
                    ? 'blur(10px)'
                    : undefined,
              }}
            >
              {/* Search */}
              <div className="relative mb-4">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: theme.colors.foregroundMuted }}
                />
                <input
                  type="text"
                  placeholder="Suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm outline-none transition-colors"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    color: theme.colors.foreground,
                    borderRadius: '10px',
                    border: `1px solid ${theme.colors.border}`,
                  }}
                />
              </div>

              {/* Section Controls */}
              <div
                className="flex items-center justify-between mb-4 pb-4"
                style={{ borderBottom: `1px solid ${theme.colors.border}` }}
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={16} style={{ color: accentColor }} />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: theme.colors.foreground }}
                  >
                    Inhalt
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={expandAll}
                    className="p-1.5 rounded-md text-xs"
                    style={{
                      background: theme.colors.backgroundSecondary,
                      color: theme.colors.foregroundMuted,
                    }}
                    title="Alle öffnen"
                  >
                    +
                  </button>
                  <button
                    onClick={collapseAll}
                    className="p-1.5 rounded-md text-xs"
                    style={{
                      background: theme.colors.backgroundSecondary,
                      color: theme.colors.foregroundMuted,
                    }}
                    title="Alle schließen"
                  >
                    −
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-0.5">
                {filteredSections.map((section) => {
                  const isActive = activeSection === section.id
                  const originalIndex = sections.findIndex(
                    (s) => s.id === section.id,
                  )
                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all group"
                      style={{
                        background: isActive
                          ? `${accentColor}12`
                          : 'transparent',
                        borderRadius: '10px',
                        borderLeft: isActive
                          ? `3px solid ${accentColor}`
                          : '3px solid transparent',
                      }}
                      whileHover={{ x: 2 }}
                    >
                      <span
                        className="w-6 h-6 flex items-center justify-center text-xs font-semibold rounded-md shrink-0 transition-colors"
                        style={{
                          background: isActive
                            ? accentColor
                            : theme.colors.backgroundSecondary,
                          color: isActive
                            ? '#fff'
                            : theme.colors.foregroundMuted,
                        }}
                      >
                        {originalIndex + 1}
                      </span>
                      <span
                        className="text-sm truncate transition-colors"
                        style={{
                          color: isActive
                            ? theme.colors.foreground
                            : theme.colors.foregroundMuted,
                        }}
                      >
                        {section.title.replace(/^\d+\.\s*/, '')}
                      </span>
                    </motion.button>
                  )
                })}
              </nav>

              {/* Reading Progress */}
              <div
                className="mt-6 pt-4"
                style={{ borderTop: `1px solid ${theme.colors.border}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-xs font-medium"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    Lesefortschritt
                  </span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: accentColor }}
                  >
                    {Math.round(readProgress)}%
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: theme.colors.backgroundSecondary }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: accentColor,
                      width: `${readProgress}%`,
                    }}
                  />
                </div>
              </div>

              {/* Related Links */}
              {relatedLinks.length > 0 && (
                <div
                  className="mt-6 pt-4"
                  style={{ borderTop: `1px solid ${theme.colors.border}` }}
                >
                  <h4
                    className="text-xs font-semibold mb-3 uppercase tracking-wider"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    Verwandte Dokumente
                  </h4>
                  <div className="space-y-1">
                    {relatedLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all group"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        <link.icon size={14} style={{ color: accentColor }} />
                        <span className="group-hover:underline">
                          {link.title}
                        </span>
                        <ExternalLink
                          size={12}
                          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {children}

            {/* Sections */}
            <div className="space-y-6 print:space-y-4">
              {filteredSections.map((section, index) => {
                const isExpanded = expandedSections.has(section.id)
                const SectionIcon = section.icon
                const originalIndex = sections.findIndex(
                  (s) => s.id === section.id,
                )

                return (
                  <motion.article
                    key={section.id}
                    id={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="scroll-mt-24 overflow-hidden print:break-inside-avoid"
                    style={{
                      background:
                        theme.effects.cardStyle === 'glass'
                          ? `${theme.colors.card}90`
                          : theme.colors.card,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: cardRadius,
                      backdropFilter:
                        theme.effects.cardStyle === 'glass'
                          ? 'blur(10px)'
                          : undefined,
                    }}
                  >
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center gap-4 p-5 text-left transition-colors print:cursor-default"
                      style={{
                        borderBottom: isExpanded
                          ? `1px solid ${theme.colors.border}`
                          : 'none',
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-10 h-10 flex items-center justify-center shrink-0 print:w-8 print:h-8"
                          style={{
                            background: `${accentColor}15`,
                            borderRadius: '10px',
                          }}
                        >
                          <SectionIcon
                            size={20}
                            style={{ color: accentColor }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded"
                              style={{
                                background: theme.colors.backgroundSecondary,
                                color: theme.colors.foregroundMuted,
                              }}
                            >
                              §{originalIndex + 1}
                            </span>
                          </div>
                          <h2
                            className="text-lg font-bold mt-1 truncate print:text-base"
                            style={{ color: theme.colors.foreground }}
                          >
                            {section.title.replace(/^\d+\.\s*/, '')}
                          </h2>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="print:hidden"
                      >
                        <ChevronDown
                          size={20}
                          style={{ color: theme.colors.foregroundMuted }}
                        />
                      </motion.div>
                    </button>

                    {/* Section Content */}
                    <AnimatePresence initial={false}>
                      {(isExpanded ||
                        (typeof window !== 'undefined' &&
                          window.matchMedia('print').matches)) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="print:h-auto! print:opacity-100!"
                        >
                          <div className="p-5 pt-4">
                            <div className="prose prose-sm max-w-none text-sm leading-relaxed space-y-4 print:text-xs">
                              {section.content
                                .split('\n\n')
                                .map((paragraph, i) => (
                                  <p
                                    key={i}
                                    style={{
                                      color: theme.colors.foregroundMuted,
                                    }}
                                  >
                                    <RenderContent
                                      text={paragraph}
                                      accentColor={accentColor}
                                      theme={theme}
                                    />
                                  </p>
                                ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.article>
                )
              })}
            </div>

            {/* Footer Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 p-6 text-center print:mt-6 print:p-4"
              style={{
                background:
                  theme.effects.cardStyle === 'glass'
                    ? `${theme.colors.card}90`
                    : theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: cardRadius,
              }}
            >
              <FileText
                size={24}
                className="mx-auto mb-3"
                style={{ color: accentColor }}
              />
              <p
                className="text-sm font-medium mb-1"
                style={{ color: theme.colors.foreground }}
              >
                Rechtlich verbindliches Dokument
              </p>
              <p
                className="text-xs"
                style={{ color: theme.colors.foregroundMuted }}
              >
                Dieses Dokument wurde zuletzt am {lastUpdated} aktualisiert und
                ist rechtlich bindend.
              </p>
              <p
                className="text-xs mt-2"
                style={{ color: theme.colors.foregroundMuted }}
              >
                © {new Date().getFullYear()} Eziox · Nattapat Pongsuwan · Alle
                Rechte vorbehalten
              </p>
              {generatorCredit ? (
                <p
                  className="text-xs mt-2"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  {generatorCredit.text}{' '}
                  <a
                    href={generatorCredit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: accentColor, textDecoration: 'underline' }}
                  >
                    {generatorCredit.name}
                  </a>
                </p>
              ) : (
                <p
                  className="text-xs mt-2"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  Diese Nutzungsbedingungen wurden mit Hilfe von{' '}
                  <a
                    href="https://termly.io/products/terms-and-conditions-generator/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: accentColor, textDecoration: 'underline' }}
                  >
                    Termly's Terms and Conditions Generator
                  </a>{' '}
                  erstellt.
                </p>
              )}
            </motion.div>

            {/* Related Links (Mobile) */}
            {relatedLinks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-5 lg:hidden print:hidden"
                style={{
                  background:
                    theme.effects.cardStyle === 'glass'
                      ? `${theme.colors.card}90`
                      : theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: cardRadius,
                }}
              >
                <h3
                  className="text-sm font-semibold mb-4"
                  style={{ color: theme.colors.foreground }}
                >
                  Verwandte Dokumente
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {relatedLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="flex items-center justify-between p-3 transition-all"
                      style={{
                        background: theme.colors.backgroundSecondary,
                        borderRadius: '12px',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <link.icon size={16} style={{ color: accentColor }} />
                        <span
                          className="text-sm"
                          style={{ color: theme.colors.foreground }}
                        >
                          {link.title}
                        </span>
                      </div>
                      <ChevronRight
                        size={14}
                        style={{ color: theme.colors.foregroundMuted }}
                      />
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

function RenderContent({
  text,
  accentColor,
  theme,
}: {
  text: string
  accentColor: string
  theme: ReturnType<typeof useTheme>['theme']
}) {
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
        parts.push(
          <span
            key={`bullet-${lineIndex}-${partIndex}`}
            style={{ color: accentColor }}
          >
            •{' '}
          </span>,
        )
        remaining = remaining.slice(2)
        partIndex++
        continue
      }

      let nextMatch: {
        index: number
        type: 'bold' | 'link'
        length: number
      } | null = null

      if (boldMatch?.index !== undefined) {
        nextMatch = {
          index: boldMatch.index,
          type: 'bold',
          length: boldMatch[0].length,
        }
      }
      if (
        linkMatch?.index !== undefined &&
        (!nextMatch || linkMatch.index < nextMatch.index)
      ) {
        nextMatch = {
          index: linkMatch.index,
          type: 'link',
          length: linkMatch[0].length,
        }
      }

      if (!nextMatch) {
        parts.push(
          <Fragment key={`text-${lineIndex}-${partIndex}`}>
            {remaining}
          </Fragment>,
        )
        break
      }

      if (nextMatch.index > 0) {
        parts.push(
          <Fragment key={`pre-${lineIndex}-${partIndex}`}>
            {remaining.slice(0, nextMatch.index)}
          </Fragment>,
        )
        partIndex++
      }

      if (nextMatch.type === 'bold' && boldMatch) {
        parts.push(
          <strong
            key={`bold-${lineIndex}-${partIndex}`}
            style={{ color: theme.colors.foreground }}
          >
            {boldMatch[1]}
          </strong>,
        )
      } else if (nextMatch.type === 'link' && linkMatch && linkMatch[2]) {
        const isExternal = linkMatch[2].startsWith('http')
        parts.push(
          isExternal ? (
            <a
              key={`link-${lineIndex}-${partIndex}`}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline inline-flex items-center gap-1"
              style={{ color: accentColor }}
            >
              {linkMatch[1]}
              <ExternalLink size={12} />
            </a>
          ) : (
            <Link
              key={`link-${lineIndex}-${partIndex}`}
              to={linkMatch[2] as '/'}
              className="underline hover:no-underline"
              style={{ color: accentColor }}
            >
              {linkMatch[1]}
            </Link>
          ),
        )
      }

      remaining = remaining.slice(nextMatch.index + nextMatch.length)
      partIndex++
    }
  })

  return <>{parts}</>
}

export function CookieTable({
  cookies,
  accentColor,
}: {
  cookies: Array<{
    name: string
    purpose: string
    duration: string
    type: string
  }>
  accentColor: string
}) {
  const { theme } = useTheme()
  return (
    <div
      className="overflow-x-auto rounded-lg"
      style={{ border: `1px solid ${theme.colors.border}` }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: theme.colors.backgroundSecondary }}>
            <th
              className="text-left py-3 px-4 font-semibold"
              style={{ color: theme.colors.foreground }}
            >
              Cookie
            </th>
            <th
              className="text-left py-3 px-4 font-semibold"
              style={{ color: theme.colors.foreground }}
            >
              Zweck
            </th>
            <th
              className="text-left py-3 px-4 font-semibold"
              style={{ color: theme.colors.foreground }}
            >
              Dauer
            </th>
            <th
              className="text-left py-3 px-4 font-semibold"
              style={{ color: theme.colors.foreground }}
            >
              Typ
            </th>
          </tr>
        </thead>
        <tbody>
          {cookies.map((cookie) => (
            <tr
              key={cookie.name}
              style={{
                borderTop: `1px solid ${theme.colors.border}`,
                background: 'transparent',
              }}
            >
              <td
                className="py-3 px-4 font-mono text-xs"
                style={{ color: accentColor }}
              >
                {cookie.name}
              </td>
              <td
                className="py-3 px-4"
                style={{ color: theme.colors.foreground }}
              >
                {cookie.purpose}
              </td>
              <td
                className="py-3 px-4"
                style={{ color: theme.colors.foregroundMuted }}
              >
                {cookie.duration}
              </td>
              <td className="py-3 px-4">
                <span
                  className="px-2 py-1 text-xs font-medium rounded"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    color: theme.colors.foregroundMuted,
                  }}
                >
                  {cookie.type}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
