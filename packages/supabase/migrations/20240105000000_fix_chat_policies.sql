-- Fix chat: add missing UPDATE policies + realtime publication + SECURITY DEFINER on trigger

-- 1. Messages UPDATE policy (for markMessagesAsRead)
CREATE POLICY "Conversation participants can update messages" ON messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM conversations c
            JOIN matches m ON c.match_id = m.id
            WHERE c.id = messages.conversation_id
            AND (m.seeker_id = auth.uid() OR m.host_id = auth.uid())
        )
    );

-- 2. Conversations UPDATE policy (for unread count reset + trigger updates)
CREATE POLICY "Conversation participants can update conversations" ON conversations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM matches m
            WHERE m.id = conversations.match_id
            AND (m.seeker_id = auth.uid() OR m.host_id = auth.uid())
        )
    );

-- 3. Make the trigger function SECURITY DEFINER so it can update conversations
--    regardless of who sent the message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET
        last_message_text = NEW.content,
        last_message_at = NEW.created_at,
        last_message_by = NEW.sender_id,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Enable realtime for messages and conversations
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
