import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface DocMeta {
  slug: string
  title: string
  description: string
  category: string
  icon: string
  order: number
}

export interface Doc extends DocMeta {
  content: string
}

const DOCS_DIR = path.join(process.cwd(), 'content', 'docs')

function getDocsDirectory(): string {
  // Handle different environments
  if (fs.existsSync(DOCS_DIR)) {
    return DOCS_DIR
  }
  // Fallback for production builds
  const altPath = path.join(process.cwd(), '..', 'content', 'docs')
  if (fs.existsSync(altPath)) {
    return altPath
  }
  return DOCS_DIR
}

export const getDocsFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<DocMeta[]> => {
    const docsDir = getDocsDirectory()

    if (!fs.existsSync(docsDir)) {
      return []
    }

    const files = fs.readdirSync(docsDir).filter((f) => f.endsWith('.md'))

    const docs: DocMeta[] = files.map((filename) => {
      const filePath = path.join(docsDir, filename)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data } = matter(fileContent)

      return {
        slug: filename.replace('.md', ''),
        title: data.title || filename.replace('.md', ''),
        description: data.description || '',
        category: data.category || 'General',
        icon: data.icon || 'FileText',
        order: data.order || 99,
      }
    })

    // Sort by order, then by title
    return docs.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
      return a.title.localeCompare(b.title)
    })
  },
)

export const getDocBySlugFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data: input }): Promise<Doc | null> => {
    const { slug } = input
    const docsDir = getDocsDirectory()
    const filePath = path.join(docsDir, `${slug}.md`)

    if (!fs.existsSync(filePath)) {
      return null
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data: frontmatter, content } = matter(fileContent)

    return {
      slug,
      title: (frontmatter.title as string) || slug,
      description: (frontmatter.description as string) || '',
      category: (frontmatter.category as string) || 'General',
      icon: (frontmatter.icon as string) || 'FileText',
      order: (frontmatter.order as number) || 99,
      content,
    }
  })

export const getDocCategoriesFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<string[]> => {
    const docs = await getDocsFn()
    const categories = [...new Set(docs.map((d) => d.category))]
    return categories.sort()
  },
)
