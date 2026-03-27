import { useState } from "react"
import { MatchesTable } from "@/features/matches/MatchesTable"
import { ConversationViewer } from "@/features/matches/ConversationViewer"

export function MatchesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Matches</h1>
      <MatchesTable onViewConversation={setSelectedConversation} />
      {selectedConversation && (
        <ConversationViewer conversationId={selectedConversation} />
      )}
    </div>
  )
}
