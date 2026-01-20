import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/hooks/use-auth'
import { ProfileDashboard, ProfileDashboardLoader } from '@/components/profile'

export const Route = createFileRoute('/_protected/profile')({
  head: () => ({
    meta: [
      { title: 'Dashboard | Eziox' },
      { name: 'description', content: 'Manage your Eziox profile, links, and settings' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ProfilePage,
})

function ProfilePage() {
  const { currentUser } = useAuth()

  if (!currentUser) {
    return <ProfileDashboardLoader />
  }

  return <ProfileDashboard currentUser={currentUser as Parameters<typeof ProfileDashboard>[0]['currentUser']} />
}
