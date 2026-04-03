import { useState, useCallback } from 'react'
import { cn } from '@roomi/ui'
import type { PropertyPhoto } from '@roomi/types'

interface ImageGalleryProps {
  photos: PropertyPhoto[]
  className?: string
  onIndexChange?: (index: number) => void
}

export function ImageGallery({ photos, className, onIndexChange }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [prevPhotos, setPrevPhotos] = useState(photos)
  if (photos !== prevPhotos) {
    setPrevPhotos(photos)
    setCurrentIndex(0)
    onIndexChange?.(0)
  }

  const goToIndex = useCallback((index: number) => {
    const newIndex = ((index % photos.length) + photos.length) % photos.length
    setCurrentIndex(newIndex)
    onIndexChange?.(newIndex)
  }, [photos.length, onIndexChange])

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
    const quarter = rect.width / 4

    if (x < quarter) {
      goToIndex(currentIndex - 1)
    } else {
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
