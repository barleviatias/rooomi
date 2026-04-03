import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { useAuthStore } from '@/lib/store/auth-store'
import * as chatService from '@/lib/services/chat'
import { mockConversations, mockMessages, mockMatches } from '@/lib/mock-data'

interface ConversationForCount {
  match?: { seeker_id?: string; host_id?: string } | null
  seeker_unread_count: number
  host_unread_count: number
}

export function useUnreadMessageCount() {
  const { user } = useAuthStore()
  const { data: conversations } = useConversations()

  return useMemo(() => {
    if (!conversations || !user) return 0
    const convList = conversations as ConversationForCount[]
    let total = 0
    for (const conv of convList) {
      const isSeeker = conv.match?.seeker_id === user.id
      total += isSeeker ? conv.seeker_unread_count : conv.host_unread_count
    }
    return total
  }, [conversations, user])
}

export function useConversations() {
  const { user, useMockData } = useAuthStore()

  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (useMockData || !user) {
        const userMatches = mockMatches.filter(
          m => m.seeker_id === user?.id || m.host_id === user?.id
        )
        const matchIds = userMatches.map(m => m.id)
        return mockConversations.filter(c => matchIds.includes(c.match_id))
      }
      return chatService.getConversations(user.id)
    },
    enabled: !!user,
    refetchInterval: useMockData ? false : 60000,
  })
}

export function useConversation(conversationId: string) {
  const { useMockData } = useAuthStore()

  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      if (useMockData) {
        return mockConversations.find(c => c.id === conversationId) || null
      }
      return chatService.getConversationById(conversationId)
    },
    enabled: !!conversationId,
  })
}

export function useMessages(conversationId: string) {
  const { useMockData } = useAuthStore()

  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (useMockData) {
        return mockMessages.filter(m => m.conversation_id === conversationId)
      }
      return chatService.getMessages(conversationId)
    },
    enabled: !!conversationId,
    refetchInterval: useMockData ? false : 60000,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  const { user, useMockData } = useAuthStore()

  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      if (!user) throw new Error('User not authenticated')

      if (useMockData) {
        return {
          id: `mock-msg-${Date.now()}`,
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: 'text' as const,
          is_read: false,
          is_deleted: false,
          created_at: new Date().toISOString(),
          sender: user,
        }
      }

      return chatService.sendMessage({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        message_type: 'text',
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useStartConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (matchId: string) => {
      return chatService.getOrCreateConversation(matchId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useMarkMessagesAsRead() {
  const { user, useMockData } = useAuthStore()

  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (useMockData || !user) return
      return chatService.markMessagesAsRead(conversationId, user.id)
    },
  })
}

export function useRealtimeMessages(conversationId: string, onNewMessage: (message: unknown) => void) {
  const { useMockData } = useAuthStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (useMockData || !conversationId) return

    const subscription = chatService.subscribeToMessages(conversationId, (message) => {
      onNewMessage(message)
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [conversationId, useMockData, onNewMessage, queryClient])
}

export function useRealtimeConversations() {
  const { user, useMockData } = useAuthStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (useMockData || !user) return

    const subscription = chatService.subscribeToConversationUpdates(user.id, () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [user, useMockData, queryClient])
}
