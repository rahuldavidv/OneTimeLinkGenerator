import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

console.log('Supabase initialization:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
  url: supabaseUrl ? supabaseUrl.substring(0, 10) + '...' : 'missing'
});

export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || '',
  {
    auth: {
      persistSession: false // Don't persist the session in localStorage
    }
  }
);

// Test the connection
(async () => {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', {
        error: error.message,
        code: error.code,
        details: error.details
      });
    } else {
      console.log('Supabase connection test successful');
    }
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
  }
})(); 