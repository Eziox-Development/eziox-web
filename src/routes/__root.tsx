import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from '@/components/ui/sonner'
import { CookieConsent } from '@/components/CookieConsent'
import { ThemeProvider as PortfolioThemeProvider } from '@/components/layout/ThemeProvider'
import { siteConfig } from '@/lib/site-config'
import { authMiddleware } from '@/server/functions/auth'

interface MyRouterContext {
  queryClient: QueryClient
}

const scripts: React.DetailedHTMLProps<
  React.ScriptHTMLAttributes<HTMLScriptElement>,
  HTMLScriptElement
>[] = []

if (import.meta.env.VITE_INSTRUMENTATION_SCRIPT_SRC) {
  scripts.push({
    src: import.meta.env.VITE_INSTRUMENTATION_SCRIPT_SRC,
    type: 'module',
  })
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  loader: async () => {
    const { currentUser } = await authMiddleware()

    return {
      currentUser,
    }
  },
  head: () => {
    const siteUrl = siteConfig.metadata.url
    const title = `${siteConfig.metadata.title} - Bio Link Platform for Creators`
    const description = siteConfig.metadata.description
    const ogImage = `${siteUrl}/eziox.png`

    const meta = [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, viewport-fit=cover',
      },
      { title },
      { name: 'description', content: description },
      // Theme & PWA
      { name: 'theme-color', content: '#8b5cf6' },
      { name: 'color-scheme', content: 'dark' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'black-translucent',
      },
      { name: 'apple-mobile-web-app-title', content: 'Eziox' },
      { name: 'application-name', content: 'Eziox' },
      { name: 'msapplication-TileColor', content: '#8b5cf6' },
      // SEO
      {
        name: 'robots',
        content:
          'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      },
      { name: 'author', content: 'Saito' },
      { name: 'creator', content: 'Eziox Development' },
      { name: 'publisher', content: 'Eziox' },
      { name: 'generator', content: 'TanStack Start' },
      {
        name: 'keywords',
        content:
          'bio link, link in bio, linktree alternative, creator tools, social media links, portfolio, personal page, streamer, vtuber, content creator',
      },
      { name: 'category', content: 'Technology' },
      // Canonical URL
      { name: 'canonical', content: siteUrl },
      // Open Graph
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: siteUrl },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:site_name', content: 'Eziox' },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:image', content: ogImage },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:type', content: 'image/png' },
      {
        property: 'og:image:alt',
        content: 'Eziox - The modern bio link platform for creators',
      },
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@eziox' },
      { name: 'twitter:creator', content: '@eziox' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: ogImage },
      {
        name: 'twitter:image:alt',
        content: 'Eziox - The modern bio link platform for creators',
      },
      // Discord
      { name: 'theme-color', content: '#8b5cf6' },
      // Additional SEO
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'referrer', content: 'origin-when-cross-origin' },
    ]

    const links: {
      rel: string
      href: string
      type?: string
      title?: string
      sizes?: string
    }[] = [
      { rel: 'stylesheet', href: appCss },
      { rel: 'canonical', href: siteUrl },
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: 'Eziox RSS Feed',
        href: '/rss',
      },
      { rel: 'sitemap', type: 'application/xml', href: '/sitemap.xml' },
      { rel: 'manifest', href: '/site.webmanifest' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com' },
      { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: 'https://res.cloudinary.com' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
    ]

    return {
      meta,
      links,
      scripts: [...scripts],
    }
  },

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang={siteConfig.metadata.language} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <PortfolioThemeProvider>
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
          </div>
          <Toaster position="bottom-right" richColors closeButton />
          <CookieConsent />
          <Analytics />
        </PortfolioThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
