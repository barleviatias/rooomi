# Property Card Redesign — TikTok-Style Immersive

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the PropertyCard from cluttered overlay to a clean, immersive TikTok-style experience with story-bar photo navigation, minimal info overlay, and two-button action bar.

**Architecture:** Replace ImageGallery arrows/dots with tap zones and story progress bars. Restructure PropertyCard layout into three layers: photo (full-screen), top bar (share + story bars + listing type), and bottom area (info overlay + action buttons). Keep existing swipe gesture system.

**Tech Stack:** React 19, Framer Motion, Tailwind CSS v4, existing shadcn/ui components

---

## Design

### Photo Layer (full screen)
- Photo fills 100% of viewport
- **Tap zones:** Left third = prev photo, right third = next photo
- No arrows, no dots
- Subtle gradient at bottom ~30% only (`from-black/70 via-black/30 to-transparent`), lighter than current

### Top Bar
- **Top-left:** Share button — small translucent circle (`bg-black/30 backdrop-blur`)
- **Top-center:** Story-style progress bars (one per photo, 3px height)
  - Inactive: `white/30`
  - Active: `white/90` (solid fill, no animation)
  - Past: `white/60`
  - Small gaps between bars
- **Top-right:** Listing type pill (דירה/חדר/סאבלט) with color coding

### Info Overlay (bottom, above action buttons)
- **Line 1:** Price large+bold (₪4,800/חודש) on start side, match % green pill on end side
- **Line 2:** Neighborhood, City
- **Line 3:** Specs — rooms · bathrooms · sqm · roommates (small, muted)
- **Host row:** Small avatar + name
- **Chevron-up hint** at top of overlay — tapping overlay or swiping up opens detail sheet
- Entire info block is tappable to open detail sheet

### Action Buttons (bottom, between info and nav)
- Two buttons only, centered:
  - **Pass (X):** Medium circle, white/translucent, subtle border
  - **Like (heart):** Slightly larger, pink gradient (primary action)
- No share button, no info button here

### Bottom Navigation
- Unchanged — translucent blur style (`bg-black/40 backdrop-blur`)

### Swipe Gestures
- **Swipe right:** Like — green tint overlay + "LIKE" label
- **Swipe left:** Pass — red tint overlay + "PASS" label
- Damped drag + rotation, light feel

### Interaction Model
| Action | Gesture |
|--------|---------|
| Next photo | Tap right third of screen |
| Prev photo | Tap left third of screen |
| Like | Swipe right or tap heart |
| Pass | Swipe left or tap X |
| Open details | Tap info overlay or swipe up |
| Next property | Vertical scroll (snap) |
| Share | Tap share icon (top-left) |

## Removed From Card
- Photo navigation arrows
- Photo dot indicators
- Info button
- Share button (from bottom — moved to top-left)
- Availability date (moved to detail sheet)
- Featured badge (moved to detail sheet)

## Moved to Detail Sheet
- Availability date
- Featured/bills-included badges
- Share action (also accessible from top-left)
- Full amenities list
- All other details

---

## Implementation Plan

### Task 1: Rewrite ImageGallery with Tap Zones + Story Bars

**Files:**
- Modify: `src/features/feed/components/ImageGallery.tsx`

**Step 1: Rewrite ImageGallery**

Replace arrows and dots with tap zones and story progress bars. The component should:
- Render the current photo full-screen
- Divide the photo into invisible left-third / right-third tap zones
- Show story-style progress bars at the top (one per photo, 3px height)
- Story bars: inactive `bg-white/30`, active `bg-white/90`, past `bg-white/60`
- Remove all arrow buttons and dot indicators

