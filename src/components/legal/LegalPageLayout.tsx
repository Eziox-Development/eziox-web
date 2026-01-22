import { Fragment, useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useTheme } from '@/components/layout/ThemeProvider'
import { ChevronRight, ChevronDown, Menu, X } from 'lucide-react'

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
  children,
}: LegalPageLayoutProps) {
  const { theme } = useTheme()
  const [activeSection, setActiveSection] = useState<string | null>(
    sections[0]?.id || null,
  )
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  )

  // IntersectionObserver for active section detection
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    sections.forEach((section) => {
      const element = document.getElementById(section.id)
      if (!element) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
              setActiveSection(section.id)
            }
          })
        },
        {
          rootMargin: '-100px 0px -60% 0px',
          threshold: [0.3, 0.5, 0.7],
        },
      )

      observer.observe(element)
      observers.push(observer)
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [sections])

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const borderRadius =
    theme.effects.borderRadius === 'pill'
      ? '9999px'
      : theme.effects.borderRadius === 'sharp'
        ? '8px'
        : '16px'
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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(id)
      setMobileNavOpen(false)
    }
  }

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
          style={{ background: accentColor, opacity: glowOpacity * 0.3 }}
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

      {/* Mobile Navigation Toggle */}
      <button
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
        className="fixed bottom-6 right-6 z-50 lg:hidden w-14 h-14 flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${accentColor}, ${theme.colors.accent})`,
          borderRadius: '50%',
          boxShadow: `0 4px 20px ${accentColor}40`,
        }}
      >
        {mobileNavOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <Menu size={24} className="text-white" />
        )}
      </button>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed inset-x-0 bottom-0 z-40 lg:hidden p-4 pb-24 max-h-[70vh] overflow-y-auto"
            style={{
              background: theme.colors.card,
              borderTop: `1px solid ${theme.colors.border}`,
              borderRadius: `${cardRadius} ${cardRadius} 0 0`,
            }}
          >
            <h3
              className="font-semibold mb-4"
              style={{ color: theme.colors.foreground }}
            >
              Navigation
            </h3>
            <div className="space-y-1">
              {sections.map((section) => (
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
                  <section.icon size={18} style={{ color: accentColor }} />
                  <span className="text-sm font-medium">{section.title}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2.5 mb-6"
            style={{
              background: `${accentColor}15`,
              border: `1px solid ${accentColor}30`,
              borderRadius,
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

          <h1
            className="text-4xl lg:text-5xl font-bold mb-4"
            style={{
              color: theme.colors.foreground,
              fontFamily: theme.typography.displayFont,
            }}
          >
            {title}
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto mb-4"
            style={{ color: theme.colors.foregroundMuted }}
          >
            {subtitle}
          </p>
          <p
            className="text-sm"
            style={{ color: theme.colors.foregroundMuted }}
          >
            Last Updated:{' '}
            <span style={{ color: accentColor }}>{lastUpdated}</span>
          </p>
        </motion.div>

        {/* Main Content with Sidebar */}
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden lg:block w-72 shrink-0"
          >
            <div
              className="sticky top-24 p-5 max-h-[calc(100vh-120px)] overflow-y-auto"
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
              <h3
                className="font-semibold text-sm mb-4 pb-3"
                style={{
                  color: theme.colors.foreground,
                  borderBottom: `1px solid ${theme.colors.border}`,
                }}
              >
                Table of Contents
              </h3>
              <nav className="space-y-1">
                {sections.map((section, index) => (
                  <motion.button
                    key={section.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + index * 0.02 }}
                    onClick={() => scrollToSection(section.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all group"
                    style={{
                      background:
                        activeSection === section.id
                          ? `${accentColor}15`
                          : 'transparent',
                      borderRadius: '10px',
                      borderLeft:
                        activeSection === section.id
                          ? `3px solid ${accentColor}`
                          : '3px solid transparent',
                    }}
                  >
                    <section.icon
                      size={16}
                      style={{
                        color:
                          activeSection === section.id
                            ? accentColor
                            : theme.colors.foregroundMuted,
                      }}
                      className="shrink-0 group-hover:scale-110 transition-transform"
                    />
                    <span
                      className="text-sm truncate"
                      style={{
                        color:
                          activeSection === section.id
                            ? theme.colors.foreground
                            : theme.colors.foregroundMuted,
                      }}
                    >
                      {section.title}
                    </span>
                  </motion.button>
                ))}
              </nav>
            </div>
          </motion.aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Optional extra content before sections */}
            {children}

            {/* Sections */}
            <div className="space-y-6">
              {sections.map((section, index) => {
                const isCollapsed = collapsedSections.has(section.id)
                return (
                  <motion.section
                    key={section.id}
                    id={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.03 }}
                    className="scroll-mt-24 overflow-hidden"
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
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center gap-4 p-6 text-left"
                      style={{
                        borderBottom: !isCollapsed
                          ? `1px solid ${theme.colors.border}`
                          : 'none',
                      }}
                    >
                      <div
                        className="w-11 h-11 flex items-center justify-center shrink-0"
                        style={{
                          background: `${accentColor}15`,
                          borderRadius: '12px',
                        }}
                      >
                        <section.icon
                          size={22}
                          style={{ color: accentColor }}
                        />
                      </div>
                      <h2
                        className="flex-1 text-xl font-bold"
                        style={{ color: theme.colors.foreground }}
                      >
                        {section.title}
                      </h2>
                      <motion.div
                        animate={{ rotate: isCollapsed ? 0 : 180 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown
                          size={20}
                          style={{ color: theme.colors.foregroundMuted }}
                        />
                      </motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                          <div className="p-6 pt-0">
                            <div className="prose prose-invert max-w-none text-sm leading-relaxed space-y-4">
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
                  </motion.section>
                )
              })}
            </div>

            {/* Related Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-10 p-6"
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
              <h2
                className="text-lg font-semibold mb-4"
                style={{ color: theme.colors.foreground }}
              >
                Related Policies
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center justify-between p-4 transition-all hover:scale-[1.02]"
                    style={{
                      background: theme.colors.backgroundSecondary,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: cardRadius,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <link.icon size={18} style={{ color: accentColor }} />
                      <span style={{ color: theme.colors.foreground }}>
                        {link.title}
                      </span>
                    </div>
                    <ChevronRight
                      size={16}
                      style={{ color: theme.colors.foregroundMuted }}
                    />
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
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
      } else if (nextMatch.type === 'link' && linkMatch) {
        parts.push(
          <Link
            key={`link-${lineIndex}-${partIndex}`}
            to={linkMatch[2] as '/'}
            className="underline hover:no-underline"
            style={{ color: accentColor }}
          >
            {linkMatch[1]}
          </Link>,
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
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
            <th
              className="text-left py-3 px-4 font-medium"
              style={{ color: theme.colors.foregroundMuted }}
            >
              Cookie Name
            </th>
            <th
              className="text-left py-3 px-4 font-medium"
              style={{ color: theme.colors.foregroundMuted }}
            >
              Purpose
            </th>
            <th
              className="text-left py-3 px-4 font-medium"
              style={{ color: theme.colors.foregroundMuted }}
            >
              Duration
            </th>
            <th
              className="text-left py-3 px-4 font-medium"
              style={{ color: theme.colors.foregroundMuted }}
            >
              Type
            </th>
          </tr>
        </thead>
        <tbody>
          {cookies.map((cookie) => (
            <tr
              key={cookie.name}
              style={{ borderBottom: `1px solid ${theme.colors.border}20` }}
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
                  className="px-2 py-1 text-xs font-medium"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    borderRadius: '6px',
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
