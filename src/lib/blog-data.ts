/**
 * Blog Data Module
 * Client-side blog system with pre-built JSON data.
 *
 * This module provides all the helper functions needed to query,
 * filter, and display blog posts throughout the application.
 */

import blogPostsData from './blog-posts.json'

// ============================================================================
// Types
// ============================================================================

export interface BlogPost {
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

export interface CategoryInfo {
  name: string
  count: number
  slug: string
}

export interface TagInfo {
  name: string
  count: number
  slug: string
}

export interface BlogStats {
  totalPosts: number
  totalCategories: number
  totalTags: number
  featuredPosts: number
  totalReadingTime: number
}

// ============================================================================
// Data
// ============================================================================

export const blogPosts: BlogPost[] = blogPostsData as BlogPost[]

// ============================================================================
// Formatting Helpers
// ============================================================================

/**
 * Format a date string to a human-readable format
 */
export function formatDate(
  dateString: string,
  locale: string = 'en-US',
): string {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format a date to relative time (e.g., "2 days ago")
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  return `${Math.floor(diffInDays / 365)} years ago`
}

/**
 * Generate a URL-safe slug from a string
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get all posts, optionally from a custom source
 */
export function getAllPosts(posts?: BlogPost[]): BlogPost[] {
  return posts ?? blogPosts
}

/**
 * Get featured posts (limited to 3 by default)
 */
export function getFeaturedPosts(
  limit: number = 3,
  posts?: BlogPost[],
): BlogPost[] {
  const source = posts ?? blogPosts
  return source.filter((post) => post.featured).slice(0, limit)
}

/**
 * Get a single post by its slug
 */
export function getPostBySlug(
  slug: string,
  posts?: BlogPost[],
): BlogPost | undefined {
  const source = posts ?? blogPosts
  return source.find((post) => post.slug === slug)
}

/**
 * Normalize a string for comparison (lowercase, replace spaces/hyphens)
 */
function normalizeForComparison(text: string): string {
  return text.toLowerCase().replace(/[\s-]+/g, '-')
}

/**
 * Get posts by category (case-insensitive, handles spaces and hyphens)
 */
export function getPostsByCategory(
  category: string,
  posts?: BlogPost[],
): BlogPost[] {
  const source = posts ?? blogPosts
  const searchCategory = normalizeForComparison(category)
  return source.filter(
    (post) => normalizeForComparison(post.category) === searchCategory,
  )
}

/**
 * Get posts by tag (case-insensitive, handles spaces and hyphens)
 */
export function getPostsByTag(tag: string, posts?: BlogPost[]): BlogPost[] {
  const source = posts ?? blogPosts
  const searchTag = normalizeForComparison(tag)
  return source.filter((post) =>
    post.tags.some((t) => normalizeForComparison(t) === searchTag),
  )
}

/**
 * Get posts by author
 */
export function getPostsByAuthor(
  author: string,
  posts?: BlogPost[],
): BlogPost[] {
  const source = posts ?? blogPosts
  const searchAuthor = author.toLowerCase()
  return source.filter((post) => post.author?.toLowerCase() === searchAuthor)
}

/**
 * Get recent posts (sorted by date, newest first)
 */
export function getRecentPosts(
  limit: number = 5,
  posts?: BlogPost[],
): BlogPost[] {
  const source = posts ?? blogPosts
  return [...source]
    .sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
    )
    .slice(0, limit)
}

/**
 * Get related posts based on category and tags
 */
