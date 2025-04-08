-- Enable RLS on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow uploads to the secure-files bucket
CREATE POLICY "Allow uploads to secure-files"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'secure-files'
  AND (storage.foldername(name))[1] IN (
    SELECT token FROM public.files
    WHERE created_at > NOW() - INTERVAL '1 hour' * ((config->>'expirationTime')::integer)
  )
);

-- Allow downloads from secure-files bucket
CREATE POLICY "Allow downloads from secure-files"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'secure-files'
  AND (storage.foldername(name))[1] IN (
    SELECT token FROM public.files
    WHERE created_at > NOW() - INTERVAL '1 hour' * ((config->>'expirationTime')::integer)
    AND download_count < (config->>'maxDownloads')::integer
  )
);

-- Allow deletion of expired files
CREATE POLICY "Allow deletion of expired files from secure-files"
ON storage.objects FOR DELETE
TO public
USING (
  bucket_id = 'secure-files'
  AND (storage.foldername(name))[1] IN (
    SELECT token FROM public.files
    WHERE created_at <= NOW() - INTERVAL '1 hour' * ((config->>'expirationTime')::integer)
    OR download_count >= (config->>'maxDownloads')::integer
  )
); 