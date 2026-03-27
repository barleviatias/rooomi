import { useTranslation } from 'react-i18next'
import { Card, Badge, Button } from '@roomi/ui'
import type { ListingFormData } from './ListingDetailsStep'
import type { PhotoFile } from './PhotoUploadStep'

interface ListingReviewStepProps {
  data: ListingFormData
  photos: PhotoFile[]
  onEdit: (step: number) => void
}

export function ListingReviewStep({ data, photos, onEdit }: ListingReviewStepProps) {
  const { t } = useTranslation()

  const activeAmenities = Object.entries(data.amenities)
    .filter(([, value]) => value)
    .map(([key]) => key)

  const amenityLabels: Record<string, string> = {
    balcony: t('property.balcony'),
    ac: t('property.ac'),
    elevator: t('property.elevator'),
    parking: t('property.parking'),
    furnished: t('property.furnished'),
    petsAllowed: t('property.petsAllowed'),
    safeRoom: t('property.safeRoom'),
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
      <div className="text-center mb-2">
        <h2 className="text-xl font-semibold">
          {t('createListing.step3Title') || 'Review'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('createListing.reviewHint') || 'Make sure everything looks good'}
        </p>
      </div>

      {/* Preview Card */}
      <Card className="overflow-hidden">
        {/* Photo */}
        <div className="aspect-video bg-muted relative">
          {photos[0] ? (
            <img
              src={photos[0].preview}
              alt={data.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm text-muted-foreground">
                  {t('createListing.noPhotos') || 'No photos added'}
                </p>
              </div>
            </div>
          )}
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-2 end-2"
            onClick={() => onEdit(0)}
          >
            {t('host.editListing') || 'Edit'}
          </Button>
        </div>

        {/* Details */}
        <div className="p-4 space-y-3">
          {/* Listing Type Badge */}
          {data.listingType && (
            <Badge
              className={
                data.listingType === 'room'
                  ? 'bg-blue-500 text-white border-0'
                  : data.listingType === 'apartment'
                  ? 'bg-green-500 text-white border-0'
                  : 'bg-orange-500 text-white border-0'
              }
            >
              {data.listingType === 'room'
                ? t('listingType.room') || 'Room'
                : data.listingType === 'apartment'
                ? t('listingType.apartment') || 'Apartment'
                : t('listingType.sublet') || 'Sublet'}
            </Badge>
          )}

          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">
                {data.title || (t('createListing.untitled') || 'Untitled Listing')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {data.neighborhood ? `${data.neighborhood}, ` : ''}{data.city || '—'}
              </p>
            </div>
            <div className="text-end">
              <p className="text-xl font-bold">
                ₪{data.price ? data.price.toLocaleString() : '—'}
              </p>
              <p className="text-xs text-muted-foreground">{t('property.perMonth')}</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {data.rooms && (
              <span>{t('property.rooms', { count: Number(data.rooms) })}</span>
            )}
            {data.bathrooms && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                <span>{t('property.bathrooms', { count: Number(data.bathrooms) })}</span>
              </>
            )}
            {data.size && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                <span>{t('property.sqm', { size: data.size })}</span>
              </>
            )}
          </div>

          {/* Amenities */}
          {activeAmenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {activeAmenities.map((amenity) => (
                <Badge key={amenity} variant="secondary" className="text-xs">
                  {amenityLabels[amenity]}
                </Badge>
              ))}
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => onEdit(1)}
          >
            {t('createListing.editDetails') || 'Edit Details'}
          </Button>
        </div>
      </Card>

      {/* Additional Info Summary */}
      <Card className="p-4 space-y-3">
        <h4 className="font-medium">{t('createListing.additionalInfo') || 'Additional Info'}</h4>

        <div className="space-y-2 text-sm">
          {data.description && (
            <div>
              <span className="text-muted-foreground">{t('property.description')}: </span>
              <span className="line-clamp-2">{data.description}</span>
            </div>
          )}

          {data.availableFrom && (
            <div>
              <span className="text-muted-foreground">{t('property.availableFromDate')}: </span>
              <span>{new Date(data.availableFrom).toLocaleDateString()}</span>
            </div>
          )}

          <div>
            <span className="text-muted-foreground">{t('property.minimumLease')}: </span>
            <span>{t('property.months', { count: data.minLease })}</span>
          </div>

          {data.deposit && (
            <div>
              <span className="text-muted-foreground">{t('property.depositMonths')}: </span>
              <span>{data.deposit} {t('property.months', { count: Number(data.deposit) })}</span>
            </div>
          )}

          {data.billsIncluded && (
            <Badge variant="secondary">{t('property.billsIncluded')}</Badge>
          )}

          {data.roommatesDescription && (
            <div>
              <span className="text-muted-foreground">{t('property.roommatesDescription')}: </span>
              <span>{data.roommatesDescription}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
