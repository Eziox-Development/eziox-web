import { createFileRoute, Outlet } from '@tanstack/react-router'
import { authMiddleware } from '@/server/functions/auth'
import { Nav, Footer, ScrollToTop } from '@/components/layout'

export const Route = createFileRoute('/_public')({
  loader: async () => {
    const { currentUser } = await authMiddleware()

    return {
      currentUser,
    }
  },
  component: PublicLayout,
})

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Nav />
      <main className="flex-1 relative">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
