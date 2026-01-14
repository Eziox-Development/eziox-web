/**
 * Markdown Parser Module
 * Converts markdown content to styled HTML with syntax highlighting support.
 *
 * Features:
 * - Code blocks with language detection
 * - Tables, lists, blockquotes
 * - Links, images, emphasis
 * - Automatic excerpt generation
 * - Reading time calculation
 * - Table of contents generation
 */

// ============================================================================
// Types
// ============================================================================

export interface MarkdownOptions {
  allowHtml?: boolean
  linkTarget?: '_blank' | '_self'
  addAnchorsToHeadings?: boolean
  highlightCode?: boolean
}

export interface TableOfContentsItem {
  id: string
  text: string
  level: number
}

export interface MarkdownResult {
  html: string
  toc: TableOfContentsItem[]
  wordCount: number
  readingTime: number
}

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_OPTIONS: MarkdownOptions = {
  allowHtml: false,
  linkTarget: '_blank',
  addAnchorsToHeadings: true,
  highlightCode: true,
}

const WORDS_PER_MINUTE = 200

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a URL-safe ID from text
 */
function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text
    .replace(/```[\s\S]*?```/g, '') // Exclude code blocks
    .split(/\s+/)
    .filter(Boolean).length
}

// ============================================================================
// Main Parser
// ============================================================================

/**
 * Parse markdown content to HTML
 */
export function parseMarkdown(
  content: string,
  options: MarkdownOptions = {},
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let html = content

  // Escape HTML if not allowed
  if (!opts.allowHtml) {
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  // Code blocks (must be processed before inline code)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const language = lang || 'text'
    const trimmedCode = code.trim()
    const escapedCode = escapeHtml(trimmedCode)
    return `<pre class="code-block" data-language="${language}"><div class="code-header"><span class="code-language">${language}</span></div><code class="language-${language}">${escapedCode}</code></pre>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, (_, code) => {
    return `<code class="inline-code">${escapeHtml(code)}</code>`
  })

  // Headers with optional anchor links
  const headingReplacer = (level: number) => (_: string, text: string) => {
    const id = generateId(text)
    if (opts.addAnchorsToHeadings) {
      return `<h${level} id="${id}" class="md-h${level}"><a href="#${id}" class="heading-anchor">#</a>${text}</h${level}>`
    }
    return `<h${level} class="md-h${level}">${text}</h${level}>`
  }

  html = html.replace(/^###### (.+)$/gm, headingReplacer(6))
  html = html.replace(/^##### (.+)$/gm, headingReplacer(5))
  html = html.replace(/^#### (.+)$/gm, headingReplacer(4))
  html = html.replace(/^### (.+)$/gm, headingReplacer(3))
  html = html.replace(/^## (.+)$/gm, headingReplacer(2))
  html = html.replace(/^# (.+)$/gm, headingReplacer(1))

  // Blockquotes (multi-line support)
  html = html.replace(
    /^> (.+)$/gm,
    '<blockquote class="md-blockquote">$1</blockquote>',
  )
  // Merge consecutive blockquotes
  html = html.replace(
    /(<\/blockquote>)\n(<blockquote class="md-blockquote">)/g,
    '<br>',
  )

  // Bold and italic (order matters)
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/_(.+?)_/g, '<em>$1</em>')

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>')

  // Auto-link plain URLs (must be before markdown links)
  // Match URLs that are not already in markdown link format
  html = html.replace(
    /(?<!\]\()(?<!\()(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g,
    (url) => {
      const linkTarget =
        opts.linkTarget === '_blank'
          ? ' target="_blank" rel="noopener noreferrer"'
          : ''
      return `<a href="${url}" class="md-link md-auto-link"${linkTarget}>${url}</a>`
    },
  )

  // Markdown links
  const linkTarget =
    opts.linkTarget === '_blank'
      ? ' target="_blank" rel="noopener noreferrer"'
      : ''
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    `<a href="$2" class="md-link"${linkTarget}>$1</a>`,
  )

  // Images with optional title
  html = html.replace(
    /!\[([^\]]*)\]\(([^\s)]+)(?:\s+"([^"]+)")?\)/g,
    (_, alt, src, title) => {
      const titleAttr = title ? ` title="${title}"` : ''
      return `<figure class="md-figure"><img src="${src}" alt="${alt}" class="md-image" loading="lazy"${titleAttr} />${alt ? `<figcaption>${alt}</figcaption>` : ''}</figure>`
    },
  )

  // Horizontal rules
  html = html.replace(/^(---|\_\_\_|\*\*\*)$/gm, '<hr class="md-hr" />')

  // Tables
  const tableRegex = /(\|.+\|[\r\n]+)+/g
  html = html.replace(tableRegex, (tableMatch) => {
    const rows = tableMatch
      .trim()
      .split('\n')
      .filter((row) => row.trim())
    if (rows.length < 2) return tableMatch

    let tableHtml =
      '<div class="table-wrapper"><table class="md-table"><thead><tr>'

    // Header row
    const headerCells = rows[0]?.split('|').filter((cell) => cell.trim()) ?? []
    headerCells.forEach((cell) => {
      tableHtml += `<th>${cell.trim()}</th>`
    })
    tableHtml += '</tr></thead><tbody>'

    // Skip separator row (index 1) and process data rows
    for (let i = 2; i < rows.length; i++) {
      const cells = rows[i]?.split('|').filter((cell) => cell.trim()) ?? []
      if (cells.length > 0) {
        tableHtml += '<tr>'
        cells.forEach((cell) => {
          tableHtml += `<td>${cell.trim()}</td>`
        })
        tableHtml += '</tr>'
      }
    }

    tableHtml += '</tbody></table></div>'
    return tableHtml
  })

  // Task lists
  html = html.replace(
    /^- \[x\] (.+)$/gm,
    '<li class="md-task md-task-checked"><input type="checkbox" checked disabled /> $1</li>',
  )
  html = html.replace(
    /^- \[ \] (.+)$/gm,
    '<li class="md-task"><input type="checkbox" disabled /> $1</li>',
  )

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="md-li">$1</li>')
  html = html.replace(/^\* (.+)$/gm, '<li class="md-li">$1</li>')
  html = html.replace(
    /(<li class="md-li">.*<\/li>\n?)+/g,
    '<ul class="md-ul">$&</ul>',
  )
  html = html.replace(
    /(<li class="md-task[^"]*">.*<\/li>\n?)+/g,
    '<ul class="md-ul md-task-list">$&</ul>',
  )

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="md-li-ordered">$1</li>')
  html = html.replace(
    /(<li class="md-li-ordered">.*<\/li>\n?)+/g,
    '<ol class="md-ol">$&</ol>',
  )

  // Paragraphs - wrap remaining text blocks
  html = html
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ''

      // Don't wrap if already wrapped in HTML tags
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<p') ||
        trimmed.startsWith('<ul') ||
        trimmed.startsWith('<ol') ||
        trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<pre') ||
        trimmed.startsWith('<table') ||
        trimmed.startsWith('<div') ||
        trimmed.startsWith('<hr') ||
        trimmed.startsWith('<figure') ||
        trimmed.startsWith('<img')
      ) {
        return trimmed
      }

      return `<p class="md-p">${trimmed}</p>`
    })
    .join('\n\n')

  // Clean up extra newlines
  html = html.replace(/\n{3,}/g, '\n\n')

  return html
}

