import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { Button, Badge } from '@roomi/ui'
import { ImageGallery } from './ImageGallery'
import { AmenityChips } from './AmenityChips'
import type { Property } from '@roomi/types'

interface PropertyDetailSheetProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
  onLike: () => void
}

export function PropertyDetailSheet({
  property,
  isOpen,
  onClose,
  onLike,
}: PropertyDetailSheetProps) {
  const { t } = useTranslation()

  if (!property) return null

  const host = property.host
  const formattedDate = format(new Date(property.available_from), 'MMMM d, yyyy')

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-50 bg-background flex flex-col"
        >
          <div className="flex-1 overflow-y-auto pb-24">
            <div className="relative">
              <div className="h-72 sm:h-96">
                <ImageGallery photos={property.photos || []} className="h-full" />
              </div>

              <button
                onClick={onClose}
                className="absolute top-4 start-4 z-30 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center"
              >
                <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-5 pt-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h1 className="text-xl font-semibold">{property.title}</h1>
                  <p className="text-muted-foreground mt-0.5">
                    {property.address_neighborhood}, {property.address_city}
                  </p>
                </div>
                <div className="text-end shrink-0">
                  <span className="text-xl font-semibold">₪{property.price_monthly.toLocaleString()}</span>
                  <span className="text-muted-foreground text-sm">/{t('property.perMonth')}</span>
                </div>
              </div>

              {(property.is_featured || property.price_bills_included) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {property.is_featured && (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                      {t('feed.featured')}
                    </Badge>
                  )}
                  {property.price_bills_included && (
                    <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                      {t('property.billsIncluded')}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="border-b border-border my-5" />

            <div className="px-5 grid grid-cols-2 gap-y-4 gap-x-8">
              <DetailRow label={t('property.rooms', { count: property.total_rooms })} />
              <DetailRow label={t('property.bathrooms', { count: property.bathrooms })} />
              {property.size_sqm && (
                <DetailRow label={t('property.sqm', { size: property.size_sqm })} />
              )}
              {property.floor_number && property.total_floors && (
                <DetailRow label={t('property.floor', { floor: property.floor_number, total: property.total_floors })} />
              )}
              <DetailRow label={t('property.availableFromDate')} value={formattedDate} />
              {property.minimum_lease_months && (
                <DetailRow label={t('property.minimumLease')} value={t('property.months', { count: property.minimum_lease_months })} />
              )}
              {property.deposit_months && (
                <DetailRow label={t('property.depositMonths')} value={t('property.months', { count: property.deposit_months })} />
              )}
            </div>

            {property.description && (
              <>
                <div className="border-b border-border my-5" />
                <div className="px-5">
                  <h2 className="text-lg font-semibold mb-2">{t('property.aboutPlace')}</h2>
                  <p className="text-muted-foreground leading-relaxed">{property.description}</p>
                </div>
              </>
            )}

            <div className="border-b border-border my-5" />

            <div className="px-5">
              <h2 className="text-lg font-semibold mb-3">{t('property.amenities')}</h2>
              <AmenityChips property={property} variant="dark" />
            </div>

            {property.current_roommates_count > 0 && (
              <>
                <div className="border-b border-border my-5" />
                <div className="px-5">
                  <h2 className="text-lg font-semibold mb-2">{t('property.currentRoommates')}</h2>
                  <p className="text-muted-foreground">
                    {t('property.roommatesCount', { count: property.current_roommates_count })}
                    {property.current_roommates_description && ` — ${property.current_roommates_description}`}
                  </p>
                </div>
              </>
            )}

            {host && (
              <>
                <div className="border-b border-border my-5" />
                <div className="px-5">
                  <h2 className="text-lg font-semibold mb-3">{t('property.meetHost')}</h2>
                  <div className="flex items-center gap-4">
                    <img
                      src={host.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(host.full_name)}&background=random&size=80`}
                      alt={host.display_name || host.full_name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{host.display_name || host.full_name}</span>
                        {host.is_verified && (
                          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      {host.bio && (
                        <p className="text-sm text-muted-foreground mt-0.5">{host.bio}</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="border-b border-border my-5" />

            <div className="px-5 pb-6">
              <h2 className="text-lg font-semibold mb-3">{t('property.location')}</h2>
              <div className="bg-muted rounded-2xl h-44 flex items-center justify-center">
                <p className="text-muted-foreground">
                  {property.address_neighborhood}, {property.address_city}
                </p>
              </div>
            </div>
          </div>

          <div
            className="absolute bottom-0 inset-x-0 bg-background border-t border-border px-5 py-3 flex gap-3"
            style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl"
              onClick={onClose}
            >
              {t('common.back')}
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white"
              onClick={() => {
                onLike()
                onClose()
              }}
            >
              <svg className="w-5 h-5 me-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              {t('common.likeThisPlace')}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function DetailRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      {value ? (
        <>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-medium">{value}</p>
        </>
      ) : (
        <p className="font-medium">{label}</p>
      )}
    </div>
  )
}
