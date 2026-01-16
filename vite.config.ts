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
            // React core - largest chunk, split separately
            if (id.includes('react-dom')) {
              return 'react-dom'
            }
            if (id.includes('react') && !id.includes('react-dom')) {
              return 'react-vendor'
            }
            // TanStack ecosystem
            if (id.includes('@tanstack/react-router')) {
              return 'tanstack-router'
            }
            if (id.includes('@tanstack/react-query')) {
              return 'tanstack-query'
            }
            if (id.includes('@tanstack')) {
              return 'tanstack-vendor'
            }
            // Motion/animation library
            if (id.includes('motion')) {
              return 'motion-vendor'
            }
            // UI utilities
            if (
              id.includes('lucide-react') ||
              id.includes('class-variance-authority') ||
              id.includes('clsx') ||
              id.includes('tailwind-merge')
            ) {
              return 'ui-vendor'
            }
            // Radix UI components
            if (id.includes('@radix-ui')) {
              return 'radix-vendor'
            }
            // Form/validation
            if (id.includes('zod') || id.includes('react-hook-form')) {
              return 'form-vendor'
            }
            // Date utilities
            if (id.includes('date-fns')) {
              return 'date-vendor'
            }
          }
          return undefined
        },
      },
    },
    chunkSizeWarningLimit: 600,
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
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
})

export default config
