import { createClient } from '@supabase/supabase-js';
import { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.query.token as string;
  const fileName = req.query.fileName as string;

  if (!token || !fileName) {
    return res.status(400).json({ error: 'Missing token or fileName' });
  }

  try {
    // Get the file metadata
    const { data: fileData, error: dbError } = await supabase
      .from('files')
      .select('*')
      .eq('token', token)
      .single();

    if (dbError || !fileData) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Get the download URL
    const { data, error } = await supabase.storage
      .from('secure-files')
      .createSignedUrl(`${token}/${fileName}`, 3600);

    if (error || !data?.signedUrl) {
      return res.status(500).json({ error: 'Failed to generate download URL' });
    }

    // Increment download count
    await supabase
      .from('files')
      .update({ download_count: fileData.download_count + 1 })
      .eq('token', token);

    // Redirect to the download URL
    res.redirect(data.signedUrl);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 