```tsx
import { useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { PropertyPhoto } from '@/types'

interface ImageGalleryProps {
  photos: PropertyPhoto[]
  className?: string
  onIndexChange?: (index: number) => void
}

export function ImageGallery({ photos, className, onIndexChange }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToIndex = useCallback((index: number) => {
    const newIndex = Math.max(0, Math.min(photos.length - 1, index))
    setCurrentIndex(newIndex)
    onIndexChange?.(newIndex)
  }, [photos.length, onIndexChange])

  useEffect(() => {
    setCurrentIndex(0)
    onIndexChange?.(0)
  }, [photos, onIndexChange])

  if (!photos.length) {
    return (
      <div className={cn('bg-gray-800 flex items-center justify-center', className)}>
        <span className="text-white/50">No photos</span>
      </div>
    )
  }

  const handleTapZone = (e: React.MouseEvent) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const third = rect.width / 3

    if (x < third && currentIndex > 0) {
      goToIndex(currentIndex - 1)
    } else if (x > third * 2 && currentIndex < photos.length - 1) {
      goToIndex(currentIndex + 1)
    }
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img
        src={photos[currentIndex]?.photo_url}
        alt={photos[currentIndex]?.caption || `Photo ${currentIndex + 1}`}
        className="w-full h-full object-cover"
        draggable={false}
      />

      {photos.length > 1 && (
        <>
          <div
            className="absolute inset-0 z-10"
            onClick={handleTapZone}
          />

          <div
            className="absolute top-0 inset-x-0 z-20 flex gap-1 px-3"
            style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top, 0px))' }}
          >
            {photos.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-[3px] flex-1 rounded-full transition-colors duration-200',
                  index === currentIndex
                    ? 'bg-white/90'
                    : index < currentIndex
                    ? 'bg-white/60'
                    : 'bg-white/30'
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
```

**Step 2: Verify visually**

Run: `bun run dev`
Open feed in browser. Confirm:
- Story bars appear at top
- Tapping left/right third navigates photos
- No arrows or dots visible

**Step 3: Commit**

```bash
git add src/features/feed/components/ImageGallery.tsx
git commit -m "feat: replace photo arrows/dots with tap zones and story bars"
```

---

### Task 2: Rewrite PropertyCard Layout

**Files:**
- Modify: `src/features/feed/components/PropertyCard.tsx`

**Step 1: Rewrite PropertyCard**

Restructure into three layers:
1. Photo layer (full screen via ImageGallery)
2. Top bar: share button (left), listing type pill (right) — story bars handled by ImageGallery
3. Bottom: info overlay (tappable for details) + action buttons

Key changes:
- Remove photo counter badge, featured badge, bills-included badge from card
- Move share button to top-left as small translucent circle
- Simplify info overlay: price + match %, location, specs, host
- Add chevron-up icon to info overlay as detail sheet hint
- Only like/pass buttons at bottom (no share, no info buttons)
- Lighter gradient: `from-black/70 via-black/30 to-transparent`
- Info overlay is tappable to open detail sheet

