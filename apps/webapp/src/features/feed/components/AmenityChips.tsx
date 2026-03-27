import { useTranslation } from 'react-i18next'
import { cn } from '@roomi/ui'
import type { Property } from '@roomi/types'

interface AmenityChipsProps {
  property: Property
  variant?: 'light' | 'dark'
  className?: string
}

const amenityConfig = [
  { key: 'has_balcony', icon: '🌿', translationKey: 'balcony' },
  { key: 'has_elevator', icon: '🛗', translationKey: 'elevator' },
  { key: 'has_parking', icon: '🚗', translationKey: 'parking' },
  { key: 'has_safe_room', icon: '🛡️', translationKey: 'safeRoom' },
  { key: 'has_furnished', icon: '🛋️', translationKey: 'furnished' },
  { key: 'has_pets_allowed', icon: '🐕', translationKey: 'petsAllowed' },
  { key: 'has_ac', icon: '❄️', translationKey: 'ac' },
] as const

export function AmenityChips({ property, variant = 'light', className }: AmenityChipsProps) {
  const { t } = useTranslation()

  const activeAmenities = amenityConfig.filter(
    (amenity) => property[amenity.key as keyof Property]
  )

  if (activeAmenities.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {activeAmenities.map(({ key, icon, translationKey }) => (
        <div
          key={key}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
            variant === 'light'
              ? 'bg-white/20 backdrop-blur text-white'
              : 'bg-muted text-foreground'
          )}
        >
          <span>{icon}</span>
          <span>{t(`property.${translationKey}`)}</span>
        </div>
      ))}
    </div>
  )
}
