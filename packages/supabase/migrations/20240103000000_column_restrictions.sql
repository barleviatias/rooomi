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

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sanitize_profile_update_trigger
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION sanitize_profile_update();

CREATE OR REPLACE FUNCTION sanitize_property_update()
RETURNS TRIGGER AS $$
BEGIN
    IF pg_trigger_depth() > 1 THEN
        RETURN NEW;
    END IF;

    NEW.is_featured := OLD.is_featured;
    NEW.view_count := OLD.view_count;
    NEW.like_count := OLD.like_count;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sanitize_property_update_trigger
    BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION sanitize_property_update();
