import { createFileRoute } from '@tanstack/react-router'
import { siteConfig } from '@/lib/site-config'

export const Route = createFileRoute('/_api/rss')({
  server: {
    handlers: {
      GET: async () => {
        const baseUrl = siteConfig.metadata.url
        const buildDate = new Date().toUTCString()

        // Generate RSS feed for Eziox platform
        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.metadata.title} - Bio Link Platform</title>
    <link>${baseUrl}</link>
    <description>Create your bio link page and share all your content with one simple link.</description>
    <language>en</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/icon.png</url>
      <title>${siteConfig.metadata.title}</title>
      <link>${baseUrl}</link>
    </image>
    <copyright>Copyright ${new Date().getFullYear()} ${siteConfig.owner.name}</copyright>
    <category>Bio Links</category>
    <category>Social Media</category>
    <category>Creator Tools</category>
  </channel>
</rss>`

        return new Response(rss, {
          status: 200,
          headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
