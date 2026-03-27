INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-photos',
  'property-photos',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view property photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-photos');

CREATE POLICY "Authenticated users can upload property photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'property-photos');

CREATE POLICY "Users can delete their own property photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'property-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM properties WHERE host_id = auth.uid()
    )
  );
