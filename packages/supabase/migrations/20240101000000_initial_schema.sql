-- Roomi Database Schema
-- Initial migration with all tables, RLS policies, functions and triggers

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TYPE gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE interaction_type AS ENUM ('like', 'pass', 'super_like');
CREATE TYPE match_status AS ENUM ('pending', 'matched', 'rejected', 'expired', 'unmatched');
CREATE TYPE property_status AS ENUM ('active', 'paused', 'rented', 'deleted');
CREATE TYPE message_type AS ENUM ('text', 'image', 'system', 'open_house_invite');
CREATE TYPE rsvp_status AS ENUM ('going', 'maybe', 'not_going');

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    full_name TEXT NOT NULL,
    display_name TEXT,
    date_of_birth DATE,
    gender gender,
    avatar_url TEXT,
    bio TEXT,
    is_seeker BOOLEAN DEFAULT TRUE,
    is_host BOOLEAN DEFAULT FALSE,
    instagram_handle TEXT,
    preferred_language TEXT DEFAULT 'he',
    preferred_city TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    profile_completion_pct INTEGER DEFAULT 0,
    last_active_at TIMESTAMPTZ,
    avg_response_time_hours NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profile_lifestyle (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    is_smoker BOOLEAN DEFAULT FALSE,
    has_pet BOOLEAN DEFAULT FALSE,
    keeps_kosher BOOLEAN DEFAULT FALSE,
    is_student BOOLEAN DEFAULT FALSE,
    hosting_level INTEGER CHECK (hosting_level BETWEEN 1 AND 5),
    sleeping_level INTEGER CHECK (sleeping_level BETWEEN 1 AND 5),
    cleanliness_level INTEGER CHECK (cleanliness_level BETWEEN 1 AND 5),
    noise_level INTEGER CHECK (noise_level BETWEEN 1 AND 5),
    occupation TEXT,
    work_schedule TEXT,
    interests TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE seeker_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    budget_min INTEGER,
    budget_max INTEGER,
    preferred_cities TEXT[],
    preferred_neighborhoods TEXT[],
    max_distance_km INTEGER,
    move_in_date_earliest DATE,
    move_in_date_latest DATE,
    must_have_balcony BOOLEAN DEFAULT FALSE,
    must_have_elevator BOOLEAN DEFAULT FALSE,
    must_have_parking BOOLEAN DEFAULT FALSE,
    must_have_safe_room BOOLEAN DEFAULT FALSE,
    must_have_furnished BOOLEAN DEFAULT FALSE,
    must_have_pets_allowed BOOLEAN DEFAULT FALSE,
    must_have_ac BOOLEAN DEFAULT FALSE,
    preferred_gender gender,
    preferred_age_min INTEGER,
    preferred_age_max INTEGER,
    roommate_smoker_ok BOOLEAN DEFAULT TRUE,
    roommate_pet_ok BOOLEAN DEFAULT TRUE,
    roommate_kosher_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profile_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    thumbnail_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_profile_photos_primary
    ON profile_photos(profile_id)
    WHERE is_primary = TRUE;

CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price_monthly INTEGER NOT NULL,
    price_bills_included BOOLEAN DEFAULT FALSE,
    deposit_months NUMERIC(3,1) DEFAULT 1,
    address_street TEXT,
    address_city TEXT NOT NULL,
    address_neighborhood TEXT,
    address_country TEXT DEFAULT 'Israel',
    location GEOGRAPHY(POINT, 4326),
    location_lat NUMERIC(10, 7),
    location_lng NUMERIC(10, 7),
    hide_exact_address BOOLEAN DEFAULT TRUE,
    property_type TEXT,
    total_rooms INTEGER NOT NULL,
    available_rooms INTEGER NOT NULL DEFAULT 1,
    bathrooms INTEGER DEFAULT 1,
    size_sqm INTEGER,
    floor_number INTEGER,
    total_floors INTEGER,
    available_from DATE NOT NULL,
    minimum_lease_months INTEGER DEFAULT 12,
    has_balcony BOOLEAN DEFAULT FALSE,
    has_elevator BOOLEAN DEFAULT FALSE,
    has_parking BOOLEAN DEFAULT FALSE,
    has_safe_room BOOLEAN DEFAULT FALSE,
    has_furnished BOOLEAN DEFAULT FALSE,
    has_pets_allowed BOOLEAN DEFAULT FALSE,
    has_ac BOOLEAN DEFAULT FALSE,
    amenities_extra JSONB DEFAULT '{}',
    rules JSONB DEFAULT '{}',
    current_roommates_count INTEGER DEFAULT 0,
    current_roommates_description TEXT,
    status property_status DEFAULT 'active',
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

CREATE INDEX idx_properties_location ON properties USING GIST(location);
CREATE INDEX idx_properties_city ON properties(address_city);
CREATE INDEX idx_properties_price ON properties(price_monthly);
CREATE INDEX idx_properties_status ON properties(status);

CREATE TABLE property_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    thumbnail_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    room_type TEXT,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_property_photos_primary
    ON property_photos(property_id)
    WHERE is_primary = TRUE;

CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    action interaction_type NOT NULL,
    UNIQUE(actor_id, property_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interactions_actor ON interactions(actor_id);
CREATE INDEX idx_interactions_property ON interactions(property_id);
CREATE INDEX idx_interactions_action ON interactions(action);

CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seeker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status match_status NOT NULL DEFAULT 'pending',
    seeker_liked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    host_responded_at TIMESTAMPTZ,
    matched_at TIMESTAMPTZ,
    unmatched_at TIMESTAMPTZ,
    unmatched_by UUID REFERENCES profiles(id),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
    UNIQUE(seeker_id, property_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_matches_seeker ON matches(seeker_id);
CREATE INDEX idx_matches_host ON matches(host_id);
CREATE INDEX idx_matches_property ON matches(property_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_expires ON matches(expires_at) WHERE status = 'pending';

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID UNIQUE NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    last_message_text TEXT,
    last_message_at TIMESTAMPTZ,
    last_message_by UUID REFERENCES profiles(id),
    seeker_unread_count INTEGER DEFAULT 0,
    host_unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type message_type DEFAULT 'text',
    metadata JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

CREATE TABLE open_houses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    max_attendees INTEGER,
    is_cancelled BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE open_house_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    open_house_id UUID NOT NULL REFERENCES open_houses(id) ON DELETE CASCADE,
    invitee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    rsvp_status rsvp_status,
    rsvp_at TIMESTAMPTZ,
    UNIQUE(open_house_id, invitee_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE saved_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    notes TEXT,
    UNIQUE(profile_id, property_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    related_match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    related_property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    related_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    push_sent BOOLEAN DEFAULT FALSE,
    push_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id) WHERE is_read = FALSE;

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reported_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reported_property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    UNIQUE(blocker_id, blocked_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE property_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_id TEXT,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_property_views_property ON property_views(property_id);
CREATE INDEX idx_property_views_date ON property_views(created_at);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_lifestyle ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE seeker_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Profile lifestyle viewable by everyone" ON profile_lifestyle
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own lifestyle" ON profile_lifestyle
    FOR ALL USING (auth.uid() = profile_id);

CREATE POLICY "Profile photos viewable by everyone" ON profile_photos
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own photos" ON profile_photos
    FOR ALL USING (auth.uid() = profile_id);

CREATE POLICY "Users can view own preferences" ON seeker_preferences
    FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can manage own preferences" ON seeker_preferences
    FOR ALL USING (auth.uid() = profile_id);

CREATE POLICY "Active properties are viewable by everyone" ON properties
    FOR SELECT USING (status = 'active' OR host_id = auth.uid());

CREATE POLICY "Users can insert own properties" ON properties
    FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Users can update own properties" ON properties
    FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Users can delete own properties" ON properties
    FOR DELETE USING (auth.uid() = host_id);

CREATE POLICY "Property photos viewable for active properties" ON property_photos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = property_photos.property_id
            AND (p.status = 'active' OR p.host_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage photos for own properties" ON property_photos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = property_photos.property_id
            AND p.host_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own interactions" ON interactions
    FOR SELECT USING (auth.uid() = actor_id);

CREATE POLICY "Users can create interactions" ON interactions
    FOR INSERT WITH CHECK (auth.uid() = actor_id);

CREATE POLICY "Match participants can view" ON matches
    FOR SELECT USING (auth.uid() = seeker_id OR auth.uid() = host_id);

CREATE POLICY "Seekers can create matches" ON matches
    FOR INSERT WITH CHECK (auth.uid() = seeker_id);

CREATE POLICY "Participants can update match status" ON matches
    FOR UPDATE USING (auth.uid() = host_id OR auth.uid() = seeker_id);

CREATE POLICY "Match participants can view conversations" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM matches m
            WHERE m.id = conversations.match_id
            AND (m.seeker_id = auth.uid() OR m.host_id = auth.uid())
        )
    );

CREATE POLICY "Conversation created on match" ON conversations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM matches m
            WHERE m.id = match_id
            AND (m.seeker_id = auth.uid() OR m.host_id = auth.uid())
            AND m.status = 'matched'
        )
    );

CREATE POLICY "Conversation participants can view messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations c
            JOIN matches m ON c.match_id = m.id
            WHERE c.id = messages.conversation_id
            AND (m.seeker_id = auth.uid() OR m.host_id = auth.uid())
        )
    );

CREATE POLICY "Conversation participants can send messages" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations c
            JOIN matches m ON c.match_id = m.id
            WHERE c.id = conversation_id
            AND (m.seeker_id = auth.uid() OR m.host_id = auth.uid())
            AND m.status = 'matched'
        )
    );

CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = recipient_id);

CREATE POLICY "Users can view own saved properties" ON saved_properties
    FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can manage own saved properties" ON saved_properties
    FOR ALL USING (auth.uid() = profile_id);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profile_lifestyle_updated_at
    BEFORE UPDATE ON profile_lifestyle
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER seeker_preferences_updated_at
    BEFORE UPDATE ON seeker_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION create_conversation_on_match()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'matched' AND OLD.status = 'pending' THEN
        INSERT INTO conversations (match_id)
        VALUES (NEW.id);
        NEW.matched_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_conversation_trigger
    BEFORE UPDATE ON matches
    FOR EACH ROW
    WHEN (NEW.status = 'matched' AND OLD.status = 'pending')
    EXECUTE FUNCTION create_conversation_on_match();

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
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_trigger
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

CREATE OR REPLACE FUNCTION expire_pending_matches()
RETURNS void AS $$
BEGIN
    UPDATE matches
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_property_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.action = 'like' OR NEW.action = 'super_like' THEN
        UPDATE properties
        SET like_count = like_count + 1
        WHERE id = NEW.property_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_like_trigger
    AFTER INSERT ON interactions
    FOR EACH ROW EXECUTE FUNCTION increment_property_like_count();

CREATE VIEW properties_feed AS
SELECT
    p.*,
    pp.photo_url as primary_photo_url,
    pr.full_name as host_name,
    pr.avatar_url as host_avatar,
    pr.avg_response_time_hours as host_response_time
