import { createFileRoute } from '@tanstack/react-router'
import { blogPosts } from '@/lib/blog-data'
import { siteConfig } from '@/lib/site-config'

export const Route = createFileRoute('/_api/rss')({
  server: {
    handlers: {
      GET: async () => {
        const baseUrl = siteConfig.metadata.url
        const buildDate = new Date().toUTCString()

        // Sort posts by date (newest first)
        const sortedPosts = [...blogPosts].sort(
          (a, b) =>
            new Date(b.publishDate).getTime() -
            new Date(a.publishDate).getTime(),
        )

        // Escape XML special characters
        const escapeXml = (text: string) => {
          return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')
        }

        // Generate RSS items
        const items = sortedPosts
          .map((post) => {
            const postUrl = `${baseUrl}/blog/${post.slug}`
            const pubDate = new Date(post.publishDate).toUTCString()

            const title = escapeXml(post.title)
            const author = escapeXml(post.author || siteConfig.owner.name)
            const category = escapeXml(post.category)

            return `
    <item>
      <title>${title}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${siteConfig.owner.email} (${author})</author>
      <category>${category}</category>
      <description><![CDATA[${post.excerpt}]]></description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
      ${post.coverImage ? `<enclosure url="${baseUrl}${post.coverImage}" type="image/jpeg" />` : ''}
      ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join('\n      ')}
    </item>`
          })
          .join('\n')

        // Generate RSS feed
        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.metadata.title}</title>
    <link>${baseUrl}</link>
    <description>${siteConfig.metadata.description}</description>
    <language>en</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/saito.png</url>
      <title>${siteConfig.metadata.title}</title>
      <link>${baseUrl}</link>
    </image>
    <copyright>Copyright ${new Date().getFullYear()} ${siteConfig.owner.name}</copyright>
    <managingEditor>${siteConfig.owner.email} (${siteConfig.owner.name})</managingEditor>
    <webMaster>${siteConfig.owner.email} (${siteConfig.owner.name})</webMaster>
    <category>Technology</category>
    <category>Web Development</category>
    <category>Programming</category>
    ${items}
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
