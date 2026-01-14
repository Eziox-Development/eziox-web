import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import * as TanstackQuery from './integrations/tanstack-query/root-provider'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { ErrorComponent } from './components/error-component'
import { NotFoundComponent } from './components/not-found-component'

/**
 * Creates and configures the application router with:
 * - TanStack Query integration for data fetching
 * - SSR support with query hydration
 * - Intent-based preloading for better UX
 * - Global error boundary with custom error component
 */
export const getRouter = () => {
  // Get TanStack Query context for SSR and client-side data fetching
  const rqContext = TanstackQuery.getContext()

  // Configure router with all necessary providers and settings
  const router = createRouter({
    routeTree,
    context: { ...rqContext },

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
        <TanstackQuery.Provider {...rqContext}>
          {props.children}
        </TanstackQuery.Provider>
      )
    },
  })

  // Setup SSR query integration for proper hydration
  setupRouterSsrQueryIntegration({
    router,
    queryClient: rqContext.queryClient,
  })

  return router
}
