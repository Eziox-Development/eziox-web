import { createFileRoute, Outlet, redirect, useLocation } from '@tanstack/react-router'
import { authMiddleware } from '@/server/functions/auth'
import { Nav, Footer, ScrollToTop } from '@/components/layout'

export const Route = createFileRoute('/_protected')({
  loader: async ({ location }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      if (
        location.pathname !== '/sign-in' &&
        location.pathname !== '/sign-up'
      ) {
        throw redirect({ to: '/sign-in', search: { redirect: location.href } })
      }
    }

    return {
      currentUser,
    }
  },
  component: ProtectedLayout,
})

const FULL_SCREEN_ROUTES = ['/playground', '/profile']

function ProtectedLayout() {
  const { pathname } = useLocation()
  const isFullScreen = FULL_SCREEN_ROUTES.some((r) => pathname.startsWith(r))

  if (isFullScreen) {
    return <Outlet />
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
