CREATE OR REPLACE FUNCTION get_recommended_properties(
    p_seeker_id UUID,
    p_limit INT DEFAULT 50,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    host_id UUID,
    title TEXT,
    description TEXT,
    price_monthly INTEGER,
    price_bills_included BOOLEAN,
    deposit_months NUMERIC,
    address_street TEXT,
    address_city TEXT,
    address_neighborhood TEXT,
    location_lat NUMERIC,
    location_lng NUMERIC,
    hide_exact_address BOOLEAN,
    property_type TEXT,
    total_rooms INTEGER,
    available_rooms INTEGER,
    bathrooms INTEGER,
    size_sqm INTEGER,
    floor_number INTEGER,
    total_floors INTEGER,
    available_from DATE,
    minimum_lease_months INTEGER,
    has_balcony BOOLEAN,
    has_elevator BOOLEAN,
    has_parking BOOLEAN,
    has_safe_room BOOLEAN,
    has_furnished BOOLEAN,
    has_pets_allowed BOOLEAN,
    has_ac BOOLEAN,
    amenities_extra JSONB,
    rules JSONB,
    current_roommates_count INTEGER,
    current_roommates_description TEXT,
    status TEXT,
    is_featured BOOLEAN,
    view_count INTEGER,
    like_count INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
DECLARE
    v_budget_min INTEGER;
    v_budget_max INTEGER;
    v_preferred_cities TEXT[];
    v_preferred_neighborhoods TEXT[];
    v_move_in_earliest DATE;
    v_move_in_latest DATE;
    v_must_balcony BOOLEAN;
    v_must_elevator BOOLEAN;
    v_must_parking BOOLEAN;
    v_must_safe_room BOOLEAN;
    v_must_furnished BOOLEAN;
    v_must_pets BOOLEAN;
    v_must_ac BOOLEAN;
    v_has_prefs BOOLEAN := FALSE;
BEGIN
    SELECT
        sp.budget_min, sp.budget_max,
        sp.preferred_cities, sp.preferred_neighborhoods,
        sp.move_in_date_earliest, sp.move_in_date_latest,
        sp.must_have_balcony, sp.must_have_elevator,
        sp.must_have_parking, sp.must_have_safe_room,
        sp.must_have_furnished, sp.must_have_pets_allowed,
        sp.must_have_ac
    INTO
        v_budget_min, v_budget_max,
        v_preferred_cities, v_preferred_neighborhoods,
        v_move_in_earliest, v_move_in_latest,
        v_must_balcony, v_must_elevator,
        v_must_parking, v_must_safe_room,
        v_must_furnished, v_must_pets,
        v_must_ac
    FROM seeker_preferences sp
    WHERE sp.profile_id = p_seeker_id;

    IF FOUND THEN
        v_has_prefs := TRUE;
    END IF;

    RETURN QUERY
    SELECT
        p.id, p.host_id, p.title, p.description,
        p.price_monthly, p.price_bills_included,
        p.deposit_months, p.address_street, p.address_city,
        p.address_neighborhood, p.location_lat, p.location_lng,
        p.hide_exact_address, p.property_type, p.total_rooms,
        p.available_rooms, p.bathrooms, p.size_sqm, p.floor_number,
        p.total_floors, p.available_from, p.minimum_lease_months,
        p.has_balcony, p.has_elevator, p.has_parking, p.has_safe_room,
        p.has_furnished, p.has_pets_allowed, p.has_ac,
        p.amenities_extra, p.rules, p.current_roommates_count,
        p.current_roommates_description, p.status::TEXT, p.is_featured,
        p.view_count, p.like_count, p.created_at, p.updated_at
    FROM properties p
    WHERE p.status = 'active'
      AND p.host_id != p_seeker_id
      AND NOT EXISTS (
          SELECT 1 FROM interactions i
          WHERE i.actor_id = p_seeker_id AND i.property_id = p.id
      )
      AND (NOT v_has_prefs OR v_budget_min IS NULL OR p.price_monthly >= v_budget_min)
      AND (NOT v_has_prefs OR v_budget_max IS NULL OR p.price_monthly <= v_budget_max)
      AND (NOT v_has_prefs OR v_preferred_cities IS NULL OR array_length(v_preferred_cities, 1) IS NULL OR p.address_city = ANY(v_preferred_cities))
      AND (NOT v_has_prefs OR NOT COALESCE(v_must_balcony, FALSE) OR p.has_balcony = TRUE)
      AND (NOT v_has_prefs OR NOT COALESCE(v_must_elevator, FALSE) OR p.has_elevator = TRUE)
      AND (NOT v_has_prefs OR NOT COALESCE(v_must_parking, FALSE) OR p.has_parking = TRUE)
      AND (NOT v_has_prefs OR NOT COALESCE(v_must_safe_room, FALSE) OR p.has_safe_room = TRUE)
      AND (NOT v_has_prefs OR NOT COALESCE(v_must_furnished, FALSE) OR p.has_furnished = TRUE)
      AND (NOT v_has_prefs OR NOT COALESCE(v_must_pets, FALSE) OR p.has_pets_allowed = TRUE)
      AND (NOT v_has_prefs OR NOT COALESCE(v_must_ac, FALSE) OR p.has_ac = TRUE)
      AND (NOT v_has_prefs OR v_move_in_earliest IS NULL OR p.available_from >= v_move_in_earliest)
      AND (NOT v_has_prefs OR v_move_in_latest IS NULL OR p.available_from <= v_move_in_latest)
    ORDER BY p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_scored_seekers(p_property_id UUID)
RETURNS TABLE (
    match_id UUID,
    seeker_id UUID,
    seeker_liked_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    seeker_full_name TEXT,
    seeker_display_name TEXT,
    seeker_avatar_url TEXT,
    seeker_bio TEXT,
    seeker_gender TEXT,
    seeker_is_verified BOOLEAN,
    seeker_last_active_at TIMESTAMPTZ,
    seeker_created_at TIMESTAMPTZ,
    seeker_instagram_handle TEXT,
    seeker_preferred_city TEXT,
    lifestyle_is_smoker BOOLEAN,
    lifestyle_has_pet BOOLEAN,
    lifestyle_keeps_kosher BOOLEAN,
    lifestyle_is_student BOOLEAN,
    lifestyle_hosting_level INTEGER,
    lifestyle_sleeping_level INTEGER,
    lifestyle_cleanliness_level INTEGER,
    lifestyle_noise_level INTEGER,
    lifestyle_occupation TEXT,
    lifestyle_work_schedule TEXT,
    lifestyle_interests TEXT[],
    seeker_budget_min INTEGER,
    seeker_budget_max INTEGER,
    profile_completion_pct INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id AS match_id,
        m.seeker_id,
        m.seeker_liked_at,
        m.expires_at,
        pr.full_name AS seeker_full_name,
        pr.display_name AS seeker_display_name,
        pr.avatar_url AS seeker_avatar_url,
        pr.bio AS seeker_bio,
        pr.gender::TEXT AS seeker_gender,
        pr.is_verified AS seeker_is_verified,
        pr.last_active_at AS seeker_last_active_at,
        pr.created_at AS seeker_created_at,
        pr.instagram_handle AS seeker_instagram_handle,
        pr.preferred_city AS seeker_preferred_city,
        pl.is_smoker AS lifestyle_is_smoker,
        pl.has_pet AS lifestyle_has_pet,
        pl.keeps_kosher AS lifestyle_keeps_kosher,
        pl.is_student AS lifestyle_is_student,
        pl.hosting_level AS lifestyle_hosting_level,
        pl.sleeping_level AS lifestyle_sleeping_level,
        pl.cleanliness_level AS lifestyle_cleanliness_level,
        pl.noise_level AS lifestyle_noise_level,
        pl.occupation AS lifestyle_occupation,
        pl.work_schedule AS lifestyle_work_schedule,
        pl.interests AS lifestyle_interests,
        sp.budget_min AS seeker_budget_min,
        sp.budget_max AS seeker_budget_max,
        pr.profile_completion_pct
    FROM matches m
    JOIN profiles pr ON pr.id = m.seeker_id
    LEFT JOIN profile_lifestyle pl ON pl.profile_id = m.seeker_id
    LEFT JOIN seeker_preferences sp ON sp.profile_id = m.seeker_id
    WHERE m.property_id = p_property_id
      AND m.status = 'pending'
    ORDER BY m.seeker_liked_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
