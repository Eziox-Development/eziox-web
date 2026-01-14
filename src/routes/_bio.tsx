/**
 * Bio Page Layout
 * No Nav or Footer - this is the user's page
 */

import { createFileRoute, Outlet } from '@tanstack/react-router'
import { authMiddleware } from '@/server/functions/auth'

export const Route = createFileRoute('/_bio')({
  loader: async () => {
    const { currentUser } = await authMiddleware()
    return { currentUser }
  },
  component: BioLayout,
})

function BioLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  )
}
