import { useState, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { cn } from '@roomi/ui'
import { Badge } from '@roomi/ui'
import { ImageGallery } from './ImageGallery'
import { ActionButtons } from './ActionButtons'
import type { Property } from '@roomi/types'

interface PropertyCardProps {
  property: Property
  relevanceScore?: number
  onLike: () => void
  onPass: () => void
  onViewDetails?: () => void
  className?: string
}

export const PropertyCard = memo(function PropertyCard({
  property,
  relevanceScore,
  onLike,
  onPass,
  onViewDetails,
  className,
}: PropertyCardProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [, setCurrentImageIndex] = useState(0)

  const photos = property.photos || []
  const host = property.host
  const listingType = property.property_type || property.listing_type

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()

    const url = `${window.location.origin}/?p=${property.id}`
    const title = property.title
    const text = `${property.title} - ₪${property.price_monthly.toLocaleString()}/mo in ${property.address_neighborhood}, ${property.address_city}`

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch { /* user cancelled share */ }
    } else {
      await navigator.clipboard.writeText(url)
      const toast = document.createElement('div')
      toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-2 rounded-full text-sm font-medium z-50 animate-in fade-in slide-in-from-bottom-4'
      toast.textContent = t('property.linkCopied') || 'Link copied!'
      document.body.appendChild(toast)
      setTimeout(() => {
        toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-4')
        setTimeout(() => toast.remove(), 200)
      }, 2000)
    }
  }

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails()
    } else {
      navigate(`/property/${property.id}`)
    }
  }

  return (
    <article
      className={cn(
        'relative h-full w-full snap-start snap-always',
        'flex flex-col bg-black overflow-hidden',
        className
      )}
    >
      <div className="absolute inset-0">
        <ImageGallery
          photos={photos}
          className="h-full"
          onIndexChange={setCurrentImageIndex}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.15) 50%, transparent 70%)' }} />

      <div
        className="relative z-10 flex items-center justify-between px-4"
        style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}
      >
        <button
          onClick={handleShare}
          className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>

        {listingType && (
          <Badge
            className={cn(
              'border-0 backdrop-blur',
              listingType === 'room'
                ? 'bg-blue-500/90 text-white'
                : listingType === 'apartment'
                ? 'bg-green-500/90 text-white'
                : 'bg-orange-500/90 text-white'
            )}
          >
            {listingType === 'room'
              ? t('listingType.room') || 'Room'
              : listingType === 'apartment'
              ? t('listingType.apartment') || 'Apartment'
              : t('listingType.sublet') || 'Sublet'}
          </Badge>
        )}
      </div>

      <div className="flex-1" />

      <div
        className="relative z-10 px-5 pt-4 space-y-2 cursor-pointer"
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
        onClick={handleViewDetails}
      >
        <div className="flex items-center justify-center">
          <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              ₪{property.price_monthly.toLocaleString()}
            </span>
            <span className="text-white/70">
              {t('property.perMonth')}
            </span>
          </div>
          {relevanceScore != null && relevanceScore > 0 && (
            <Badge className="bg-emerald-500/90 text-white border-0 backdrop-blur-sm text-sm px-3 py-1">
              {relevanceScore}% {t('feed.match')}
            </Badge>
          )}
        </div>

        <p className="text-white/90">
          {property.address_neighborhood}, {property.address_city}
        </p>

        <div className="flex items-center gap-2 text-white/70 text-sm flex-wrap">
          <span>{t('property.rooms', { count: Number(property.total_rooms) || 0 })}</span>
          {Number(property.bathrooms) > 0 && (
            <>
              <span className="text-white/40">·</span>
              <span>{t('property.bathrooms', { count: Number(property.bathrooms) })}</span>
            </>
          )}
          {property.size_sqm && (
            <>
              <span className="text-white/40">·</span>
              <span>{t('property.sqm', { size: property.size_sqm })}</span>
            </>
          )}
          {Number(property.current_roommates_count) > 0 && (
            <>
              <span className="text-white/40">·</span>
              <span>{t('property.roommatesCount', { count: Number(property.current_roommates_count) })}</span>
            </>
          )}
        </div>

        {host && (
          <div className="flex items-center gap-2">
            <img
              src={host.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(host.full_name)}&background=random`}
              alt={host.display_name || host.full_name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white/30"
            />
            <span className="text-white/90 text-sm font-medium">
              {host.display_name || host.full_name}
            </span>
            {host.is_verified && (
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        )}
      </div>

      <div
        className="relative z-10 flex items-center justify-center pt-3 pb-20 px-5"
      >
        <ActionButtons onLike={onLike} onPass={onPass} />
      </div>
    </article>
  )
})
