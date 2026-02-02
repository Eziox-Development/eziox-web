import { createFileRoute } from '@tanstack/react-router'
import { siteConfig } from '@/lib/site-config'

export const Route = createFileRoute('/_api/sitemap')({
  server: {
    handlers: {
      GET: async () => {
        const baseUrl = siteConfig.metadata.url
        const currentDate = new Date().toISOString()

        // Only PUBLIC pages that should be indexed by search engines
        // DO NOT include: auth pages, protected pages, API routes, admin pages
        const publicPages = [
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
            url: '/leaderboard',
            changefreq: 'daily',
            priority: '0.8',
            lastmod: currentDate,
          },
          // Documentation pages (public knowledge base)
          {
            url: '/docs',
            changefreq: 'weekly',
            priority: '0.8',
            lastmod: currentDate,
          },
          {
            url: '/docs/getting-started',
            changefreq: 'monthly',
            priority: '0.7',
            lastmod: currentDate,
          },
          {
            url: '/docs/customization',
            changefreq: 'monthly',
            priority: '0.7',
            lastmod: currentDate,
          },
          {
            url: '/docs/analytics',
            changefreq: 'monthly',
            priority: '0.7',
            lastmod: currentDate,
          },
          {
            url: '/docs/api',
            changefreq: 'monthly',
            priority: '0.7',
            lastmod: currentDate,
          },
          {
            url: '/docs/premium',
            changefreq: 'monthly',
            priority: '0.7',
            lastmod: currentDate,
          },
          {
            url: '/docs/spotify-integration',
            changefreq: 'monthly',
            priority: '0.6',
            lastmod: currentDate,
          },
          {
            url: '/docs/security',
            changefreq: 'monthly',
            priority: '0.7',
            lastmod: currentDate,
          },
          {
            url: '/docs/faq',
            changefreq: 'monthly',
            priority: '0.7',
            lastmod: currentDate,
          },
          // Legal pages
          {
            url: '/terms',
            changefreq: 'monthly',
            priority: '0.3',
            lastmod: currentDate,
          },
          {
            url: '/privacy',
            changefreq: 'monthly',
            priority: '0.3',
            lastmod: currentDate,
          },
          {
            url: '/imprint',
            changefreq: 'yearly',
            priority: '0.2',
            lastmod: currentDate,
          },
        ]

        // Generate sitemap XML
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicPages
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
