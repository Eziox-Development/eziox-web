import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import devtoolsJson from 'vite-plugin-devtools-json'
import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin'

const isDev = process.env.NODE_ENV !== 'production'
const deployTarget = process.env.DEPLOY_TARGET || 'vercel'

const config = defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    nitroV2Plugin({
      compatibilityDate: '2025-10-08',
      preset: deployTarget === 'node' ? 'node' : 'vercel',
    }),
    devtoolsJson(),
    viteReact(),
  ],
  server: {
    host: '::',
    port: 5173,
    strictPort: false,
    allowedHosts: true,
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: false,
    },
  },
  preview: {
    host: '::',
    port: 4173,
    strictPort: false,
  },
  build: {
    target: 'esnext',
    sourcemap: isDev ? 'inline' : true,
    minify: isDev ? false : 'esbuild',
    cssMinify: !isDev,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // React DOM - separate for better caching
            if (id.includes('react-dom')) {
              return 'react-dom'
            }
            // React core only (not react-dom, not other react-* packages)
            if (
              id.includes('/react/') ||
              id.includes('react/index') ||
              id.includes('react/jsx')
            ) {
              return 'react-core'
            }
            // Charts - large, lazy load
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'charts-vendor'
            }
            // TanStack Router
            if (
              id.includes('@tanstack/react-router') ||
              id.includes('@tanstack/router')
            ) {
              return 'tanstack-router'
            }
            // TanStack Query
            if (
              id.includes('@tanstack/react-query') ||
              id.includes('@tanstack/query')
            ) {
              return 'tanstack-query'
            }
            // Other TanStack
            if (id.includes('@tanstack')) {
              return 'tanstack-vendor'
            }
            // Motion/animation library
            if (id.includes('motion') || id.includes('framer-motion')) {
              return 'motion-vendor'
            }
            // Radix UI components - split by category
            if (id.includes('@radix-ui')) {
              return 'radix-vendor'
            }
            // Form/validation
            if (
              id.includes('zod') ||
              id.includes('react-hook-form') ||
              id.includes('@hookform')
            ) {
              return 'form-vendor'
            }
            // UI utilities
            if (
              id.includes('lucide-react') ||
              id.includes('class-variance-authority') ||
              id.includes('clsx') ||
              id.includes('tailwind-merge') ||
              id.includes('cmdk')
            ) {
              return 'ui-vendor'
            }
            // Date utilities
            if (id.includes('date-fns')) {
              return 'date-vendor'
            }
            // Stripe
            if (id.includes('stripe')) {
              return 'stripe-vendor'
            }
          }
          return undefined
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
  optimizeDeps: {
    exclude: ['react', 'react-dom'],
    include: [
      '@tanstack/react-router',
      '@tanstack/react-query',
      'lucide-react',
    ],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})

export default config
