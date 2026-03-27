import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { cn } from '@roomi/ui'
import { Badge } from '@roomi/ui'
import type { Property } from '@roomi/types'

interface PropertyInfoProps {
  property: Property
  compact?: boolean
  className?: string
}

export function PropertyInfo({ property, compact = false, className }: PropertyInfoProps) {
  const { t } = useTranslation()

  const amenities = [
    { key: 'balcony', value: property.has_balcony },
    { key: 'elevator', value: property.has_elevator },
    { key: 'parking', value: property.has_parking },
    { key: 'safeRoom', value: property.has_safe_room },
    { key: 'furnished', value: property.has_furnished },
    { key: 'petsAllowed', value: property.has_pets_allowed },
    { key: 'ac', value: property.has_ac },
  ].filter(a => a.value)

  const formattedDate = format(new Date(property.available_from), 'MMM d')

  return (
    <div className={cn('space-y-2', className)}>
      {/* Price and location */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">
              ₪{property.price_monthly.toLocaleString()}
            </span>
            <span className="text-muted-foreground text-sm">
              {t('property.perMonth')}
            </span>
          </div>
          <p className="text-muted-foreground">
            {property.address_neighborhood}, {property.address_city}
          </p>
        </div>

        {property.is_featured && (
          <Badge variant="secondary" className="shrink-0">
            {t('feed.featured')}
          </Badge>
        )}
      </div>

      {/* Quick stats */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>{t('property.rooms', { count: property.total_rooms })}</span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
        {property.size_sqm && (
          <>
            <span>{t('property.sqm', { size: property.size_sqm })}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          </>
        )}
        <span>{t('property.availableFrom', { date: formattedDate })}</span>
      </div>

      {/* Amenities badges (compact view) */}
      {!compact && amenities.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {amenities.slice(0, 4).map(({ key }) => (
            <Badge key={key} variant="outline" className="text-xs">
              {t(`property.${key}`)}
            </Badge>
          ))}
          {amenities.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{amenities.length - 4}
            </Badge>
          )}
        </div>
      )}

      {/* Bills included badge */}
      {property.price_bills_included && (
        <Badge variant="secondary" className="text-xs">
          {t('property.billsIncluded')}
        </Badge>
      )}
    </div>
  )
}