/**
 * Parse markdown and return detailed result with TOC
 */
export function parseMarkdownWithMeta(
  content: string,
  options: MarkdownOptions = {},
): MarkdownResult {
  const html = parseMarkdown(content, options)
  const toc = extractTableOfContents(content)
  const wordCount = countWords(content)
  const readingTime = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE))

  return { html, toc, wordCount, readingTime }
}

// ============================================================================
// Table of Contents
// ============================================================================

/**
 * Extract table of contents from markdown
 */
export function extractTableOfContents(content: string): TableOfContentsItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const toc: TableOfContentsItem[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1]?.length ?? 1
    const text = match[2] ?? ''
    const id = generateId(text)
    toc.push({ id, text, level })
  }

  return toc
}

// ============================================================================
// Excerpt Generation
// ============================================================================

/**
 * Generate excerpt from markdown content
 */
export function generateExcerpt(
  content: string,
  maxLength: number = 160,
): string {
  const text = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1') // Remove bold+italic
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/__(.+?)__/g, '$1') // Remove bold (underscore)
    .replace(/_(.+?)_/g, '$1') // Remove italic (underscore)
    .replace(/~~(.+?)~~/g, '$1') // Remove strikethrough
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // Remove images
    .replace(/^>\s/gm, '') // Remove blockquotes
    .replace(/^[-*]\s/gm, '') // Remove list markers
    .replace(/^\d+\.\s/gm, '') // Remove ordered list markers
    .replace(/- \[[x ]\]/g, '') // Remove task list markers
    .replace(/\|[^|]+\|/g, '') // Remove table syntax
    .replace(/^(---|\_\_\_|\*\*\*)$/gm, '') // Remove horizontal rules
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim()

  if (text.length <= maxLength) return text

  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  return truncated.substring(0, lastSpace > 0 ? lastSpace : maxLength) + '...'
}

// ============================================================================
// Reading Time
// ============================================================================

/**
 * Calculate reading time in minutes
 */
export function calculateReadingTime(content: string): number {
  const wordCount = countWords(content)
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE))
}

/**
 * Format reading time for display
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) return 'Less than 1 min read'
  if (minutes === 1) return '1 min read'
  return `${minutes} min read`
}

// ============================================================================
// Text Utilities
// ============================================================================

/**
 * Strip all markdown formatting from content
 */
export function stripMarkdown(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1') // Remove bold+italic
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/__(.+?)__/g, '$1') // Remove bold (underscore)
    .replace(/_(.+?)_/g, '$1') // Remove italic (underscore)
    .replace(/~~(.+?)~~/g, '$1') // Remove strikethrough
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // Remove images
    .replace(/^>\s/gm, '') // Remove blockquotes
    .replace(/^[-*]\s/gm, '') // Remove list markers
    .replace(/^\d+\.\s/gm, '') // Remove ordered list markers
    .replace(/- \[[x ]\]/g, '') // Remove task list markers
    .replace(/\|[^|]+\|/g, '') // Remove table syntax
    .replace(/^(---|\_\_\_|\*\*\*)$/gm, '') // Remove horizontal rules
    .trim()
}

/**
 * Get word count from markdown content
 */
export function getWordCount(content: string): number {
  return countWords(content)
}
