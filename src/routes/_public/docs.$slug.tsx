import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { motion } from 'motion/react'
import { useTheme } from '@/components/layout/ThemeProvider'
import { getDocBySlugFn, getDocsFn } from '@/server/functions/docs'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
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
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react'
import { useState, useMemo, useCallback } from 'react'

export const Route = createFileRoute('/_public/docs/$slug')({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, ' ')} | Docs | Eziox` },
      {
        name: 'description',
        content: `Documentation for ${params.slug.replace(/-/g, ' ')} on Eziox.`,
      },
    ],
  }),
  component: DocPage,
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

function DocPage() {
  const { theme } = useTheme()
  const { slug } = Route.useParams()
  const getDocBySlug = useServerFn(getDocBySlugFn)
  const getDocs = useServerFn(getDocsFn)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const { data: doc, isLoading } = useQuery({
    queryKey: ['doc', slug],
    queryFn: () => getDocBySlug({ data: { slug } }),
  })

  const { data: allDocs = [] } = useQuery({
    queryKey: ['docs'],
    queryFn: () => getDocs(),
  })

  const { prevDoc, nextDoc } = useMemo(() => {
    const currentIndex = allDocs.findIndex((d) => d.slug === slug)
    return {
      prevDoc: currentIndex > 0 ? allDocs[currentIndex - 1] : null,
      nextDoc:
        currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null,
    }
  }, [allDocs, slug])

  const copyToClipboard = useCallback((code: string) => {
    void navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }, [])

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

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: theme.colors.background }}
      >
        <Loader2
          size={32}
          className="animate-spin"
          style={{ color: theme.colors.primary }}
        />
      </div>
    )
  }

  if (!doc) {
    throw notFound()
  }

  const IconComponent = ICON_MAP[doc.icon] || FileText
  const categoryColor = CATEGORY_COLORS[doc.category] || theme.colors.primary

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
            {doc.category}
          </span>
          <ChevronRight
            size={14}
            style={{ color: theme.colors.foregroundMuted }}
          />
          <span className="text-sm" style={{ color: theme.colors.foreground }}>
            {doc.title}
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
                {doc.title}
              </h1>
              <p
                className="text-lg mt-1"
                style={{ color: theme.colors.foregroundMuted }}
              >
                {doc.description}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose-container"
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
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings]}
              components={{
                h1: ({ children }) => (
                  <h1
                    className="text-3xl font-bold mt-8 mb-4 first:mt-0"
                    style={{
                      color: theme.colors.foreground,
                      fontFamily: theme.typography.displayFont,
                    }}
                  >
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2
                    className="text-2xl font-bold mt-8 mb-4"
                    style={{
                      color: theme.colors.foreground,
                      fontFamily: theme.typography.displayFont,
                    }}
                  >
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3
                    className="text-xl font-semibold mt-6 mb-3"
                    style={{ color: theme.colors.foreground }}
                  >
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4
                    className="text-lg font-semibold mt-4 mb-2"
                    style={{ color: theme.colors.foreground }}
                  >
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p
                    className="mb-4 leading-relaxed"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {children}
                  </p>
                ),
                a: ({ href, children }) => {
                  const isExternal = href?.startsWith('http')
                  return (
                    <Link
                      to={href as '/'}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      className="inline-flex items-center gap-1 underline hover:no-underline"
                      style={{ color: categoryColor }}
                    >
                      {children}
                      {isExternal && <ExternalLink size={12} />}
                    </Link>
                  )
                },
                ul: ({ children }) => (
                  <ul
                    className="list-disc list-inside mb-4 space-y-2"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol
                    className="list-decimal list-inside mb-4 space-y-2"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                blockquote: ({ children }) => (
                  <blockquote
                    className="border-l-4 pl-4 my-4 italic"
                    style={{
                      borderColor: categoryColor,
                      color: theme.colors.foregroundMuted,
                    }}
                  >
                    {children}
                  </blockquote>
                ),
                code: ({ className, children }) => {
                  const isInline = !className
                  const codeString = String(children).replace(/\n$/, '')

                  if (isInline) {
                    return (
                      <code
                        className="px-1.5 py-0.5 text-sm font-mono"
                        style={{
                          background: theme.colors.backgroundSecondary,
                          color: categoryColor,
                          borderRadius: '4px',
                        }}
                      >
                        {children}
                      </code>
                    )
                  }

                  return (
                    <div className="relative group my-4">
                      <button
                        onClick={() => copyToClipboard(codeString)}
                        className="absolute top-3 right-3 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          background: theme.colors.backgroundSecondary,
                          borderRadius: '6px',
                        }}
                      >
                        {copiedCode === codeString ? (
                          <Check size={14} style={{ color: '#10b981' }} />
                        ) : (
                          <Copy
                            size={14}
                            style={{ color: theme.colors.foregroundMuted }}
                          />
                        )}
                      </button>
                      <pre
                        className="p-4 overflow-x-auto text-sm font-mono"
                        style={{
                          background: theme.colors.backgroundSecondary,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: '12px',
                          color: theme.colors.foreground,
                        }}
                      >
                        <code>{children}</code>
                      </pre>
                    </div>
                  )
                },
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table
                      className="w-full text-sm"
                      style={{
                        borderCollapse: 'collapse',
                      }}
                    >
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead
                    style={{
                      background: theme.colors.backgroundSecondary,
                    }}
                  >
                    {children}
                  </thead>
                ),
                th: ({ children }) => (
                  <th
                    className="px-4 py-3 text-left font-semibold"
                    style={{
                      color: theme.colors.foreground,
                      borderBottom: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td
                    className="px-4 py-3"
                    style={{
                      color: theme.colors.foregroundMuted,
                      borderBottom: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    {children}
                  </td>
                ),
                hr: () => (
                  <hr
                    className="my-8"
                    style={{ borderColor: theme.colors.border }}
                  />
                ),
                strong: ({ children }) => (
                  <strong style={{ color: theme.colors.foreground }}>
                    {children}
                  </strong>
                ),
              }}
            >
              {doc.content}
            </ReactMarkdown>
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
              to="/docs/$slug"
              params={{ slug: prevDoc.slug }}
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
              to="/docs/$slug"
              params={{ slug: nextDoc.slug }}
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