export function getRelatedPosts(
  post: BlogPost,
  limit: number = 3,
  posts?: BlogPost[],
): BlogPost[] {
  const source = posts ?? blogPosts

  return source
    .filter((p) => p.slug !== post.slug)
    .map((p) => {
      let score = 0
      // Same category = 3 points
      if (p.category.toLowerCase() === post.category.toLowerCase()) score += 3
      // Each matching tag = 1 point
      const matchingTags = p.tags.filter((tag) =>
        post.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
      )
      score += matchingTags.length
      return { post: p, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => post)
}

/**
 * Get next and previous posts for navigation
 */
export function getAdjacentPosts(
  slug: string,
  posts?: BlogPost[],
): { prev?: BlogPost; next?: BlogPost } {
  const source = posts ?? blogPosts
  const sortedPosts = [...source].sort(
    (a, b) =>
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
  )
  const currentIndex = sortedPosts.findIndex((p) => p.slug === slug)

  return {
    prev:
      currentIndex < sortedPosts.length - 1
        ? sortedPosts[currentIndex + 1]
        : undefined,
    next: currentIndex > 0 ? sortedPosts[currentIndex - 1] : undefined,
  }
}

// ============================================================================
// Aggregation Functions
// ============================================================================

/**
 * Get all unique categories
 */
export function getAllCategories(posts?: BlogPost[]): string[] {
  const source = posts ?? blogPosts
  return [...new Set(source.map((post) => post.category))]
}

/**
 * Get all unique tags
 */
export function getAllTags(posts?: BlogPost[]): string[] {
  const source = posts ?? blogPosts
  return [...new Set(source.flatMap((post) => post.tags))]
}

/**
 * Get categories with post counts
 */
export function getCategoriesWithCount(posts?: BlogPost[]): CategoryInfo[] {
  const source = posts ?? blogPosts
  const categoryMap = new Map<string, number>()

  source.forEach((post) => {
    const count = categoryMap.get(post.category) || 0
    categoryMap.set(post.category, count + 1)
  })

  return Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count, slug: toSlug(name) }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Get tags with post counts
 */
export function getTagsWithCount(posts?: BlogPost[]): TagInfo[] {
  const source = posts ?? blogPosts
  const tagMap = new Map<string, number>()

  source.forEach((post) => {
    post.tags.forEach((tag) => {
      const count = tagMap.get(tag) || 0
      tagMap.set(tag, count + 1)
    })
  })

  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count, slug: toSlug(name) }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Get posts grouped by year
 */
export function getPostsByYear(posts?: BlogPost[]): Record<string, BlogPost[]> {
  const source = posts ?? blogPosts
  const postsByYear: Record<string, BlogPost[]> = {}

  for (const post of source) {
    const year = new Date(post.publishDate).getFullYear().toString()
    if (!postsByYear[year]) {
      postsByYear[year] = []
    }
    postsByYear[year].push(post)
  }

  // Sort years descending
  return Object.fromEntries(
    Object.entries(postsByYear).sort(([a], [b]) => Number(b) - Number(a)),
  )
}

/**
 * Get posts grouped by month within a year
 */
export function getPostsByMonth(
  year: number,
  posts?: BlogPost[],
): Record<string, BlogPost[]> {
  const source = posts ?? blogPosts
  const postsByMonth: Record<string, BlogPost[]> = {}
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  source
    .filter((post) => new Date(post.publishDate).getFullYear() === year)
    .forEach((post) => {
      const month = months[new Date(post.publishDate).getMonth()] ?? 'Unknown'
      if (!postsByMonth[month]) {
        postsByMonth[month] = []
      }
      postsByMonth[month].push(post)
    })

  return postsByMonth
}

// ============================================================================
// Search Functions
// ============================================================================

/**
 * Search posts by query string
 */
export function searchPosts(query: string, posts?: BlogPost[]): BlogPost[] {
  const source = posts ?? blogPosts
  const lowerQuery = query.toLowerCase().trim()

  if (!lowerQuery) return []

  return source.filter(
    (post) =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.excerpt.toLowerCase().includes(lowerQuery) ||
      post.content.toLowerCase().includes(lowerQuery) ||
      post.category.toLowerCase().includes(lowerQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      post.author?.toLowerCase().includes(lowerQuery),
  )
}

/**
 * Advanced search with multiple filters
 */
export function advancedSearch(
  options: {
    query?: string
    category?: string
    tags?: string[]
    author?: string
    fromDate?: string
    toDate?: string
    featured?: boolean
  },
  posts?: BlogPost[],
): BlogPost[] {
  let results = posts ?? blogPosts

  if (options.query) {
    const lowerQuery = options.query.toLowerCase()
    results = results.filter(
      (post) =>
        post.title.toLowerCase().includes(lowerQuery) ||
        post.excerpt.toLowerCase().includes(lowerQuery) ||
        post.content.toLowerCase().includes(lowerQuery),
    )
  }

  if (options.category) {
    const lowerCategory = options.category.toLowerCase()
    results = results.filter(
      (post) => post.category.toLowerCase() === lowerCategory,
    )
  }

  if (options.tags && options.tags.length > 0) {
    const lowerTags = options.tags.map((t) => t.toLowerCase())
    results = results.filter((post) =>
      lowerTags.some((tag) => post.tags.some((t) => t.toLowerCase() === tag)),
    )
  }

  if (options.author) {
    const lowerAuthor = options.author.toLowerCase()
    results = results.filter(
      (post) => post.author?.toLowerCase() === lowerAuthor,
    )
  }

  if (options.fromDate) {
    const fromTime = new Date(options.fromDate).getTime()
    results = results.filter(
      (post) => new Date(post.publishDate).getTime() >= fromTime,
    )
  }

  if (options.toDate) {
    const toTime = new Date(options.toDate).getTime()
    results = results.filter(
      (post) => new Date(post.publishDate).getTime() <= toTime,
    )
  }

  if (options.featured !== undefined) {
    results = results.filter((post) => post.featured === options.featured)
  }

  return results
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Get blog statistics
 */
export function getBlogStats(posts?: BlogPost[]): BlogStats {
  const source = posts ?? blogPosts

  return {
    totalPosts: source.length,
    totalCategories: new Set(source.map((p) => p.category)).size,
    totalTags: new Set(source.flatMap((p) => p.tags)).size,
    featuredPosts: source.filter((p) => p.featured).length,
    totalReadingTime: source.reduce((sum, p) => sum + p.readingTime, 0),
  }
}
