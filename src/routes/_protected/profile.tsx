import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/hooks/use-auth'
import { ProfileDashboard, ProfileDashboardLoader } from '@/components/profile'
import type { TabType } from '@/components/profile/types'

const validTabs: TabType[] = [
  'profile',
  'links',
  'referrals',
  'badges',
  'subscription',
  'customization',
  'creator',
  'api',
  'settings',
  'privacy',
]

export const Route = createFileRoute('/_protected/profile')({
  validateSearch: (search: Record<string, unknown>): { tab?: TabType } => {
    const tab = search.tab as string | undefined
    return {
      tab:
        tab && validTabs.includes(tab as TabType)
          ? (tab as TabType)
          : undefined,
    }
  },
  head: () => ({
    meta: [
      { title: 'Dashboard | Eziox' },
      {
        name: 'description',
        content: 'Manage your Eziox profile, links, and settings',
      },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ProfilePage,
})

function ProfilePage() {
  const { currentUser } = useAuth()
  const { tab } = Route.useSearch()

  if (!currentUser) {
    return <ProfileDashboardLoader />
  }

  return (
    <ProfileDashboard
      currentUser={
        currentUser as Parameters<typeof ProfileDashboard>[0]['currentUser']
      }
      initialTab={tab}
    />
  )
}
