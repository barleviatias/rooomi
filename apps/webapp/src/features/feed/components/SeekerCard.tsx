import { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useAnimation, type PanInfo } from 'framer-motion'
import { cn } from '@roomi/ui'
import { Badge, Button } from '@roomi/ui'
import { ActionButtons } from './ActionButtons'
import type { Profile, ProfileLifestyle } from '@roomi/types'

interface SeekerCardProps {
  seeker: Profile
  lifestyle?: ProfileLifestyle | null
  propertyTitle?: string
  likedAt?: string
  compatibilityScore?: number
  onLike: () => void
  onPass: () => void
  onViewDetails?: () => void
  className?: string
}

export function SeekerCard({
  seeker,
  lifestyle,
  propertyTitle,
  likedAt,
  compatibilityScore,
  onLike,
  onPass,
  onViewDetails,
  className,
}: SeekerCardProps) {
  const { t } = useTranslation()
  const controls = useAnimation()
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const isDragging = useRef(false)

  const formatLikedAt = (dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffHours < 1) return t('seeker.justNow') || 'Just now'
    if (diffHours < 24) return t('seeker.hoursAgo', { hours: diffHours }) || `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return t('seeker.daysAgo', { days: diffDays }) || `${diffDays}d ago`
  }

  const handleDragStart = useCallback(() => {
    isDragging.current = true
  }, [])

  const handleDragEnd = useCallback(async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100
    const velocity = 500
    const { offset, velocity: v } = info

    setTimeout(() => {
      isDragging.current = false
    }, 100)

    if (offset.x > threshold || v.x > velocity) {
      setSwipeDirection('right')
      await controls.start({ x: '100%', opacity: 0, transition: { duration: 0.3 } })
      onLike()
      controls.set({ x: 0, opacity: 1 })
      setSwipeDirection(null)
    } else if (offset.x < -threshold || v.x < -velocity) {
      setSwipeDirection('left')
      await controls.start({ x: '-100%', opacity: 0, transition: { duration: 0.3 } })
      onPass()
      controls.set({ x: 0, opacity: 1 })
      setSwipeDirection(null)
    } else {
      controls.start({ x: 0, opacity: 1, transition: { type: 'spring', stiffness: 500, damping: 30 } })
      setSwipeDirection(null)
    }
  }, [controls, onLike, onPass])

  const handleDrag = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 50) {
      setSwipeDirection('right')
    } else if (info.offset.x < -50) {
      setSwipeDirection('left')
    } else {
      setSwipeDirection(null)
    }
  }, [])

  const avatarUrl = seeker.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(seeker.full_name)}&background=random&size=256`

  return (
    <motion.article
      className={cn(
        'relative h-full w-full snap-start snap-always',
        'flex flex-col bg-background overflow-hidden touch-pan-y',
        className
      )}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      animate={controls}
      whileDrag={{ scale: 0.98 }}
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
                {t('seeker.match') || 'MATCH'}
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
                {t('seeker.pass') || 'PASS'}
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}

      <div className="relative z-10 flex items-center justify-between p-4 pt-6">
        <div className="flex items-center gap-2">
          {likedAt && (
            <div className="bg-pink-500 text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 shadow-sm">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              {t('seeker.likedYourPlace')} · {formatLikedAt(likedAt)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {compatibilityScore != null && compatibilityScore > 0 ? (
            <Badge className={cn(
              'text-white border-0',
              compatibilityScore > 75 ? 'bg-emerald-500' :
              compatibilityScore > 50 ? 'bg-yellow-500' :
              'bg-orange-500'
            )}>
              {compatibilityScore}% {t('seeker.compatibility') || 'compatible'}
            </Badge>
          ) : null}
          {seeker.is_verified && (
            <Badge className="bg-blue-500 text-white border-0">
              {t('property.verified')}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="relative mb-4">
          <img
            src={avatarUrl}
            alt={seeker.display_name || seeker.full_name}
            className="w-36 h-36 rounded-full object-cover ring-4 ring-pink-200 dark:ring-pink-500/30 shadow-xl"
            draggable={false}
          />
          {seeker.is_verified && (
            <div className="absolute bottom-1 right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center ring-4 ring-background">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        <h2 className="text-3xl font-bold text-foreground text-center mb-1">
          {seeker.display_name || seeker.full_name}
        </h2>
        {lifestyle?.occupation && (
          <p className="text-muted-foreground text-lg mb-3">{lifestyle.occupation}</p>
        )}

        {seeker.bio && (
          <p className="text-muted-foreground text-center max-w-xs mb-4 line-clamp-2">
            "{seeker.bio}"
          </p>
        )}

        {lifestyle && (
          <div className="flex items-center justify-center gap-2 text-sm flex-wrap">
            {!lifestyle.is_smoker && (
              <span className="bg-muted text-foreground px-3 py-1.5 rounded-full">
                🚭 {t('profile.nonSmoker')}
              </span>
            )}
            {lifestyle.is_smoker && (
              <span className="bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-300 px-3 py-1.5 rounded-full">
                🚬 {t('profile.smoker')}
              </span>
            )}
            {lifestyle.has_pet && (
              <span className="bg-muted text-foreground px-3 py-1.5 rounded-full">
                🐾 {t('profile.hasPet')}
              </span>
            )}
            {lifestyle.keeps_kosher && (
              <span className="bg-muted text-foreground px-3 py-1.5 rounded-full">
                ✡️ {t('profile.kosher')}
              </span>
            )}
            {lifestyle.is_student && (
              <span className="bg-muted text-foreground px-3 py-1.5 rounded-full">
                🎓 {t('profile.student')}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="relative z-10 px-6 pb-24 space-y-4">
        {lifestyle && (
          <div className="bg-muted/50 rounded-2xl p-4 space-y-3 max-w-sm mx-auto">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">{t('profile.cleanliness')}</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      'w-3 h-3 rounded-full',
                      level <= (lifestyle.cleanliness_level || 0)
                        ? 'bg-emerald-500'
                        : 'bg-muted-foreground/20'
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">{t('profile.noise')}</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      'w-3 h-3 rounded-full',
                      level <= (lifestyle.noise_level || 0)
                        ? 'bg-amber-500'
                        : 'bg-muted-foreground/20'
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">{t('profile.sleeping')}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">🌙</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        'w-3 h-3 rounded-full',
                        level <= (lifestyle.sleeping_level || 0)
                          ? 'bg-blue-500'
                          : 'bg-muted-foreground/20'
                      )}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground">🌅</span>
              </div>
            </div>
          </div>
        )}

        {propertyTitle && (
          <div className="text-sm bg-pink-50 dark:bg-pink-500/10 rounded-xl p-3 text-center max-w-sm mx-auto">
            <span className="text-muted-foreground">{t('seeker.interestedIn')}</span>{' '}
            <span className="font-medium text-foreground">{propertyTitle}</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 pt-2">
          <ActionButtons
            onLike={onLike}
            onPass={onPass}
          />
          {onViewDetails && (
            <Button
              variant="outline"
              size="icon"
              className="w-14 h-14 rounded-full"
              onClick={(e) => {
                e.stopPropagation()
                if (!isDragging.current) {
                  onViewDetails()
                }
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  )
}
