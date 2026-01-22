import { getCurrentUser } from '@/server/functions/auth'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Nav, Footer } from '@/components/layout'

export const Route = createFileRoute('/_auth')({
  loader: async ({ location }) => {
    const currentUser = await getCurrentUser()

    if (currentUser && location.pathname !== '/sign-out') {
      throw redirect({ to: '/' })
    }

    return {
      currentUser,
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--background)' }}
    >
      <Nav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
