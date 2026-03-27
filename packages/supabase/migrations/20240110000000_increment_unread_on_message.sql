CREATE OR REPLACE FUNCTION increment_conversation_unread_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_seeker_id UUID;
    v_host_id UUID;
BEGIN
    SELECT m.seeker_id, m.host_id
    INTO v_seeker_id, v_host_id
    FROM conversations c
    JOIN matches m ON c.match_id = m.id
    WHERE c.id = NEW.conversation_id;

    IF NEW.sender_id = v_seeker_id THEN
        UPDATE conversations
        SET host_unread_count = host_unread_count + 1
        WHERE id = NEW.conversation_id;
    ELSIF NEW.sender_id = v_host_id THEN
        UPDATE conversations
        SET seeker_unread_count = seeker_unread_count + 1
        WHERE id = NEW.conversation_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_unread_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION increment_conversation_unread_count();
