-- Fix: The BEFORE UPDATE trigger on matches inserts into conversations,
-- but RLS blocks the insert because the trigger runs as the authenticated user.
-- Solution: Make the trigger function SECURITY DEFINER to bypass RLS.

CREATE OR REPLACE FUNCTION create_conversation_on_match()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.status = 'matched' AND OLD.status = 'pending' THEN
        INSERT INTO conversations (match_id)
        VALUES (NEW.id)
        ON CONFLICT (match_id) DO NOTHING;
        NEW.matched_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