```tsx
import { useState, useCallback, useRef, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion, useAnimation } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ImageGallery } from './ImageGallery'
import { ActionButtons } from './ActionButtons'
import type { Property } from '@/types'

interface PropertyCardProps {
  property: Property
  relevanceScore?: number
  onLike: () => void
  onPass: () => void
  onViewDetails?: () => void
  className?: string
}

type GestureDirection = 'horizontal' | 'vertical' | null

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
  const controls = useAnimation()
  const [, setCurrentImageIndex] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const isDragging = useRef(false)
  const offsetXRef = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const gestureDirectionRef = useRef<GestureDirection>(null)
  const DIRECTION_LOCK_THRESHOLD = 10

  const photos = property.photos || []
  const host = property.host
  const listingType = property.property_type || property.listing_type

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isDragging.current) return

    const url = `${window.location.origin}/?p=${property.id}`
    const title = property.title
    const text = `${property.title} - ₪${property.price_monthly.toLocaleString()}/mo in ${property.address_neighborhood}, ${property.address_city}`

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch {
        // User cancelled
      }
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
    if (isDragging.current) return
    if (onViewDetails) {
      onViewDetails()
    } else {
      navigate(`/property/${property.id}`)
    }
  }

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    gestureDirectionRef.current = null
    isDragging.current = false
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y

    if (gestureDirectionRef.current === null) {
      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)

      if (absDeltaX > DIRECTION_LOCK_THRESHOLD || absDeltaY > DIRECTION_LOCK_THRESHOLD) {
        if (absDeltaX > absDeltaY * 1.2) {
          gestureDirectionRef.current = 'horizontal'
          isDragging.current = true
        } else {
          gestureDirectionRef.current = 'vertical'
        }
      }
    }

    if (gestureDirectionRef.current === 'horizontal') {
      e.preventDefault()
      const dampedX = deltaX * 0.8
      offsetXRef.current = dampedX

      const el = cardRef.current
      if (el) {
        el.style.transform = `translateX(${dampedX}px) rotate(${dampedX * 0.03}deg) scale(0.98)`
      }

      if (deltaX > 50) {
        setSwipeDirection('right')
      } else if (deltaX < -50) {
        setSwipeDirection('left')
      } else {
        setSwipeDirection(null)
      }
    }
  }, [])

  const handleTouchEnd = useCallback(async () => {
    if (gestureDirectionRef.current === 'horizontal') {
      const currentOffset = offsetXRef.current
      const threshold = 80

      const el = cardRef.current
      if (el) {
        el.style.transform = ''
      }

      if (currentOffset > threshold) {
        setSwipeDirection('right')
        await controls.start({ x: '100%', rotate: 15, opacity: 0, transition: { duration: 0.25 } })
        onLike()
        controls.set({ x: 0, rotate: 0, scale: 1, opacity: 1 })
      } else if (currentOffset < -threshold) {
        setSwipeDirection('left')
        await controls.start({ x: '-100%', rotate: -15, opacity: 0, transition: { duration: 0.25 } })
        onPass()
        controls.set({ x: 0, rotate: 0, scale: 1, opacity: 1 })
      } else {
        await controls.start({
          x: 0,
          rotate: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 500, damping: 30 }
        })
      }

      setSwipeDirection(null)
      offsetXRef.current = 0

      setTimeout(() => {
        isDragging.current = false
      }, 100)
    }

    touchStartRef.current = null
    gestureDirectionRef.current = null
  }, [controls, onLike, onPass])

  return (
    <motion.article
      ref={cardRef}
      className={cn(
        'relative h-full w-full snap-start snap-always',
        'flex flex-col bg-black overflow-hidden',
        className
      )}
      style={{ touchAction: 'pan-y' }}
      animate={controls}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {swipeDirection === 'right' && (
        <motion.div
          className="absolute inset-0 z-30 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="absolute inset-0 border-4 border-pink-500/60 rounded-lg" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 shadow-2xl shadow-pink-500/30"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <span className="text-white text-2xl font-bold flex items-center gap-2">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                LIKE
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
      {swipeDirection === 'left' && (
        <motion.div
          className="absolute inset-0 z-30 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="absolute inset-0 border-4 border-slate-400/60 rounded-lg" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="px-8 py-4 rounded-2xl bg-slate-700/90 shadow-2xl"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <span className="text-white text-2xl font-bold flex items-center gap-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                PASS
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}

      <div className="absolute inset-0">
        <ImageGallery
          photos={photos}
          className="h-full"
          onIndexChange={setCurrentImageIndex}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

      <div
        className="relative z-10 flex items-center justify-between px-4"
        style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top, 0px))' }}
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
        className="relative z-10 flex items-center justify-center py-4 px-5"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <ActionButtons onLike={onLike} onPass={onPass} />
      </div>
    </motion.article>
  )
})
```

**Step 2: Verify visually**

Run: `bun run dev`
Open feed. Confirm:
- Share icon top-left, listing type pill top-right
- Info overlay at bottom with price + match % on same row
- Chevron-up hint above info
- Only like/pass buttons at bottom
- Tapping info overlay opens detail sheet
- No featured badge, bills badge, availability date, photo counter on card

**Step 3: Commit**

```bash
git add src/features/feed/components/PropertyCard.tsx
git commit -m "feat: redesign PropertyCard with immersive TikTok-style layout"
```

---

### Task 3: Visual Polish & Testing

**Files:**
- Modify: `src/features/feed/components/PropertyCard.tsx` (if adjustments needed)
- Modify: `src/features/feed/components/ImageGallery.tsx` (if adjustments needed)

**Step 1: Test all interactions on mobile viewport**

Open Chrome DevTools, set to mobile viewport (375x812). Test:
- [ ] Tap left third → previous photo
- [ ] Tap right third → next photo
- [ ] Story bars update correctly
- [ ] Swipe right → like animation + action fires
- [ ] Swipe left → pass animation + action fires
- [ ] Tap info overlay → detail sheet opens
- [ ] Tap share → native share or clipboard copy
- [ ] Vertical scroll → snap to next property
- [ ] Bottom nav still works

**Step 2: Fix any spacing/layout issues found**

Adjust padding, font sizes, or spacing as needed.

**Step 3: Commit**

```bash
git add -A
git commit -m "fix: polish property card spacing and interactions"
```
