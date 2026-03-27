ALTER TABLE open_houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_house_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;

-- open_houses: host manages, invitees can view
CREATE POLICY "Hosts can manage own open houses" ON open_houses
    FOR ALL USING (auth.uid() = host_id);

CREATE POLICY "Invitees can view open houses" ON open_houses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM open_house_invites ohi
            WHERE ohi.open_house_id = open_houses.id
            AND ohi.invitee_id = auth.uid()
        )
    );

-- open_house_invites: hosts can view/insert/delete, invitees can view/update RSVP
CREATE POLICY "Invitees can view own invites" ON open_house_invites
    FOR SELECT USING (auth.uid() = invitee_id);

CREATE POLICY "Hosts can view invites for own open houses" ON open_house_invites
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM open_houses oh
            WHERE oh.id = open_house_invites.open_house_id
            AND oh.host_id = auth.uid()
        )
    );

CREATE POLICY "Hosts can create invites for own open houses" ON open_house_invites
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM open_houses oh
            WHERE oh.id = open_house_id
            AND oh.host_id = auth.uid()
        )
    );

CREATE POLICY "Invitees can update own RSVP" ON open_house_invites
    FOR UPDATE USING (auth.uid() = invitee_id);

CREATE POLICY "Hosts can delete invites for own open houses" ON open_house_invites
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM open_houses oh
            WHERE oh.id = open_house_invites.open_house_id
            AND oh.host_id = auth.uid()
        )
    );

-- reports: users can create and view own reports only
CREATE POLICY "Users can view own reports" ON reports
    FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- blocks: users manage own blocks
CREATE POLICY "Users can view own blocks" ON blocks
    FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "Users can create blocks" ON blocks
    FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete own blocks" ON blocks
    FOR DELETE USING (auth.uid() = blocker_id);

-- property_views: anyone can insert, hosts can view their property's views
CREATE POLICY "Anyone can insert property views" ON property_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Hosts can view own property views" ON property_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = property_views.property_id
            AND p.host_id = auth.uid()
        )
    );
