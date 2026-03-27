CREATE UNIQUE INDEX IF NOT EXISTS idx_interactions_actor_property
  ON interactions (actor_id, property_id);
