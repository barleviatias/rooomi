import { useQuery } from "@tanstack/react-query"
import { fetchConversation } from "@/lib/api/matches"
import { Card, CardContent, CardHeader, CardTitle } from "@roomi/ui"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@roomi/ui"
import { format } from "date-fns"

interface ConversationViewerProps {
  conversationId: string
}

interface MessageData {
  id: string
  sender_id: string
  content: string
  message_type: string
  created_at: string
}

interface ConversationData {
  match?: {
    seeker?: { id: string; full_name: string }
    host?: { id: string; full_name: string }
  }
}

export function ConversationViewer({ conversationId }: ConversationViewerProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => fetchConversation(conversationId),
  })

  if (isLoading) return <Skeleton className="h-96 w-full" />

  const conversation = data?.conversation as ConversationData | undefined
  const messages = (data?.messages || []) as MessageData[]
  const seekerId = conversation?.match?.seeker?.id
  const seekerName = conversation?.match?.seeker?.full_name || "Seeker"
  const hostName = conversation?.match?.host?.full_name || "Host"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          Conversation: {seekerName} & {hostName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No messages</p>
          )}
          {messages.map((msg) => {
            const isSeeker = msg.sender_id === seekerId
            return (
              <div key={msg.id} className={cn("flex flex-col", isSeeker ? "items-start" : "items-end")}>
                <div className={cn(
                  "rounded-lg px-3 py-2 max-w-[80%] text-sm",
                  isSeeker ? "bg-muted" : "bg-primary/10",
                )}>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {isSeeker ? seekerName : hostName}
                  </p>
                  <p>{msg.content}</p>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">
                  {format(new Date(msg.created_at), "MMM d, HH:mm")}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
