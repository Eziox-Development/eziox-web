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
    target: 'es2022',
    sourcemap: isDev ? 'inline' : true,
    minify: isDev ? false : 'esbuild',
    cssMinify: !isDev,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            if (
              id.includes('@tanstack/react-router') ||
              id.includes('@tanstack/react-query')
            ) {
              return 'tanstack-vendor'
            }
            if (
              id.includes('lucide-react') ||
              id.includes('class-variance-authority') ||
              id.includes('clsx') ||
              id.includes('tailwind-merge')
            ) {
              return 'ui-vendor'
            }
          }
          return undefined
        },
      },
    },
    chunkSizeWarningLimit: 1000,
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