FROM properties p
LEFT JOIN property_photos pp ON p.id = pp.property_id AND pp.is_primary = true
LEFT JOIN profiles pr ON p.host_id = pr.id
WHERE p.status = 'active';

CREATE VIEW seeker_match_activity AS
SELECT
    m.*,
    p.title as property_title,
    p.price_monthly,
    p.address_neighborhood,
    pp.photo_url as property_photo,
    pr.full_name as host_name,
    c.last_message_text,
    c.last_message_at,
    c.seeker_unread_count as unread_count
FROM matches m
JOIN properties p ON m.property_id = p.id
LEFT JOIN property_photos pp ON p.id = pp.property_id AND pp.is_primary = true
JOIN profiles pr ON m.host_id = pr.id
LEFT JOIN conversations c ON m.id = c.match_id;

CREATE VIEW host_match_activity AS
SELECT
    m.*,
    p.title as property_title,
    pr.full_name as seeker_name,
    pr.avatar_url as seeker_avatar,
    pr.bio as seeker_bio,
    pl.occupation as seeker_occupation,
    c.last_message_text,
    c.last_message_at,
    c.host_unread_count as unread_count
FROM matches m
JOIN properties p ON m.property_id = p.id
JOIN profiles pr ON m.seeker_id = pr.id
LEFT JOIN profile_lifestyle pl ON pr.id = pl.profile_id
LEFT JOIN conversations c ON m.id = c.match_id;
