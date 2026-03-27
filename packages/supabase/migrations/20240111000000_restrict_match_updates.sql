DROP POLICY IF EXISTS "Participants can update match status" ON matches;

CREATE POLICY "Host can accept or reject matches" ON matches
    FOR UPDATE
    USING (auth.uid() = host_id AND status = 'pending')
    WITH CHECK (
        auth.uid() = host_id
        AND status IN ('matched', 'rejected')
    );

CREATE POLICY "Either participant can unmatch" ON matches
    FOR UPDATE
    USING (
        (auth.uid() = host_id OR auth.uid() = seeker_id)
        AND status = 'matched'
    )
    WITH CHECK (
        (auth.uid() = host_id OR auth.uid() = seeker_id)
        AND status = 'unmatched'
    );

CREATE OR REPLACE FUNCTION sanitize_match_update()
RETURNS TRIGGER AS $$
BEGIN
    IF pg_trigger_depth() > 1 THEN
        RETURN NEW;
    END IF;

    NEW.seeker_id := OLD.seeker_id;
    NEW.property_id := OLD.property_id;
    NEW.host_id := OLD.host_id;
    NEW.seeker_liked_at := OLD.seeker_liked_at;
    NEW.created_at := OLD.created_at;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sanitize_match_update_trigger
    BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION sanitize_match_update();

CREATE OR REPLACE FUNCTION sanitize_message_update()
RETURNS TRIGGER AS $$
BEGIN
    IF pg_trigger_depth() > 1 THEN
        RETURN NEW;
    END IF;

    NEW.conversation_id := OLD.conversation_id;
    NEW.sender_id := OLD.sender_id;
    NEW.content := OLD.content;
    NEW.message_type := OLD.message_type;
    NEW.created_at := OLD.created_at;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sanitize_message_update_trigger
    BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION sanitize_message_update();

CREATE OR REPLACE FUNCTION sanitize_conversation_update()
RETURNS TRIGGER AS $$
BEGIN
    IF pg_trigger_depth() > 1 THEN
        RETURN NEW;
    END IF;

    NEW.match_id := OLD.match_id;
    NEW.last_message_text := OLD.last_message_text;
    NEW.last_message_at := OLD.last_message_at;
    NEW.last_message_by := OLD.last_message_by;
    NEW.created_at := OLD.created_at;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sanitize_conversation_update_trigger
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION sanitize_conversation_update();
