import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@roomi/ui'
import {
  Home01Icon,
  FavouriteIcon,
  Message01Icon,
  UserIcon,
  DashboardSpeed01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useAuthStore } from '@/lib/store/auth-store'
import { useUnreadMessageCount } from '@/hooks/useChat'
import { useUnseenMatchCount } from '@/hooks/useMatches'

const seekerNavItems = [
  { path: '/', icon: Home01Icon, label: 'nav.feed' },
  { path: '/matches', icon: FavouriteIcon, label: 'nav.matches' },
  { path: '/messages', icon: Message01Icon, label: 'nav.messages' },
  { path: '/profile', icon: UserIcon, label: 'nav.profile' },
]

const hostNavItems = [
  { path: '/', icon: FavouriteIcon, label: 'host.newLikes' },
  { path: '/host', icon: DashboardSpeed01Icon, label: 'host.dashboard' },
  { path: '/messages', icon: Message01Icon, label: 'nav.messages' },
  { path: '/profile', icon: UserIcon, label: 'nav.profile' },
]

interface BottomNavProps {
  transparent?: boolean
}

export function BottomNav({ transparent = false }: BottomNavProps) {
  const { t } = useTranslation()
  const { activeMode, isAuthenticated } = useAuthStore()
  const messageUnread = useUnreadMessageCount()
  const unseenMatches = useUnseenMatchCount()
  const navItems = isAuthenticated && activeMode === 'host' ? hostNavItems : seekerNavItems

  const getBadgeCount = (path: string): number => {
    if (path === '/matches') return unseenMatches
    if (path === '/messages') return messageUnread
    return 0
  }

  return (
    <nav
      className={cn(
        'fixed bottom-0 inset-x-0 z-50 pb-[env(safe-area-inset-bottom)]',
        'transition-colors duration-200',
        transparent
          ? 'bg-black/40 backdrop-blur-lg border-t border-white/10'
          : 'bg-background border-t border-border'
      )}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ path, icon, label }) => {
          const badgeCount = getBadgeCount(path)

          return (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center w-full h-full',
                  'text-xs transition-colors gap-1',
                  transparent
                    ? isActive
                      ? 'text-white'
                      : 'text-white/60 hover:text-white/80'
                    : isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <HugeiconsIcon
                      icon={icon}
                      size={24}
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                    {badgeCount > 0 ? (
                      <span className="absolute -top-1.5 -end-2 min-w-[18px] h-[18px] rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-semibold flex items-center justify-center px-1 shadow-sm ring-2 ring-background">
                        {badgeCount > 99 ? '99+' : badgeCount}
                      </span>
                    ) : null}
                  </div>
                  <span className="font-medium">{t(label)}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
