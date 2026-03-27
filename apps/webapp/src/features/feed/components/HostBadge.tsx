import { useTranslation } from 'react-i18next'
import { cn } from '@roomi/ui'
import type { Profile } from '@roomi/types'

interface HostBadgeProps {
  host: Profile
  className?: string
}

export function HostBadge({ host, className }: HostBadgeProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Avatar */}
      <div className="relative">
        <img
          src={host.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(host.full_name)}&background=random`}
          alt={host.display_name || host.full_name}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-background"
        />
        {host.is_verified && (
          <div className="absolute -bottom-1 -end-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
            <svg
              className="w-3 h-3 text-primary-foreground"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">
            {host.display_name || host.full_name}
          </span>
          {host.is_verified && (
            <span className="text-xs text-primary">
              {t('property.verified')}
            </span>
          )}
        </div>
        {host.bio && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            "{host.bio}"
          </p>
        )}
        {host.avg_response_time_hours && (
          <p className="text-xs text-muted-foreground">
            {t('property.respondsIn', { hours: Math.round(host.avg_response_time_hours) })}
          </p>
        )}
      </div>
    </div>
  )
}
