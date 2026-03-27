DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Profile lifestyle viewable by everyone" ON profile_lifestyle;
DROP POLICY IF EXISTS "Profile photos viewable by everyone" ON profile_photos;

CREATE POLICY "Authenticated users can view profiles" ON profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view profile lifestyle" ON profile_lifestyle
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view profile photos" ON profile_photos
    FOR SELECT TO authenticated USING (true);
