-- Create test HOST auth user + seed data matched with Bar (xxbaryxx@gmail.com)
-- Run in Supabase Dashboard SQL Editor

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Clean up existing data if re-running (order matters for FK constraints)
DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE match_id IN (SELECT id FROM matches WHERE host_id = '11111111-1111-1111-1111-111111111111'));
DELETE FROM conversations WHERE match_id IN (SELECT id FROM matches WHERE host_id = '11111111-1111-1111-1111-111111111111');
DELETE FROM matches WHERE host_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM interactions WHERE property_id IN (SELECT id FROM properties WHERE host_id = '11111111-1111-1111-1111-111111111111');
DELETE FROM property_photos WHERE property_id IN (SELECT id FROM properties WHERE host_id = '11111111-1111-1111-1111-111111111111');
DELETE FROM properties WHERE host_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM profile_lifestyle WHERE profile_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM auth.identities WHERE user_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM auth.users WHERE id = '11111111-1111-1111-1111-111111111111';
DELETE FROM profiles WHERE id = '11111111-1111-1111-1111-111111111111';

-- HOST: Tal Cohen (tal@test.com / Test1234!)
-- Copy instance_id from Bar's existing auth user
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, confirmation_token, email_change, email_change_token_new,
  recovery_token
) SELECT
  '11111111-1111-1111-1111-111111111111',
  instance_id,
  aud,
  'authenticated',
  'tal@test.com',
  crypt('Test1234!', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Tal Cohen"}'::jsonb,
  false, '', '', '',
  ''
FROM auth.users
WHERE id = 'b15d3a7f-4f29-49f3-a4c9-f2e407f6efc3'
LIMIT 1;

INSERT INTO auth.identities (
  id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  'tal@test.com',
  'email',
  jsonb_build_object('sub', '11111111-1111-1111-1111-111111111111', 'email', 'tal@test.com', 'email_verified', true),
  NOW(), NOW(), NOW()
);

UPDATE profiles SET
  display_name = 'Tal',
  gender = 'male',
  avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  bio = 'Tech worker who loves cooking and hosting friends.',
  is_seeker = false,
  is_host = true,
  instagram_handle = 'tal.cohen',
  preferred_language = 'he',
  preferred_city = 'Tel Aviv',
  is_verified = true,
  profile_completion_pct = 85
WHERE id = '11111111-1111-1111-1111-111111111111';

INSERT INTO profile_lifestyle (profile_id, is_smoker, has_pet, keeps_kosher, is_student, hosting_level, sleeping_level, cleanliness_level, noise_level, occupation, work_schedule, interests)
VALUES ('11111111-1111-1111-1111-111111111111', false, false, false, false, 4, 3, 4, 3, 'Software Engineer', 'hybrid', ARRAY['cooking', 'tech', 'hiking'])
ON CONFLICT (profile_id) DO UPDATE SET
  occupation = EXCLUDED.occupation, work_schedule = EXCLUDED.work_schedule, interests = EXCLUDED.interests;

-- Other host profiles (for extra properties in feed)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

INSERT INTO profiles (id, email, full_name, display_name, gender, avatar_url, bio, is_seeker, is_host, preferred_city, is_verified, profile_completion_pct) VALUES
('22222222-2222-2222-2222-222222222222', 'maya@example.com', 'Maya Levi', 'Maya', 'female', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', 'Artist and yoga instructor.', false, true, 'Tel Aviv', true, 90),
('33333333-3333-3333-3333-333333333333', 'noam@example.com', 'Noam Shapira', 'Noam', 'male', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', 'Software developer working remotely.', false, true, 'Tel Aviv', false, 70),
('44444444-4444-4444-4444-444444444444', 'dana@example.com', 'Dana Peretz', 'Dana', 'female', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop', 'Medical student at TAU.', false, true, 'Tel Aviv', true, 95),
('55555555-5555-5555-5555-555555555555', 'omer@example.com', 'Omer Avni', 'Omer', 'male', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', 'Music producer with a home studio.', false, true, 'Tel Aviv', false, 80)
ON CONFLICT (id) DO NOTHING;

-- Properties (6 total, Tal owns 2)
INSERT INTO properties (id, host_id, title, description, price_monthly, price_bills_included, deposit_months, address_street, address_city, address_neighborhood, location_lat, location_lng, property_type, total_rooms, available_rooms, bathrooms, size_sqm, floor_number, total_floors, available_from, minimum_lease_months, has_balcony, has_elevator, has_parking, has_safe_room, has_furnished, has_pets_allowed, has_ac, current_roommates_count, status, is_featured, published_at) VALUES
('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Sunny Room in Florentin', 'Bright, spacious room in a renovated Florentin apartment.', 4200, false, 1, 'Florentin St 45', 'Tel Aviv', 'Florentin', 32.0544, 34.7654, 'apartment', 3, 1, 1, 75, 3, 5, '2025-02-01', 12, true, false, false, false, true, true, true, 1, 'active', true, NOW()),
('a6666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'Cozy Studio in Kerem', 'Charming studio near Carmel Market.', 5200, true, 1, 'Kerem HaTeimanim St 12', 'Tel Aviv', 'Kerem HaTeimanim', 32.0634, 34.7678, 'studio', 1, 1, 1, 35, 1, 3, '2025-03-01', 6, false, false, false, false, true, false, true, 0, 'active', false, NOW()),
('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Artist Loft in Neve Tzedek', 'Unique artistic space in the heart of Neve Tzedek.', 5500, true, 2, 'Shabazi St 23', 'Tel Aviv', 'Neve Tzedek', 32.0589, 34.7634, 'apartment', 2, 1, 1, 65, 2, 3, '2025-02-15', 12, true, false, false, true, true, true, true, 1, 'active', true, NOW()),
('a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Modern Room in Lev Hair', 'Clean, modern room in central Tel Aviv.', 4800, false, 1.5, 'Dizengoff St 156', 'Tel Aviv', 'Lev Hair', 32.0756, 34.7745, 'apartment', 3, 1, 2, 90, 8, 12, '2025-03-01', 12, true, true, true, true, true, false, true, 1, 'active', false, NOW()),
('a4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Quiet Room near TAU', 'Perfect for students! Close to Tel Aviv University.', 3200, false, 1, 'Einstein St 34', 'Tel Aviv', 'Ramat Aviv', 32.1133, 34.8044, 'apartment', 4, 1, 2, 100, 2, 4, '2025-02-01', 12, false, true, true, true, false, false, true, 2, 'active', false, NOW()),
('a5555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'Creative Space in Old Jaffa', 'Unique room with music studio and rooftop access.', 4500, true, 2, 'Yefet St 89', 'Tel Aviv-Yafo', 'Old Jaffa', 32.0515, 34.7512, 'apartment', 2, 1, 1, 70, 4, 4, '2025-02-20', 6, true, false, false, false, true, true, true, 1, 'active', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Property photos
INSERT INTO property_photos (id, property_id, photo_url, display_order, is_primary, room_type) VALUES
('b1111111-1111-1111-1111-000000000001', 'a1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 0, true, 'living_room'),
('b1111111-1111-1111-1111-000000000002', 'a1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 1, false, 'bedroom'),
('b1111111-1111-1111-1111-000000000003', 'a1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', 2, false, 'kitchen'),
('b2222222-2222-2222-2222-000000000001', 'a2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 0, true, 'living_room'),
('b2222222-2222-2222-2222-000000000002', 'a2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800', 1, false, 'bedroom'),
('b3333333-3333-3333-3333-000000000001', 'a3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800', 0, true, 'living_room'),
('b3333333-3333-3333-3333-000000000002', 'a3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=800', 1, false, 'bedroom'),
('b4444444-4444-4444-4444-000000000001', 'a4444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800', 0, true, 'living_room'),
('b4444444-4444-4444-4444-000000000002', 'a4444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800', 1, false, 'bedroom'),
('b5555555-5555-5555-5555-000000000001', 'a5555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 0, true, 'living_room'),
('b5555555-5555-5555-5555-000000000002', 'a5555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1600566752229-250ed79470f8?w=800', 1, false, 'bedroom'),
('b6666666-6666-6666-6666-000000000001', 'a6666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800', 0, true, 'studio'),
('b6666666-6666-6666-6666-000000000002', 'a6666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800', 1, false, 'kitchenette')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- MATCH + CONVERSATION between Bar and Tal
-- Bar's ID: b15d3a7f-4f29-49f3-a4c9-f2e407f6efc3
-- Tal's ID: 11111111-1111-1111-1111-111111111111
-- Property: Sunny Room in Florentin (a1111111...)
-- ============================================================

-- Bar liked Tal's Florentin property
INSERT INTO interactions (id, actor_id, property_id, action, created_at) VALUES
('c0000000-0000-0000-0000-000000000001', 'b15d3a7f-4f29-49f3-a4c9-f2e407f6efc3', 'a1111111-1111-1111-1111-111111111111', 'like', NOW() - INTERVAL '3 days')
ON CONFLICT (actor_id, property_id) DO NOTHING;

-- Match: Bar <-> Tal's Florentin — status: matched
INSERT INTO matches (id, seeker_id, property_id, host_id, status, seeker_liked_at, host_responded_at, matched_at, expires_at) VALUES
('d0000000-0000-0000-0000-000000000001', 'b15d3a7f-4f29-49f3-a4c9-f2e407f6efc3', 'a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'matched', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() + INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- Conversation
INSERT INTO conversations (id, match_id, last_message_text, last_message_at, last_message_by, seeker_unread_count, host_unread_count) VALUES
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'When can I come see the room?', NOW() - INTERVAL '30 minutes', 'b15d3a7f-4f29-49f3-a4c9-f2e407f6efc3', 0, 1)
ON CONFLICT (id) DO NOTHING;

-- Messages (Bar <-> Tal)
INSERT INTO messages (id, conversation_id, sender_id, content, message_type, is_read, created_at) VALUES
('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Hey Bar! Welcome to Roomi. Thanks for liking the Florentin room!', 'text', true, NOW() - INTERVAL '2 days'),
('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'b15d3a7f-4f29-49f3-a4c9-f2e407f6efc3', 'Hi Tal! The apartment looks great. Is the room still available?', 'text', true, NOW() - INTERVAL '2 days' + INTERVAL '1 hour'),
('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Yes! Available from February. It is fully furnished with AC and a nice balcony.', 'text', true, NOW() - INTERVAL '1 day'),
('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001', 'b15d3a7f-4f29-49f3-a4c9-f2e407f6efc3', 'Perfect. What are the roommates like?', 'text', true, NOW() - INTERVAL '1 day' + INTERVAL '2 hours'),
('f0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Just me so far. I work in tech, pretty chill. I like cooking and hosting friends occasionally.', 'text', true, NOW() - INTERVAL '12 hours'),
('f0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000001', 'b15d3a7f-4f29-49f3-a4c9-f2e407f6efc3', 'When can I come see the room?', 'text', false, NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;
