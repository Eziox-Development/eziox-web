/**
 * Blog Build Script
 * Converts markdown files from content/blog to a JSON file for the blog system.
 *
 * Features:
 * - Parses frontmatter metadata
 * - Auto-calculates reading time
 * - Generates excerpts if not provided
 * - Validates required fields
 * - Sorts by publish date (newest first)
 *
 * Usage: bun run scripts/build-blog.ts
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// ============================================================================
// Types
// ============================================================================

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: string
  publishDate: string
  category: string
  tags: string[]
  coverImage?: string
  coverImageAlt?: string
  readingTime: number
  featured?: boolean
  author?: string
  projectUrl?: string
  githubUrl?: string
}

interface BuildStats {
  total: number
  featured: number
  categories: Set<string>
  tags: Set<string>
  errors: string[]
}

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  blogDir: path.join(process.cwd(), 'content', 'blog'),
  outputFile: path.join(process.cwd(), 'src', 'lib', 'blog-posts.json'),
  wordsPerMinute: 200,
  defaultExcerptLength: 160,
  defaultAuthor: 'Saito',
} as const

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate reading time based on word count
 */
function calculateReadingTime(content: string): number {
  const text = content.replace(/```[\s\S]*?```/g, '') // Exclude code blocks
  const wordCount = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / CONFIG.wordsPerMinute))
}

/**
 * Generate excerpt from markdown content
 */
function generateExcerpt(
  content: string,
  maxLength: number = CONFIG.defaultExcerptLength,
): string {
  const text = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // Remove images
    .replace(/^>\s/gm, '') // Remove blockquotes
    .replace(/^[-*]\s/gm, '') // Remove list markers
    .replace(/^\d+\.\s/gm, '') // Remove ordered list markers
    .replace(/\|[^|]+\|/g, '') // Remove table syntax
    .replace(/---/g, '') // Remove horizontal rules
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim()

  if (text.length <= maxLength) return text

  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return truncated.substring(0, lastSpace > 0 ? lastSpace : maxLength) + '...'
}

/**
 * Normalize date to ISO format
 */
function normalizeDate(date: unknown): string {
  if (!date) return new Date().toISOString().split('T')[0] ?? ''

  const dateStr = String(date)
  const parsed = new Date(dateStr)

  if (isNaN(parsed.getTime())) {
    console.warn(`   ⚠️  Invalid date: ${dateStr}, using current date`)
    return new Date().toISOString().split('T')[0] ?? ''
  }

  return parsed.toISOString().split('T')[0] ?? ''
}

/**
 * Validate and sanitize tags
 */
function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return []
  return tags
    .map((tag) => String(tag).toLowerCase().trim())
    .filter((tag) => tag.length > 0)
}

/**
 * Generate slug from filename or title
 */
function generateSlug(filename: string, title?: string): string {
  const base = title || filename.replace('.md', '')
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get all markdown files from the blog directory
 */
function getAllMarkdownFiles(): string[] {
  if (!fs.existsSync(CONFIG.blogDir)) {
    console.warn(`⚠️  Blog directory not found: ${CONFIG.blogDir}`)
    console.log('   Creating directory...')
    fs.mkdirSync(CONFIG.blogDir, { recursive: true })
    return []
  }

  return fs.readdirSync(CONFIG.blogDir).filter((file) => {
    return (
      file.endsWith('.md') &&
      file !== 'README.md' &&
      !file.startsWith('_') &&
      !file.startsWith('.')
    )
  })
}

/**
 * Parse a single markdown file into a BlogPost object
 */
function parseMarkdownFile(
  filename: string,
  stats: BuildStats,
): BlogPost | null {
  const filePath = path.join(CONFIG.blogDir, filename)

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)

    const trimmedContent = content.trim()

    // Generate or use provided values
    const slug = data.slug
      ? String(data.slug)
      : generateSlug(filename, data.title as string | undefined)
    const title = String(data.title || 'Untitled')
    const excerpt = data.excerpt
      ? String(data.excerpt)
      : generateExcerpt(trimmedContent)
    const publishDate = normalizeDate(data.publishDate)
    const category = String(data.category || 'Uncategorized')
    const tags = normalizeTags(data.tags)
    const readingTime = data.readingTime
      ? Number(data.readingTime)
      : calculateReadingTime(trimmedContent)

    // Track stats
    stats.categories.add(category)
    tags.forEach((tag) => stats.tags.add(tag))
    if (data.featured) stats.featured++

    const post: BlogPost = {
      slug,
      title,
      excerpt,
      content: trimmedContent,
      publishDate,
      category,
      tags,
      readingTime,
      featured: Boolean(data.featured),
    }

    // Optional fields
    if (data.coverImage) post.coverImage = String(data.coverImage)
    if (data.coverImageAlt) post.coverImageAlt = String(data.coverImageAlt)
    if (data.author) post.author = String(data.author)
    if (data.projectUrl) post.projectUrl = String(data.projectUrl)
    if (data.githubUrl) post.githubUrl = String(data.githubUrl)

    return post
  } catch (error) {
    const errorMsg = `Failed to parse ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`
    stats.errors.push(errorMsg)
    console.error(`   ❌ ${errorMsg}`)
    return null
  }
}

/**
 * Main build function
 */
function buildBlogPosts(): void {
  console.log('')
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║                    📝 Blog Build Script                    ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  console.log('')

  const startTime = Date.now()

  // Initialize stats
  const stats: BuildStats = {
    total: 0,
    featured: 0,
    categories: new Set(),
    tags: new Set(),
    errors: [],
  }

  // Get markdown files
  const files = getAllMarkdownFiles()
  console.log(`📂 Found ${files.length} markdown files in ${CONFIG.blogDir}`)
  console.log('')

  if (files.length === 0) {
    console.log('⚠️  No markdown files found. Creating empty blog-posts.json')
    fs.writeFileSync(CONFIG.outputFile, '[]')
    return
  }

  // Parse all files
  console.log('🔄 Processing files...')
  const posts = files
    .map((file) => {
      console.log(`   • ${file}`)
      return parseMarkdownFile(file, stats)
    })
    .filter((post): post is BlogPost => post !== null)
    .sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
    )

  stats.total = posts.length

  // Ensure output directory exists
  const outputDir = path.dirname(CONFIG.outputFile)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Write output
  fs.writeFileSync(CONFIG.outputFile, JSON.stringify(posts, null, 2))

  const duration = Date.now() - startTime

  // Print summary
  console.log('')
  console.log('┌────────────────────────────────────────────────────────────┐')
  console.log('│                        📊 Summary                          │')
  console.log('├────────────────────────────────────────────────────────────┤')
  console.log(`│  Total Posts:      ${String(stats.total).padEnd(40)}│`)
  console.log(`│  Featured:         ${String(stats.featured).padEnd(40)}│`)
  console.log(
    `│  Categories:       ${String(stats.categories.size).padEnd(40)}│`,
  )
  console.log(`│  Tags:             ${String(stats.tags.size).padEnd(40)}│`)
  console.log(`│  Errors:           ${String(stats.errors.length).padEnd(40)}│`)
  console.log(`│  Build Time:       ${String(duration + 'ms').padEnd(40)}│`)
  console.log('└────────────────────────────────────────────────────────────┘')
  console.log('')

  if (stats.errors.length > 0) {
    console.log('⚠️  Errors encountered:')
    stats.errors.forEach((err) => console.log(`   • ${err}`))
    console.log('')
  }

  console.log(`✅ Generated: ${CONFIG.outputFile}`)
  console.log('')
}

// Run the build
buildBlogPosts()
