CREATE TABLE push_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, token)
);

CREATE INDEX idx_push_tokens_user ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_active ON push_tokens(user_id) WHERE is_active = TRUE;

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tokens" ON push_tokens
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION create_notification(
    p_recipient_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_body TEXT,
    p_action_url TEXT DEFAULT NULL,
    p_related_match_id UUID DEFAULT NULL,
    p_related_property_id UUID DEFAULT NULL,
    p_related_profile_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_caller UUID := auth.uid();
BEGIN
    IF v_caller IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF p_type = 'new_like' THEN
        IF NOT EXISTS (
            SELECT 1 FROM matches
            WHERE seeker_id = v_caller AND host_id = p_recipient_id AND id = p_related_match_id
        ) THEN
            RAISE EXCEPTION 'Unauthorized: no matching relationship for new_like';
        END IF;
    ELSIF p_type = 'new_match' THEN
        IF NOT EXISTS (
            SELECT 1 FROM matches
            WHERE host_id = v_caller AND seeker_id = p_recipient_id AND id = p_related_match_id
        ) THEN
            RAISE EXCEPTION 'Unauthorized: no matching relationship for new_match';
        END IF;
    ELSIF p_type = 'new_message' THEN
        IF NOT EXISTS (
            SELECT 1 FROM matches
            WHERE id = p_related_match_id
              AND ((seeker_id = v_caller AND host_id = p_recipient_id)
                OR (host_id = v_caller AND seeker_id = p_recipient_id))
        ) THEN
            RAISE EXCEPTION 'Unauthorized: no matching relationship for new_message';
        END IF;
    ELSE
        RAISE EXCEPTION 'Unknown notification type: %', p_type;
    END IF;

    IF p_action_url IS NOT NULL AND p_action_url NOT LIKE '/%' THEN
        RAISE EXCEPTION 'action_url must be a relative path starting with /';
    END IF;

    INSERT INTO notifications (recipient_id, type, title, body, action_url, related_match_id, related_property_id, related_profile_id)
    VALUES (p_recipient_id, p_type, p_title, p_body, p_action_url, p_related_match_id, p_related_property_id, p_related_profile_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Block direct client inserts to notifications" ON notifications
    FOR INSERT WITH CHECK (false);
