import { createFileRoute } from '@tanstack/react-router'
import { blogPosts, getAllCategories, getAllTags } from '@/lib/blog-data'
import { siteConfig } from '@/lib/site-config'

export const Route = createFileRoute('/_api/sitemap')({
  server: {
    handlers: {
      GET: async () => {
        const baseUrl = siteConfig.metadata.url
        const currentDate = new Date().toISOString()

        // Static pages
        const staticPages = [
          {
            url: '',
            changefreq: 'daily',
            priority: '1.0',
            lastmod: currentDate,
          },
          {
            url: '/about',
            changefreq: 'monthly',
            priority: '0.8',
            lastmod: currentDate,
          },
          {
            url: '/archive',
            changefreq: 'daily',
            priority: '0.9',
            lastmod: currentDate,
          },
        ]

        // Blog posts
        const blogUrls = blogPosts.map((post) => ({
          url: `/blog/${post.slug}`,
          lastmod: new Date(post.publishDate).toISOString(),
          changefreq: 'monthly',
          priority: post.featured ? '0.9' : '0.7',
        }))

        // Categories
        const categories = getAllCategories()
        const categoryUrls = categories.map((category) => {
          const slug = category.toLowerCase().replace(/\s+/g, '-')
          return {
            url: `/category/${slug}`,
            lastmod: currentDate,
            changefreq: 'weekly',
            priority: '0.6',
          }
        })

        // Tags
        const tags = getAllTags()
        const tagUrls = tags.map((tag) => {
          const slug = tag.toLowerCase().replace(/\s+/g, '-')
          return {
            url: `/tag/${slug}`,
            lastmod: currentDate,
            changefreq: 'weekly',
            priority: '0.5',
          }
        })

        // Combine all URLs
        const allUrls = [
          ...staticPages,
          ...blogUrls,
          ...categoryUrls,
          ...tagUrls,
        ]

        // Generate sitemap XML
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    ({ url, lastmod, changefreq, priority }) => `  <url>
    <loc>${baseUrl}${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`

        return new Response(sitemap, {
          status: 200,
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
