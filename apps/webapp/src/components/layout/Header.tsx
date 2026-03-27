import { useTranslation } from 'react-i18next'
import { cn } from '@roomi/ui'
import { Button } from '@roomi/ui'
import { useAuthStore, useUIStore } from '@/lib/store'
import { localeNames, type Locale } from '@/i18n/config'

interface HeaderProps {
  title?: string
  showAuth?: boolean
  transparent?: boolean
  className?: string
  leftElement?: React.ReactNode
  rightElement?: React.ReactNode
}

export function Header({
  title,
  showAuth = true,
  transparent = false,
  className,
  leftElement,
  rightElement,
}: HeaderProps) {
  const { t, i18n } = useTranslation()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { openLoginModal } = useUIStore()

  const currentLocale = i18n.language as Locale
  const otherLocale: Locale = currentLocale === 'he' ? 'en' : 'he'

  const toggleLanguage = () => {
    i18n.changeLanguage(otherLocale)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 px-4 flex items-center justify-between',
        transparent
          ? 'bg-transparent'
          : 'bg-background/80 backdrop-blur-lg border-b border-border',
        className
      )}
      style={{
        paddingTop: 'calc(0.5rem + env(safe-area-inset-top, 0px))',
        paddingBottom: '0.5rem',
        minHeight: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
      }}
    >
      <div className="flex items-center gap-2">
        {leftElement}
        <span className="text-xl font-bold text-primary">Roomi</span>
        {title && (
          <span className="text-sm text-muted-foreground">/ {title}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {rightElement}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="text-xs"
        >
          {localeNames[otherLocale]}
        </Button>

        {showAuth && (
          <>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {user?.display_name || user?.full_name}
                </span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  {t('common.logout')}
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => openLoginModal()}>
                {t('common.login')}
              </Button>
            )}
          </>
        )}
      </div>
    </header>
  )
}
