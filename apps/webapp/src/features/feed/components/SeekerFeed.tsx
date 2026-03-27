import { useRef, useMemo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SeekerCard } from './SeekerCard'
import { SeekerDetailModal } from './SeekerDetailModal'
import { Button } from '@roomi/ui'
import { useAuthStore } from '@/lib/store'
import { useHostMatches, useAcceptMatch, useRejectMatch, useScoredPendingLikes } from '@/hooks/useMatches'
import { useHostProperties } from '@/hooks/useProperties'
import type { Profile, ProfileLifestyle } from '@roomi/types'

interface MatchItem {
  id: string
  seeker_id: string
  property_id: string
  seeker_liked_at: string
  compatibility_score?: number
  seeker?: Profile & { lifestyle?: ProfileLifestyle | ProfileLifestyle[] | null }
  property?: { title?: string }
}

interface SeekerFeedProps {
  onMatch?: (seekerId: string, propertyId: string) => void
  onPass?: (seekerId: string, propertyId: string) => void
}

export function SeekerFeed({ onMatch, onPass }: SeekerFeedProps) {
  const { t } = useTranslation()
  useAuthStore()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const [matchedSeekerIds, setMatchedSeekerIds] = useState<string[]>([])
  const [passedSeekerIds, setPassedSeekerIds] = useState<string[]>([])

  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const { data: pendingMatches, isLoading } = useHostMatches('pending')
  const { data: hostProperties } = useHostProperties()
  const firstPropertyId = hostProperties?.[0]?.id
  const { data: scoredLikes } = useScoredPendingLikes(firstPropertyId || '')
  const acceptMatch = useAcceptMatch()
  const rejectMatch = useRejectMatch()

  const scoreMap = useMemo(() => {
    const map = new Map<string, number>()
    if (Array.isArray(scoredLikes)) {
      for (const item of scoredLikes) {
        if (item.match_id && item.compatibility_score != null) {
          map.set(item.match_id, item.compatibility_score)
        }
      }
    }
    return map
  }, [scoredLikes])

  const availableMatches = useMemo(() => {
    if (!pendingMatches) return []
    const matches = (pendingMatches as MatchItem[]).filter(
      (match) =>
        !matchedSeekerIds.includes(match.seeker_id) &&
        !passedSeekerIds.includes(match.seeker_id)
    )
    return matches.map((match) => ({
      ...match,
      compatibility_score: scoreMap.get(match.id) ?? match.compatibility_score,
    }))
  }, [pendingMatches, matchedSeekerIds, passedSeekerIds, scoreMap])

  const getLifestyle = (match: MatchItem): ProfileLifestyle | null => {
    const lifestyle = match.seeker?.lifestyle
    if (Array.isArray(lifestyle)) return lifestyle[0] || null
    return lifestyle || null
  }

  const handleMatch = useCallback((match: MatchItem) => {
    setMatchedSeekerIds((prev) => [...prev, match.seeker_id])
    acceptMatch.mutate(match.id)
    onMatch?.(match.seeker_id, match.property_id)
  }, [onMatch, acceptMatch])

  const handlePass = useCallback((match: MatchItem) => {
    setPassedSeekerIds((prev) => [...prev, match.seeker_id])
    rejectMatch.mutate(match.id)
    onPass?.(match.seeker_id, match.property_id)
  }, [onPass, rejectMatch])

  const handleViewDetails = useCallback((match: MatchItem) => {
    setSelectedMatch(match)
    setIsDetailOpen(true)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false)
    setSelectedMatch(null)
  }, [])

  const handleMatchFromModal = useCallback(() => {
    if (selectedMatch) {
      handleMatch(selectedMatch)
    }
  }, [selectedMatch, handleMatch])

  const handlePassFromModal = useCallback(() => {
    if (selectedMatch) {
      handlePass(selectedMatch)
    }
  }, [selectedMatch, handlePass])

  const handleReset = () => {
    setMatchedSeekerIds([])
    setPassedSeekerIds([])
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[100dvh] bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (availableMatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] px-4 text-center bg-background">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">👥</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {t('seeker.noMoreSeekers') || 'No pending likes'}
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xs">
          {t('seeker.waitForLikes') || "You've reviewed all interested seekers. Check back later for new likes!"}
        </p>
        {(matchedSeekerIds.length > 0 || passedSeekerIds.length > 0) && (
          <Button size="lg" onClick={handleReset}>
            {t('seeker.reviewAgain') || 'Review Again'}
          </Button>
        )}
      </div>
    )
  }

  return (
    <>
      <div
        ref={scrollContainerRef}
        className="h-[100dvh] overflow-y-auto snap-y snap-mandatory overscroll-y-contain"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {availableMatches.map((match) => (
          <div
            key={match.id}
            className="h-[100dvh] snap-start snap-always"
          >
            {match.seeker && (
              <SeekerCard
                seeker={match.seeker as Profile}
                lifestyle={getLifestyle(match)}
                propertyTitle={(match.property as { title?: string })?.title}
                likedAt={match.seeker_liked_at}
                compatibilityScore={match.compatibility_score}
                onLike={() => handleMatch(match)}
                onPass={() => handlePass(match)}
                onViewDetails={() => handleViewDetails(match)}
              />
            )}
          </div>
        ))}
      </div>

      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <SeekerDetailModal
        seeker={(selectedMatch?.seeker as Profile) || null}
        lifestyle={selectedMatch ? getLifestyle(selectedMatch) : null}
        propertyTitle={(selectedMatch?.property as { title?: string })?.title}
        likedAt={selectedMatch?.seeker_liked_at}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onMatch={handleMatchFromModal}
        onPass={handlePassFromModal}
      />
    </>
  )
}
