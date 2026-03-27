import { PropertyFeed, SeekerFeed } from '@/features/feed'
import { useAuthStore } from '@/lib/store'

export function FeedPage() {
  const { user, activeMode, isAuthenticated } = useAuthStore()

  // Show SeekerFeed for hosts in host mode
  const showSeekerFeed = isAuthenticated && user?.is_host && activeMode === 'host'

  return (
    <div className="fixed inset-0 overflow-hidden">
      {showSeekerFeed ? <SeekerFeed /> : <PropertyFeed />}
    </div>
  )
}
