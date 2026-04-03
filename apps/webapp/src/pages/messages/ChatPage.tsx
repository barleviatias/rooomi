import { useEffect, useRef, useCallback, useState, memo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@roomi/ui'
import { Button, Input, Badge } from '@roomi/ui'
import { useAuthStore } from '@/lib/store'
import { useConversation, useMessages, useSendMessage, useMarkMessagesAsRead, useRealtimeMessages } from '@/hooks/useChat'
import { format, isToday, isYesterday } from 'date-fns'

interface MatchProperty {
  id?: string
  title?: string
  address_city?: string
  address_neighborhood?: string
  price_monthly?: number
  total_rooms?: number
  has_balcony?: boolean
  has_ac?: boolean
  has_parking?: boolean
  has_elevator?: boolean
  has_furnished?: boolean
  available_from?: string
  photos?: Array<{ photo_url: string; is_primary?: boolean }>
}

interface MatchUser {
  id: string
  full_name: string
  display_name?: string
  avatar_url?: string
  bio?: string
  is_verified?: boolean
}

interface ConversationMatch {
  seeker_id: string
  host_id: string
  status?: string
  property?: MatchProperty
  seeker?: MatchUser
  host?: MatchUser
}

interface MessageData {
  id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

const PropertyBanner = memo(function PropertyBanner({
  property,
  isExpanded,
  onToggle,
}: {
  property: MatchProperty
  isExpanded: boolean
  onToggle: () => void
}) {
  const { t } = useTranslation()

  const primaryPhoto = property.photos?.find(p => p.is_primary) ?? property.photos?.[0]
  const location = property.address_neighborhood
    ? `${property.address_neighborhood}, ${property.address_city}`
    : property.address_city

  return (
    <div className="border-b border-border bg-muted/30">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-2 text-start hover:bg-muted/50 transition-colors"
      >
        {primaryPhoto ? (
          <img
            src={primaryPhoto.photo_url}
            alt={property.title || ''}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
            </svg>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{property.title}</p>
          <p className="text-xs text-muted-foreground truncate">{location}</p>
        </div>

        {property.price_monthly ? (
          <span className="text-sm font-semibold text-primary flex-shrink-0">
            ₪{property.price_monthly.toLocaleString()}{t('property.perMonth')}
          </span>
        ) : null}

        <svg
          className={cn(
            'w-4 h-4 text-muted-foreground transition-transform flex-shrink-0',
            isExpanded && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded ? (
        <div className="px-4 pb-3 space-y-3">
          {primaryPhoto ? (
            <div className="relative rounded-xl overflow-hidden aspect-video">
              <img
                src={primaryPhoto.photo_url}
                alt={property.title || ''}
                className="w-full h-full object-cover"
              />
              {property.photos && property.photos.length > 1 ? (
                <div className="absolute bottom-2 end-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                  {property.photos.length} {t('property.photos').toLowerCase()}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex items-center gap-2 flex-wrap">
            {property.total_rooms ? (
              <Badge variant="secondary" className="text-xs">
                {t('property.rooms', { count: property.total_rooms })}
              </Badge>
            ) : null}
            {property.has_ac ? (
              <Badge variant="secondary" className="text-xs">{t('property.ac')}</Badge>
            ) : null}
            {property.has_balcony ? (
              <Badge variant="secondary" className="text-xs">{t('property.balcony')}</Badge>
            ) : null}
            {property.has_parking ? (
              <Badge variant="secondary" className="text-xs">{t('property.parking')}</Badge>
            ) : null}
            {property.has_elevator ? (
              <Badge variant="secondary" className="text-xs">{t('property.elevator')}</Badge>
            ) : null}
            {property.has_furnished ? (
              <Badge variant="secondary" className="text-xs">{t('property.furnished')}</Badge>
            ) : null}
          </div>

          {property.available_from ? (
            <p className="text-xs text-muted-foreground">
              {t('property.availableFrom', {
                date: new Date(property.available_from).toLocaleDateString(),
              })}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
})

const ChatHeader = memo(function ChatHeader({
  otherUser,
  propertyTitle,
  isCurrentUserSeeker,
}: {
  otherUser: MatchUser
  propertyTitle?: string
  isCurrentUserSeeker: boolean
}) {
  const { t } = useTranslation()

  const roleLabel = isCurrentUserSeeker
    ? t('profile.host')
    : t('profile.seeker')

  return (
    <header
      className="sticky top-0 z-40 bg-background border-b border-border px-4 pb-3"
      style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}
    >
      <div className="flex items-center gap-3">
        <Link to="/messages" className="p-2 -ms-2 hover:bg-muted rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <div className="relative">
          <img
            src={
              otherUser.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.full_name)}&background=random`
            }
            alt={otherUser.display_name || otherUser.full_name}
            className="w-10 h-10 rounded-full object-cover"
          />
          {otherUser.is_verified ? (
            <div className="absolute -bottom-0.5 -end-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center ring-2 ring-background">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          ) : null}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">
              {otherUser.display_name || otherUser.full_name}
            </p>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0">
              {roleLabel}
            </Badge>
          </div>
          {propertyTitle ? (
            <p className="text-xs text-muted-foreground truncate">
              {propertyTitle}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  )
})

export function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [newMessage, setNewMessage] = useState('')
  const [showPropertyBanner, setShowPropertyBanner] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: conversation } = useConversation(id || '')
  const { data: messages } = useMessages(id || '')
  const sendMessage = useSendMessage()
  const markAsRead = useMarkMessagesAsRead()

  const handleNewRealtimeMessage = useCallback(() => {}, [])
  useRealtimeMessages(id || '', handleNewRealtimeMessage)

  const match = (conversation as { match?: ConversationMatch })?.match
  const isCurrentUserSeeker = match?.seeker_id === user?.id
  const otherUser = isCurrentUserSeeker ? match?.host : match?.seeker
  const property = match?.property

  const conversationMessages = (messages || []) as MessageData[]

  useEffect(() => {
    if (id) {
      markAsRead.mutate(id)
    }
  }, [id, markAsRead])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationMessages.length])

  const formatMessageDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return t('messages.today')
    if (isYesterday(date)) return t('messages.yesterday')
    return format(date, 'MMM d')
  }, [t])

  const handleSend = useCallback(() => {
    if (!newMessage.trim() || !user || !id) return
    sendMessage.mutate({ conversationId: id, content: newMessage.trim() })
    setNewMessage('')
  }, [newMessage, user, id, sendMessage])

  const handleToggleBanner = useCallback(() => {
    setShowPropertyBanner(prev => !prev)
  }, [])

  if (!conversation || !otherUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ChatHeader
        otherUser={otherUser}
        propertyTitle={property?.title}
        isCurrentUserSeeker={isCurrentUserSeeker}
      />

      {property ? (
        <PropertyBanner
          property={property}
          isExpanded={showPropertyBanner}
          onToggle={handleToggleBanner}
        />
      ) : null}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversationMessages.map((message, index) => {
          const isOwn = message.sender_id === user?.id
          const showDate =
            index === 0 ||
            formatMessageDate(message.created_at) !==
              formatMessageDate(conversationMessages[index - 1].created_at)

          return (
            <div key={message.id}>
              {showDate ? (
                <div className="text-center text-xs text-muted-foreground my-4">
                  {formatMessageDate(message.created_at)}
                </div>
              ) : null}

              <div
                className={cn(
                  'flex',
                  isOwn ? 'justify-start' : 'justify-end'
                )}
              >
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2',
                    isOwn
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-bs-md'
                      : 'bg-muted rounded-be-md'
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={cn(
                      'text-[10px] mt-1',
                      isOwn
                        ? 'text-white/70'
                        : 'text-muted-foreground'
                    )}
                  >
                    {format(new Date(message.created_at), 'HH:mm')}
                    {isOwn && message.is_read ? ' \u2713\u2713' : ''}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 bg-background border-t border-border p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('messages.typeMessage')}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <Button onClick={handleSend} disabled={!newMessage.trim() || sendMessage.isPending}>
            {t('messages.send')}
          </Button>
        </div>
      </div>
    </div>
  )
}
