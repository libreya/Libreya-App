import type { NextApiRequest } from 'next';
import { createClient } from '@supabase/supabase-js';

/** Returns null if the request's bearer token belongs to an admin user, otherwise an error message. */
export async function requireAdmin(req: NextApiRequest): Promise<string | null> {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return 'Missing Authorization header';

  const supabaseServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user }, error: userError } = await supabaseServer.auth.getUser(token);
  if (userError || !user) return 'Invalid or expired session';

  const { data: profile, error: profileError } = await supabaseServer
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile?.is_admin) return 'Admin privileges required';

  return null;
}
