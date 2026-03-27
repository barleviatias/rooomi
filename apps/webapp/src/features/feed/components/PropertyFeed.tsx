import { useRef, useMemo, useCallback, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { PropertyCard } from './PropertyCard'
import { PropertyDetailSheet } from './PropertyDetailSheet'
import { Button } from '@roomi/ui'
import { useAuthStore } from '@/lib/store/auth-store'
import { useFeedStore } from '@/lib/store/feed-store'
import { useUIStore } from '@/lib/store/ui-store'
import { useProperties, useProperty, useLikeProperty, usePassProperty } from '@/hooks/useProperties'
import type { Property, ScoredProperty } from '@roomi/types'

const scrollbarHideStyle = `div[data-feed-scroll]::-webkit-scrollbar { display: none; }`

export function PropertyFeed() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const passedPropertyIds = useFeedStore((s) => s.passedPropertyIds)
  const likedPropertyIds = useFeedStore((s) => s.likedPropertyIds)
  const openLoginModal = useUIStore((s) => s.openLoginModal)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const loopCooldownRef = useRef(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [loopCount, setLoopCount] = useState(1)

  const sharedPropertyId = searchParams.get('p')

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useProperties()
  const { data: sharedProperty } = useProperty(sharedPropertyId || '')
  const likeProperty = useLikeProperty()
  const passProperty = usePassProperty()

  const excludeSet = useMemo(
    () => new Set([...passedPropertyIds, ...likedPropertyIds]),
    [passedPropertyIds, likedPropertyIds]
  )

  const allProperties = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flat() as (Property | ScoredProperty)[]
  }, [data])

  const availableProperties = useMemo(() => {
    const filtered = allProperties.filter(
      (p) =>
        p.status === 'active' &&
        (p.id === sharedPropertyId || !excludeSet.has(p.id))
    )

    if (sharedPropertyId && sharedProperty) {
      const alreadyInList = filtered.some((p) => p.id === sharedPropertyId)
      if (!alreadyInList) {
        filtered.unshift(sharedProperty as Property)
      } else {
        const sharedIndex = filtered.findIndex((p) => p.id === sharedPropertyId)
        if (sharedIndex > 0) {
          const [shared] = filtered.splice(sharedIndex, 1)
          filtered.unshift(shared)
        }
      }
    }

    return filtered
  }, [allProperties, excludeSet, sharedPropertyId, sharedProperty])

  const displayItems = useMemo(() => {
    if (!availableProperties.length) return []
    const items: Array<{ property: Property | ScoredProperty; key: string }> = []
    for (let loop = 0; loop < loopCount; loop++) {
      for (let i = 0; i < availableProperties.length; i++) {
        items.push({
          property: availableProperties[i],
          key: `${availableProperties[i].id}-${loop}`,
        })
      }
    }
    return items
  }, [availableProperties, loopCount])

  useEffect(() => {
    if (sharedPropertyId) {
      const timer = setTimeout(() => {
        setSearchParams({}, { replace: true })
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [sharedPropertyId, setSearchParams])

  const handleLike = useCallback((property: Property) => {
    if (!isAuthenticated) {
      openLoginModal(property.id)
      return
    }
    likeProperty.mutate({ propertyId: property.id, hostId: property.host_id })
  }, [isAuthenticated, openLoginModal, likeProperty])

  const handlePass = useCallback((property: Property) => {
    passProperty.mutate(property.id)
  }, [passProperty])

  const handleViewDetails = useCallback((property: Property) => {
    setSelectedProperty(property)
    setIsDetailOpen(true)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false)
    setSelectedProperty(null)
  }, [])

  const handleDetailLike = useCallback(() => {
    if (selectedProperty) handleLike(selectedProperty)
  }, [selectedProperty, handleLike])

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const { scrollTop, scrollHeight, clientHeight } = container

    if (scrollHeight - scrollTop - clientHeight < clientHeight * 2) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      } else if (!hasNextPage && availableProperties.length > 0 && !loopCooldownRef.current) {
        loopCooldownRef.current = true
        setLoopCount((prev) => prev + 1)
        setTimeout(() => { loopCooldownRef.current = false }, 500)
      }
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, availableProperties.length])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    if (availableProperties.length < 3 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [availableProperties.length, hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center bg-background">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">⚠️</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">{t('common.error')}</h2>
        <p className="text-muted-foreground mb-8 max-w-xs">{t('feed.loadError')}</p>
        <Button size="lg" onClick={() => useFeedStore.getState().resetFeed()}>
          {t('common.retry')}
        </Button>
      </div>
    )
  }

  if (availableProperties.length === 0 && !hasNextPage && !isFetchingNextPage) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center bg-background">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">🏠</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {t('feed.noMoreProperties')}
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xs">
          {t('common.seenAllProperties')}
        </p>
        <Button size="lg" onClick={() => useFeedStore.getState().resetFeed()}>
          {t('feed.refreshFeed')}
        </Button>
      </div>
    )
  }

  if (availableProperties.length === 0 && (isFetchingNextPage || hasNextPage)) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <>
      <div
        ref={scrollContainerRef}
        data-feed-scroll
        className="h-full overflow-y-auto snap-y snap-mandatory overscroll-y-contain"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {displayItems.map(({ property, key }) => (
          <div
            key={key}
            className="h-full snap-start snap-always"
            style={{ contentVisibility: 'auto', containIntrinsicSize: '0 100vh' }}
          >
            <PropertyCard
              property={property}
              relevanceScore={'relevance_score' in property ? property.relevance_score : undefined}
              onLike={() => handleLike(property)}
              onPass={() => handlePass(property)}
              onViewDetails={() => handleViewDetails(property)}
            />
          </div>
        ))}
        {isFetchingNextPage ? (
          <div className="h-20 flex items-center justify-center snap-start">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : null}
      </div>

      <PropertyDetailSheet
        property={selectedProperty}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onLike={handleDetailLike}
      />

      <style>{scrollbarHideStyle}</style>
    </>
  )
}
