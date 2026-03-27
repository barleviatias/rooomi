import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Header } from '@/components/layout'
import { Card, Badge } from '@roomi/ui'
import { useAuthStore } from '@/lib/store'
import { useConversations, useRealtimeConversations } from '@/hooks/useChat'
import { formatDistanceToNow } from 'date-fns'

interface ConversationMatch {
  seeker_id: string
  host_id: string
  property?: {
    title?: string
    address_city?: string
    address_neighborhood?: string
    price_monthly?: number
    photos?: Array<{ photo_url: string; is_primary?: boolean }>
  }
  seeker?: { id: string; full_name: string; display_name?: string; avatar_url?: string }
  host?: { id: string; full_name: string; display_name?: string; avatar_url?: string }
}

interface ConversationData {
  id: string
  last_message_text?: string | null
  last_message_at?: string | null
  seeker_unread_count: number
  host_unread_count: number
  match?: ConversationMatch
}

const ConversationCard = memo(function ConversationCard({
  conv,
  userId,
}: {
  conv: ConversationData
  userId: string
}) {
  const { t } = useTranslation()
  const match = conv.match
  const isSeeker = match?.seeker_id === userId
  const otherUser = isSeeker ? match?.host : match?.seeker
  const unreadCount = isSeeker ? conv.seeker_unread_count : conv.host_unread_count
  const property = match?.property
  const primaryPhoto = property?.photos?.find(p => p.is_primary) ?? property?.photos?.[0]

  const location = property?.address_neighborhood
    ? `${property.address_neighborhood}, ${property.address_city}`
    : property?.address_city

  return (
    <Link to={`/messages/${conv.id}`}>
      <Card className="p-3 hover:bg-muted/50 transition-colors">
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            <img
              src={
                otherUser?.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  otherUser?.full_name || 'User'
                )}&background=random`
              }
              alt={otherUser?.display_name || otherUser?.full_name || 'User'}
              className="w-12 h-12 rounded-full object-cover"
            />
            {unreadCount > 0 ? (
              <div className="absolute -top-1 -end-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xs text-primary-foreground font-medium">
                  {unreadCount}
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className={unreadCount > 0 ? 'font-semibold truncate' : 'font-medium truncate'}>
                  {otherUser?.display_name || otherUser?.full_name}
                </span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0">
                  {isSeeker ? t('profile.host') : t('profile.seeker')}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0 ms-2">
                {conv.last_message_at
                  ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })
                  : null}
              </span>
            </div>

            <p className={
              unreadCount > 0
                ? 'text-sm truncate font-medium'
                : 'text-sm text-muted-foreground truncate'
            }>
              {conv.last_message_text || t('messages.startConversation')}
            </p>
          </div>

          {primaryPhoto ? (
            <img
              src={primaryPhoto.photo_url}
              alt={property?.title || ''}
              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-muted flex flex-col items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
              </svg>
            </div>
          )}
        </div>

        {property ? (
          <div className="mt-2 ms-15 flex items-center gap-2 text-xs text-muted-foreground">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{property.title}</span>
            {location ? (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50 flex-shrink-0" />
                <span className="truncate">{location}</span>
              </>
            ) : null}
            {property.price_monthly ? (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50 flex-shrink-0" />
                <span className="font-medium text-foreground flex-shrink-0">
                  ₪{property.price_monthly.toLocaleString()}
                </span>
              </>
            ) : null}
          </div>
        ) : null}
      </Card>
    </Link>
  )
})

export function MessagesPage() {
  const { t } = useTranslation()
  const { isAuthenticated, user } = useAuthStore()
  const { data: conversations, isLoading } = useConversations()
  useRealtimeConversations()

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen">
        <Header title={t('messages.title')} />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] px-4 text-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">{t('messages.noMessages')}</h2>
          <p className="text-muted-foreground">
            {t('messages.startConversation')}
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title={t('messages.title')} />
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    )
  }

  const conversationList = (conversations || []) as ConversationData[]

  return (
    <div className="min-h-screen">
      <Header title={t('messages.title')} />

      <div className="p-4">
        {conversationList.length > 0 ? (
          <div className="space-y-2">
            {conversationList.map((conv) => (
              <ConversationCard key={conv.id} conv={conv} userId={user.id} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {t('messages.noMessages')}
            </h2>
            <p className="text-muted-foreground">
              {t('messages.startConversation')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
