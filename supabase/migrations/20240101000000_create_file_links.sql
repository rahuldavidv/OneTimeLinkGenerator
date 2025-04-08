-- Create file_links table
CREATE TABLE IF NOT EXISTS files (
  token TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  config JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  download_count INTEGER NOT NULL DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_files_token ON files(token);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);

-- Enable Row Level Security
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert files
CREATE POLICY "Allow anyone to insert files"
ON files FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone to read files
CREATE POLICY "Allow anyone to read files"
ON files FOR SELECT
TO public
USING (true);

-- Allow anyone to update download count
CREATE POLICY "Allow anyone to update download count"
ON files FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Allow deletion of expired files
CREATE POLICY "Allow anyone to delete expired files"
ON files FOR DELETE
TO public
USING (
  created_at <= NOW() - INTERVAL '1 hour' * ((config->>'expirationTime')::integer)
  OR download_count >= (config->>'maxDownloads')::integer
); 