import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bruzgztsltjtzwkkehif.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJydXpnenRzbHRqdHp3a2tlaGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NTg0NzMsImV4cCI6MjA4NTMzNDQ3M30.bzHCtZpAyTI3QXCyvbVFn9Tb-Cp0iI2Qse9zJhHB_ow';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
