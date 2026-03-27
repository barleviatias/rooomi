import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@roomi/ui'
import { Button, Badge } from '@roomi/ui'
import type { Profile, ProfileLifestyle } from '@roomi/types'

interface SeekerDetailModalProps {
  seeker: Profile | null
  lifestyle?: ProfileLifestyle | null
  propertyTitle?: string
  likedAt?: string
  isOpen: boolean
  onClose: () => void
  onMatch: () => void
  onPass: () => void
}

export function SeekerDetailModal({
  seeker,
  lifestyle,
  propertyTitle,
  likedAt,
  isOpen,
  onClose,
  onMatch,
  onPass,
}: SeekerDetailModalProps) {
  const { t } = useTranslation()

  if (!seeker) return null

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

  const handleMatchClick = () => {
    onMatch()
    onClose()
  }

  const handlePassClick = () => {
    onPass()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-lg bg-background rounded-t-3xl max-h-[90vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
            </div>

            <div className="relative px-6 pb-4">
              <div className="flex items-start gap-4">
                <img
                  src={seeker.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(seeker.full_name)}&background=random&size=256`}
                  alt={seeker.display_name || seeker.full_name}
                  className="w-24 h-24 rounded-2xl object-cover ring-2 ring-border"
                />
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold">
                      {seeker.display_name || seeker.full_name}
                    </h2>
                    {seeker.is_verified && (
                      <Badge className="bg-blue-500 text-white border-0 text-xs">
                        {t('property.verified')}
                      </Badge>
                    )}
                  </div>
                  {lifestyle?.occupation && (
                    <p className="text-muted-foreground">{lifestyle.occupation}</p>
                  )}
                  {likedAt && (
                    <p className="text-sm text-green-600 mt-1">
                      {t('seeker.likedYourPlace')} · {formatLikedAt(likedAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {propertyTitle && (
              <div className="px-6 pb-4">
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('seeker.interestedIn')}
                  </p>
                  <p className="font-semibold">{propertyTitle}</p>
                </div>
              </div>
            )}

            {seeker.bio && (
              <div className="px-6 pb-6">
                <h3 className="text-lg font-semibold mb-2">{t('profile.aboutMe')}</h3>
                <p className="text-muted-foreground leading-relaxed">{seeker.bio}</p>
              </div>
            )}

            {lifestyle && (
              <div className="px-6 pb-6">
                <h3 className="text-lg font-semibold mb-4">{t('profile.lifestyle')}</h3>

                <div className="flex flex-wrap gap-2 mb-6">
                  {lifestyle.is_smoker ? (
                    <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-3 py-1.5 rounded-full text-sm font-medium">
                      {t('profile.smoker')}
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1.5 rounded-full text-sm font-medium">
                      {t('profile.nonSmoker')}
                    </span>
                  )}
                  {lifestyle.has_pet && (
                    <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-3 py-1.5 rounded-full text-sm font-medium">
                      {t('profile.hasPet')}
                    </span>
                  )}
                  {lifestyle.keeps_kosher && (
                    <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1.5 rounded-full text-sm font-medium">
                      {t('profile.kosher')}
                    </span>
                  )}
                  {lifestyle.is_student && (
                    <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1.5 rounded-full text-sm font-medium">
                      {t('profile.student')}
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{t('profile.hosting')}</span>
                      <span className="text-xs text-muted-foreground">
                        {t('profile.notAtAll')} → {t('profile.aLot')}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={cn(
                            'flex-1 h-3 rounded-full transition-colors',
                            level <= (lifestyle.hosting_level || 0)
                              ? 'bg-primary'
                              : 'bg-muted'
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{t('profile.sleeping')}</span>
                      <span className="text-xs text-muted-foreground">
                        {t('profile.nightOwl')} → {t('profile.earlyBird')}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={cn(
                            'flex-1 h-3 rounded-full transition-colors',
                            level <= (lifestyle.sleeping_level || 0)
                              ? 'bg-blue-500'
                              : 'bg-muted'
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{t('profile.cleanliness')}</span>
                      <span className="text-xs text-muted-foreground">
                        {t('profile.notAtAll')} → {t('profile.aLot')}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={cn(
                            'flex-1 h-3 rounded-full transition-colors',
                            level <= (lifestyle.cleanliness_level || 0)
                              ? 'bg-emerald-500'
                              : 'bg-muted'
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{t('profile.noise')}</span>
                      <span className="text-xs text-muted-foreground">
                        {t('profile.notAtAll')} → {t('profile.aLot')}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={cn(
                            'flex-1 h-3 rounded-full transition-colors',
                            level <= (lifestyle.noise_level || 0)
                              ? 'bg-amber-500'
                              : 'bg-muted'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {seeker.instagram_handle && (
              <div className="px-6 pb-6">
                <h3 className="text-lg font-semibold mb-2">{t('profile.instagram')}</h3>
                <a
                  href={`https://instagram.com/${seeker.instagram_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  @{seeker.instagram_handle}
                </a>
              </div>
            )}

            <div className="sticky bottom-0 px-6 py-4 bg-background border-t border-border pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={handlePassClick}
                >
                  {t('seeker.pass')}
                </Button>
                <Button
                  className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  onClick={handleMatchClick}
                >
                  {t('seeker.match')}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
