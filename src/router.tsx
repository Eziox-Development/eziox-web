import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './lib/license-guard'
import { ErrorComponent } from './components/error-component'
import { NotFoundComponent } from './components/not-found-component'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

/**
 * Creates and configures the application router with:
 * - TanStack Query integration for data fetching
 * - SSR support with query hydration
 * - Intent-based preloading for better UX
 * - Global error boundary with custom error component
 */
export const getRouter = () => {
  const queryClient = new QueryClient()

  // Configure router with all necessary providers and settings
  const router = createRouter({
    routeTree,
    context: { queryClient },

    // Preload routes on hover/focus for instant navigation
    defaultPreload: 'intent',

    // Preload delay for better performance
    defaultPreloadDelay: 100,

    // Global error boundary
    defaultErrorComponent: ({ error, info, reset }) => (
      <ErrorComponent error={error} info={info} reset={reset} />
    ),

    // Global 404 page
    defaultNotFoundComponent: () => <NotFoundComponent />,

    // Wrap all routes with TanStack Query provider
    Wrap: (props: { children: React.ReactNode }) => {
      return (
        <QueryClientProvider client={queryClient}>
          {props.children}
        </QueryClientProvider>
      )
    },
  })

  // Setup SSR query integration for proper hydration
  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return router
}
