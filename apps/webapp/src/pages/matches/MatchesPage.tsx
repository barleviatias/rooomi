import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout'
import { Badge, Button, Card } from '@roomi/ui'
import { useAuthStore } from '@/lib/store/auth-store'
import { useMatchStore } from '@/lib/store/match-store'
import { useSeekerMatches } from '@/hooks/useMatches'
import { useStartConversation } from '@/hooks/useChat'
import { formatDistanceToNow } from 'date-fns'

interface MatchProperty {
  title?: string
  address_neighborhood?: string
  address_city?: string
  price_monthly: number
  photos?: { photo_url: string }[]
}

interface MatchData {
  id: string
  status: string
  matched_at?: string
  expires_at: string
  property?: MatchProperty
  host?: { full_name: string; display_name?: string; avatar_url?: string }
  conversation?: { id: string } | { id: string }[]
}

function MatchCard({ match, onStartChat, startChatPending, highlight }: {
  match: MatchData
  onStartChat: (match: MatchData) => void
  startChatPending: boolean
  highlight?: boolean
}) {
  const { t } = useTranslation()
  const conv = match.conversation
  const hasConversation = Array.isArray(conv) ? conv.length > 0 : !!conv

  return (
    <Card className={highlight ? 'overflow-hidden ring-1 ring-primary/20 bg-primary/5' : 'overflow-hidden'}>
      <div className="flex items-stretch">
        {match.property?.photos?.[0] ? (
          <img
            src={match.property.photos[0].photo_url}
            alt={match.property.title}
            className="w-24 h-auto object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-24 bg-muted flex items-center justify-center flex-shrink-0">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
            </svg>
          </div>
        )}
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold truncate">{match.property?.title}</p>
              <span className="text-lg font-bold text-primary flex-shrink-0">
                ₪{match.property?.price_monthly.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {match.property?.address_neighborhood}
              {match.property?.address_city ? `, ${match.property.address_city}` : ''}
            </p>
            {match.host ? (
              <div className="flex items-center gap-1.5 mt-1">
                {match.host.avatar_url ? (
                  <img src={match.host.avatar_url} alt="" className="w-4 h-4 rounded-full object-cover" />
                ) : null}
                <span className="text-xs text-muted-foreground">
                  {match.host.display_name || match.host.full_name}
                </span>
              </div>
            ) : null}
          </div>
          <Button
            size="sm"
            className="mt-2 self-end rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
            onClick={() => onStartChat(match)}
            disabled={startChatPending}
          >
            <svg className="w-4 h-4 me-1.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {hasConversation ? t('matches.continueChatting') : t('matches.startChatting')}
          </Button>
        </div>
      </div>
      {match.matched_at ? (
        <div className="px-3 pb-2">
          <p className="text-xs text-muted-foreground">
            {t('matches.itsAMatch')} {formatDistanceToNow(new Date(match.matched_at), { addSuffix: true })}
          </p>
        </div>
      ) : null}
    </Card>
  )
}

export function MatchesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const { data: matchedData, isLoading: loadingMatched } = useSeekerMatches('matched')
  const { data: pendingData, isLoading: loadingPending } = useSeekerMatches('pending')
  const startConversation = useStartConversation()

  const activeMatches = (matchedData || []) as MatchData[]
  const pendingMatches = (pendingData || []) as MatchData[]
  const isLoading = loadingMatched || loadingPending

  const { seenMatchIds, markMatchesSeen } = useMatchStore()
  const seenSet = new Set(seenMatchIds)

  const newMatches = activeMatches.filter((m) => !seenSet.has(m.id))
  const previousMatches = activeMatches.filter((m) => seenSet.has(m.id))

  const activeMatchIds = activeMatches.map((m) => m.id)
  const activeMatchIdsKey = activeMatchIds.join(',')

  useEffect(() => {
    if (activeMatchIds.length > 0) {
      markMatchesSeen(activeMatchIds)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMatchIdsKey, markMatchesSeen])

  const handleStartChat = async (match: MatchData) => {
    const conv = match.conversation
    const conversationId = Array.isArray(conv) ? conv[0]?.id : conv?.id

    if (conversationId) {
      navigate(`/messages/${conversationId}`)
      return
    }

    const conversation = await startConversation.mutateAsync(match.id)
    navigate(`/messages/${conversation.id}`)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Header title={t('matches.title')} />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] px-4 text-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">{t('matches.noMatches')}</h2>
          <p className="text-muted-foreground">{t('matches.startSwiping')}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title={t('matches.title')} />
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header title={t('matches.title')} />

      <div className="p-4 space-y-6">
        {newMatches.length > 0 ? (
          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              {t('matches.newMatches')}
              <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0">
                {newMatches.length}
              </Badge>
            </h2>
            <div className="space-y-3">
              {newMatches.map((match) => (
                <MatchCard key={match.id} match={match} onStartChat={handleStartChat} startChatPending={startConversation.isPending} highlight />
              ))}
            </div>
          </section>
        ) : null}

        {previousMatches.length > 0 ? (
          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              {t('matches.active')}
              <Badge className="bg-green-500 text-white border-0">{previousMatches.length}</Badge>
            </h2>
            <div className="space-y-3">
              {previousMatches.map((match) => (
                <MatchCard key={match.id} match={match} onStartChat={handleStartChat} startChatPending={startConversation.isPending} />
              ))}
            </div>
          </section>
        ) : null}

        {pendingMatches.length > 0 ? (
          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              {t('matches.pending')}
              <Badge variant="outline">{pendingMatches.length}</Badge>
            </h2>
            <div className="space-y-3">
              {pendingMatches.map((match) => {
                const hoursLeft = Math.max(
                  0,
                  Math.round(
                    (new Date(match.expires_at).getTime() - Date.now()) / (1000 * 60 * 60)
                  )
                )

                return (
                  <Card key={match.id} className="overflow-hidden opacity-80">
                    <div className="flex items-stretch">
                      {match.property?.photos?.[0] ? (
                        <img
                          src={match.property.photos[0].photo_url}
                          alt={match.property?.title}
                          className="w-20 h-auto object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-20 bg-muted flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
                          </svg>
                        </div>
                      )}

                      <div className="flex-1 p-3 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium truncate">{match.property?.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {match.property?.address_neighborhood}
                            </p>
                          </div>
                          <span className="text-lg font-bold flex-shrink-0">
                            ₪{match.property?.price_monthly.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-amber-600 font-medium">
                            {t('matches.waitingForResponse')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {t('matches.expiresIn', { hours: hoursLeft })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </section>
        ) : null}

        {activeMatches.length === 0 && pendingMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {t('matches.noMatches')}
            </h2>
            <p className="text-muted-foreground">{t('matches.startSwiping')}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
