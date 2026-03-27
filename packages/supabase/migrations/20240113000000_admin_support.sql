ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS ban_reason TEXT,
    ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMPTZ;

CREATE TABLE admin_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_table TEXT NOT NULL,
    target_id UUID,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
    ON admin_audit_log FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "Admins can view all reports"
    ON reports FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "Admins can update reports"
    ON reports FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

CREATE OR REPLACE FUNCTION sanitize_profile_update()
RETURNS TRIGGER AS $$
BEGIN
    IF pg_trigger_depth() > 1 THEN
        RETURN NEW;
    END IF;

    NEW.is_verified := OLD.is_verified;
    NEW.is_phone_verified := OLD.is_phone_verified;
    NEW.is_email_verified := OLD.is_email_verified;
    NEW.profile_completion_pct := OLD.profile_completion_pct;
    NEW.is_admin := OLD.is_admin;
    NEW.banned_at := OLD.banned_at;
    NEW.ban_reason := OLD.ban_reason;
    NEW.suspended_until := OLD.suspended_until;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM profiles WHERE id = user_id AND is_admin = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_update_profile(
    target_user_id UUID,
    admin_id UUID,
    updates JSONB
)
RETURNS VOID AS $$
BEGIN
    IF NOT is_admin(admin_id) THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    UPDATE profiles SET
        is_verified = COALESCE((updates->>'is_verified')::BOOLEAN, is_verified),
        banned_at = CASE
            WHEN updates ? 'banned_at' THEN (updates->>'banned_at')::TIMESTAMPTZ
            ELSE banned_at
        END,
        ban_reason = CASE
            WHEN updates ? 'ban_reason' THEN updates->>'ban_reason'
            ELSE ban_reason
        END,
        suspended_until = CASE
            WHEN updates ? 'suspended_until' THEN (updates->>'suspended_until')::TIMESTAMPTZ
            ELSE suspended_until
        END,
        updated_at = NOW()
    WHERE id = target_user_id;

    INSERT INTO admin_audit_log (admin_id, action, target_table, target_id, details)
    VALUES (admin_id, 'update_profile', 'profiles', target_user_id, updates);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_update_property(
    target_property_id UUID,
    admin_id UUID,
    updates JSONB
)
RETURNS VOID AS $$
BEGIN
    IF NOT is_admin(admin_id) THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    UPDATE properties SET
        is_featured = COALESCE((updates->>'is_featured')::BOOLEAN, is_featured),
        status = COALESCE((updates->>'status')::property_status, status),
        updated_at = NOW()
    WHERE id = target_property_id;

    INSERT INTO admin_audit_log (admin_id, action, target_table, target_id, details)
    VALUES (admin_id, 'update_property', 'properties', target_property_id, updates);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_resolve_report(
    target_report_id UUID,
    admin_id UUID,
    new_status TEXT,
    notes TEXT
)
RETURNS VOID AS $$
BEGIN
    IF NOT is_admin(admin_id) THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    UPDATE reports SET
        status = new_status,
        resolution_notes = notes,
        reviewed_at = NOW(),
        reviewed_by = admin_id
    WHERE id = target_report_id;

    INSERT INTO admin_audit_log (admin_id, action, target_table, target_id, details)
    VALUES (admin_id, 'resolve_report', 'reports', target_report_id,
        jsonb_build_object('status', new_status, 'notes', notes));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
