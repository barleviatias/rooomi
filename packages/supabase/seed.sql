-- Roomi Seed Data - Basic data only
-- Profiles constraint dropped for dev seeding

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Host Profiles
INSERT INTO profiles (id, email, full_name, display_name, gender, avatar_url, bio, is_seeker, is_host, instagram_handle, preferred_language, preferred_city, is_verified, profile_completion_pct) VALUES
('11111111-1111-1111-1111-111111111111', 'tal@example.com', 'Tal Cohen', 'Tal', 'male', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', 'Tech worker who loves cooking and hosting friends.', false, true, 'tal.cohen', 'he', 'Tel Aviv', true, 85),
('22222222-2222-2222-2222-222222222222', 'maya@example.com', 'Maya Levi', 'Maya', 'female', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', 'Artist and yoga instructor. My apartment is my sanctuary.', false, true, 'maya.art', 'he', 'Tel Aviv', true, 90),
('33333333-3333-3333-3333-333333333333', 'noam@example.com', 'Noam Shapira', 'Noam', 'male', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', 'Software developer working remotely.', false, true, NULL, 'en', 'Tel Aviv', false, 70),
('44444444-4444-4444-4444-444444444444', 'dana@example.com', 'Dana Peretz', 'Dana', 'female', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop', 'Medical student at TAU. Organized and clean.', false, true, 'dana.p', 'he', 'Tel Aviv', true, 95),
('55555555-5555-5555-5555-555555555555', 'omer@example.com', 'Omer Avni', 'Omer', 'male', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', 'Music producer with a home studio.', false, true, 'omer.beats', 'he', 'Tel Aviv', false, 80);

-- Host Lifestyle
INSERT INTO profile_lifestyle (profile_id, is_smoker, has_pet, keeps_kosher, is_student, hosting_level, sleeping_level, cleanliness_level, noise_level, occupation, work_schedule, interests) VALUES
('11111111-1111-1111-1111-111111111111', false, false, false, false, 4, 3, 4, 3, 'Software Engineer', 'hybrid', ARRAY['cooking', 'tech', 'hiking']),
('22222222-2222-2222-2222-222222222222', false, true, false, false, 3, 5, 5, 2, 'Yoga Instructor', 'flexible', ARRAY['yoga', 'art', 'meditation']),
('33333333-3333-3333-3333-333333333333', false, false, false, false, 2, 2, 4, 2, 'Software Developer', 'remote', ARRAY['gaming', 'coding', 'travel']),
('44444444-4444-4444-4444-444444444444', false, false, true, true, 2, 4, 5, 2, 'Medical Student', 'office', ARRAY['medicine', 'running', 'reading']),
('55555555-5555-5555-5555-555555555555', true, false, false, false, 5, 1, 3, 4, 'Music Producer', 'flexible', ARRAY['music', 'djs', 'nightlife']);

-- Properties (using valid hex UUIDs - replaced 'p' prefix with 'a')
INSERT INTO properties (id, host_id, title, description, price_monthly, price_bills_included, deposit_months, address_street, address_city, address_neighborhood, location_lat, location_lng, property_type, total_rooms, available_rooms, bathrooms, size_sqm, floor_number, total_floors, available_from, minimum_lease_months, has_balcony, has_elevator, has_parking, has_safe_room, has_furnished, has_pets_allowed, has_ac, current_roommates_count, status, is_featured, published_at) VALUES
('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Sunny Room in Florentin', 'Bright, spacious room in a renovated Florentin apartment.', 4200, false, 1, 'Florentin St 45', 'Tel Aviv', 'Florentin', 32.0544, 34.7654, 'apartment', 3, 1, 1, 75, 3, 5, '2025-02-01', 12, true, false, false, false, true, true, true, 1, 'active', true, NOW()),
('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Artist Loft in Neve Tzedek', 'Unique artistic space in the heart of Neve Tzedek.', 5500, true, 2, 'Shabazi St 23', 'Tel Aviv', 'Neve Tzedek', 32.0589, 34.7634, 'apartment', 2, 1, 1, 65, 2, 3, '2025-02-15', 12, true, false, false, true, true, true, true, 1, 'active', true, NOW()),
('a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Modern Room in Lev Hair', 'Clean, modern room in central Tel Aviv.', 4800, false, 1.5, 'Dizengoff St 156', 'Tel Aviv', 'Lev Hair', 32.0756, 34.7745, 'apartment', 3, 1, 2, 90, 8, 12, '2025-03-01', 12, true, true, true, true, true, false, true, 1, 'active', false, NOW()),
('a4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Quiet Room near TAU', 'Perfect for students! Close to Tel Aviv University.', 3200, false, 1, 'Einstein St 34', 'Tel Aviv', 'Ramat Aviv', 32.1133, 34.8044, 'apartment', 4, 1, 2, 100, 2, 4, '2025-02-01', 12, false, true, true, true, false, false, true, 2, 'active', false, NOW()),
('a5555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'Creative Space in Old Jaffa', 'Unique room with music studio and rooftop access.', 4500, true, 2, 'Yefet St 89', 'Tel Aviv-Yafo', 'Old Jaffa', 32.0515, 34.7512, 'apartment', 2, 1, 1, 70, 4, 4, '2025-02-20', 6, true, false, false, false, true, true, true, 1, 'active', true, NOW()),
('a6666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'Cozy Studio in Kerem', 'Charming studio near Carmel Market.', 5200, true, 1, 'Kerem HaTeimanim St 12', 'Tel Aviv', 'Kerem HaTeimanim', 32.0634, 34.7678, 'studio', 1, 1, 1, 35, 1, 3, '2025-03-01', 6, false, false, false, false, true, false, true, 0, 'active', false, NOW());

-- Property Photos (using valid hex UUIDs)
INSERT INTO property_photos (id, property_id, photo_url, display_order, is_primary, room_type) VALUES
('b1111111-1111-1111-1111-000000000001', 'a1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 0, true, 'living_room'),
('b1111111-1111-1111-1111-000000000002', 'a1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 1, false, 'bedroom'),
('b1111111-1111-1111-1111-000000000003', 'a1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', 2, false, 'kitchen'),
('b2222222-2222-2222-2222-000000000001', 'a2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 0, true, 'living_room'),
('b2222222-2222-2222-2222-000000000002', 'a2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800', 1, false, 'bedroom'),
('b2222222-2222-2222-2222-000000000003', 'a2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800', 2, false, 'kitchen'),
('b3333333-3333-3333-3333-000000000001', 'a3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800', 0, true, 'living_room'),
('b3333333-3333-3333-3333-000000000002', 'a3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=800', 1, false, 'bedroom'),
('b4444444-4444-4444-4444-000000000001', 'a4444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800', 0, true, 'living_room'),
('b4444444-4444-4444-4444-000000000002', 'a4444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800', 1, false, 'bedroom'),
('b5555555-5555-5555-5555-000000000001', 'a5555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 0, true, 'living_room'),
('b5555555-5555-5555-5555-000000000002', 'a5555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1600566752229-250ed79470f8?w=800', 1, false, 'bedroom'),
('b6666666-6666-6666-6666-000000000001', 'a6666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800', 0, true, 'studio'),
('b6666666-6666-6666-6666-000000000002', 'a6666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800', 1, false, 'kitchenette');

-- Seeker Profiles
INSERT INTO profiles (id, email, full_name, display_name, gender, avatar_url, bio, is_seeker, is_host, instagram_handle, preferred_language, preferred_city, is_verified, profile_completion_pct) VALUES
('66666666-6666-6666-6666-666666666666', 'shira@example.com', 'Shira Ben-David', 'Shira', 'female', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop', 'UX designer looking for a chill apartment in TLV.', true, false, 'shira.design', 'he', 'Tel Aviv', true, 88),
('77777777-7777-7777-7777-777777777777', 'yoni@example.com', 'Yoni Katz', 'Yoni', 'male', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop', 'Law student at IDC. Clean, quiet, respectful.', true, false, NULL, 'en', 'Tel Aviv', false, 75),
('88888888-8888-8888-8888-888888888888', 'noa@example.com', 'Noa Friedman', 'Noa', 'female', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop', 'Marketing manager at a startup. Love dogs and coffee.', true, false, 'noa.f', 'he', 'Tel Aviv', true, 92);

-- Seeker Lifestyle
INSERT INTO profile_lifestyle (profile_id, is_smoker, has_pet, keeps_kosher, is_student, hosting_level, sleeping_level, cleanliness_level, noise_level, occupation, work_schedule, interests) VALUES
('66666666-6666-6666-6666-666666666666', false, false, false, false, 3, 4, 4, 3, 'UX Designer', 'hybrid', ARRAY['design', 'photography', 'yoga']),
('77777777-7777-7777-7777-777777777777', false, false, false, true, 2, 4, 5, 2, 'Law Student', 'office', ARRAY['law', 'basketball', 'cooking']),
('88888888-8888-8888-8888-888888888888', false, true, false, false, 4, 3, 4, 3, 'Marketing Manager', 'hybrid', ARRAY['marketing', 'dogs', 'coffee']);

-- Seeker Preferences
INSERT INTO seeker_preferences (profile_id, budget_min, budget_max, preferred_cities, preferred_neighborhoods, move_in_date_earliest, must_have_balcony, must_have_ac, roommate_smoker_ok, roommate_pet_ok) VALUES
('66666666-6666-6666-6666-666666666666', 3000, 5000, ARRAY['Tel Aviv'], ARRAY['Florentin', 'Neve Tzedek', 'Lev Hair'], '2025-02-01', true, true, false, true),
('77777777-7777-7777-7777-777777777777', 2500, 4000, ARRAY['Tel Aviv'], ARRAY['Ramat Aviv', 'Old North'], '2025-02-15', false, true, false, false),
('88888888-8888-8888-8888-888888888888', 3500, 5500, ARRAY['Tel Aviv'], ARRAY['Florentin', 'Kerem HaTeimanim', 'Neve Tzedek'], '2025-03-01', false, true, false, true);

-- Interactions (seekers liking/passing properties)
INSERT INTO interactions (id, actor_id, property_id, action, created_at) VALUES
('c1111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'a1111111-1111-1111-1111-111111111111', 'like', NOW() - INTERVAL '3 days'),
('c2222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'a2222222-2222-2222-2222-222222222222', 'like', NOW() - INTERVAL '2 days'),
('c3333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'a3333333-3333-3333-3333-333333333333', 'pass', NOW() - INTERVAL '2 days'),
('c4444444-4444-4444-4444-444444444444', '77777777-7777-7777-7777-777777777777', 'a4444444-4444-4444-4444-444444444444', 'like', NOW() - INTERVAL '1 day'),
('c5555555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888888', 'a1111111-1111-1111-1111-111111111111', 'like', NOW() - INTERVAL '1 day'),
('c6666666-6666-6666-6666-666666666666', '88888888-8888-8888-8888-888888888888', 'a5555555-5555-5555-5555-555555555555', 'pass', NOW() - INTERVAL '1 day');

-- Matches
-- Match 1: Shira liked Tal's Florentin apt -> host accepted -> matched (has conversation)
INSERT INTO matches (id, seeker_id, property_id, host_id, status, seeker_liked_at, host_responded_at, matched_at, expires_at) VALUES
('d1111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'matched', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() + INTERVAL '48 hours');

-- Match 2: Shira liked Maya's Neve Tzedek apt -> still pending
INSERT INTO matches (id, seeker_id, property_id, host_id, status, seeker_liked_at, expires_at) VALUES
('d2222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'pending', NOW() - INTERVAL '2 days', NOW() + INTERVAL '46 hours');

-- Match 3: Yoni liked Dana's TAU apt -> still pending
INSERT INTO matches (id, seeker_id, property_id, host_id, status, seeker_liked_at, expires_at) VALUES
('d3333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', 'a4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'pending', NOW() - INTERVAL '1 day', NOW() + INTERVAL '47 hours');

-- Match 4: Noa liked Tal's Florentin apt -> host accepted -> matched (has conversation)
INSERT INTO matches (id, seeker_id, property_id, host_id, status, seeker_liked_at, host_responded_at, matched_at, expires_at) VALUES
('d4444444-4444-4444-4444-444444444444', '88888888-8888-8888-8888-888888888888', 'a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'matched', NOW() - INTERVAL '1 day', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours', NOW() + INTERVAL '48 hours');

-- Conversations (created automatically by trigger on match, but we insert manually for seed)
INSERT INTO conversations (id, match_id, last_message_text, last_message_at, last_message_by, seeker_unread_count, host_unread_count) VALUES
('e1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Sounds great! When can I come see the place?', NOW() - INTERVAL '1 hour', '66666666-6666-6666-6666-666666666666', 0, 1),
('e2222222-2222-2222-2222-222222222222', 'd4444444-4444-4444-4444-444444444444', 'Welcome! The room is available from next week.', NOW() - INTERVAL '6 hours', '11111111-1111-1111-1111-111111111111', 1, 0);

-- Messages for conversation 1 (Shira <-> Tal)
INSERT INTO messages (id, conversation_id, sender_id, content, message_type, is_read, created_at) VALUES
('f1111111-1111-1111-1111-000000000001', 'e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Hey Shira! Thanks for your interest in the Florentin room.', 'text', true, NOW() - INTERVAL '2 days'),
('f1111111-1111-1111-1111-000000000002', 'e1111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'Hi Tal! The place looks amazing. Is the balcony south-facing?', 'text', true, NOW() - INTERVAL '2 days' + INTERVAL '30 minutes'),
('f1111111-1111-1111-1111-000000000003', 'e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Yes it is! Gets great afternoon sun. Perfect for plants.', 'text', true, NOW() - INTERVAL '1 day'),
('f1111111-1111-1111-1111-000000000004', 'e1111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'Sounds great! When can I come see the place?', 'text', false, NOW() - INTERVAL '1 hour');

-- Messages for conversation 2 (Noa <-> Tal)
INSERT INTO messages (id, conversation_id, sender_id, content, message_type, is_read, created_at) VALUES
('f2222222-2222-2222-2222-000000000001', 'e2222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888888', 'Hi! I love the Florentin apartment. Is it pet-friendly?', 'text', true, NOW() - INTERVAL '10 hours'),
('f2222222-2222-2222-2222-000000000002', 'e2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Welcome! The room is available from next week.', 'text', false, NOW() - INTERVAL '6 hours');
