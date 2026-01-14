import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider as PortfolioThemeProvider } from '@/components/portfolio/ThemeProvider'
import { markdownStyles } from '@/components/portfolio/MarkdownContent'
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
    const meta = [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, viewport-fit=cover',
      },
      { title: siteConfig.metadata.title },
      { name: 'description', content: siteConfig.metadata.description },
      // Theme & PWA
      { name: 'theme-color', content: '#0a0a0a' },
      { name: 'color-scheme', content: 'dark light' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'black-translucent',
      },
      // SEO
      { name: 'robots', content: 'index, follow' },
      { name: 'author', content: 'Saito' },
      { name: 'generator', content: 'TanStack Start' },
      // Open Graph
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: siteConfig.metadata.title },
      { property: 'og:description', content: siteConfig.metadata.description },
      { property: 'og:site_name', content: siteConfig.metadata.title },
      { property: 'og:locale', content: siteConfig.metadata.language || 'en' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: siteConfig.metadata.title },
      { name: 'twitter:description', content: siteConfig.metadata.description },
    ]

    const links: {
      rel: string
      href: string
      type?: string
      title?: string
      sizes?: string
    }[] = [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: `${siteConfig.metadata.title} RSS Feed`,
        href: '/rss',
      },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
    ]

    if (siteConfig.metadata.icon) {
      links.push(
        { rel: 'icon', type: 'image/png', href: siteConfig.metadata.icon },
        { rel: 'apple-touch-icon', href: siteConfig.metadata.icon },
      )
    }

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
        <style dangerouslySetInnerHTML={{ __html: markdownStyles }} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <PortfolioThemeProvider>
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
          </div>
          <Toaster position="bottom-right" richColors closeButton />
        </PortfolioThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
