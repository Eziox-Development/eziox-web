import { createFileRoute } from '@tanstack/react-router'
import { siteConfig } from '@/lib/site-config'

export const Route = createFileRoute('/_api/sitemap')({
  server: {
    handlers: {
      GET: async () => {
        const baseUrl = siteConfig.metadata.url
        const currentDate = new Date().toISOString()

        // Static pages for Eziox platform
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
            url: '/leaderboard',
            changefreq: 'daily',
            priority: '0.8',
            lastmod: currentDate,
          },
          {
            url: '/sign-in',
            changefreq: 'monthly',
            priority: '0.6',
            lastmod: currentDate,
          },
          {
            url: '/sign-up',
            changefreq: 'monthly',
            priority: '0.9',
            lastmod: currentDate,
          },
        ]

        // Generate sitemap XML
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
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
