import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { jwtVerify, type JWTPayload } from 'jose';

export type AuthUser = { id: string; email: string; role: string; is_active: boolean; employee_id: string | null };

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server environment is not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function requireUser(request: Request): Promise<AuthUser> {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const secret = process.env.JWT_SECRET_KEY;
  if (!token || !secret) throw new Error('UNAUTHORIZED');
  let payload: JWTPayload;
  try {
    ({ payload } = await jwtVerify(token, new TextEncoder().encode(secret)));
  } catch {
    throw new Error('UNAUTHORIZED');
  }
  if (payload.type !== 'access' || typeof payload.sub !== 'string') throw new Error('UNAUTHORIZED');
  const { data: user, error } = await getSupabaseAdmin()
    .from('users').select('id,email,role,is_active,employee_id').eq('id', payload.sub).maybeSingle();
  if (error || !user?.is_active) throw new Error('UNAUTHORIZED');
  return user as AuthUser;
}

export function requireAdmin(user: AuthUser) {
  if (!['super_admin', 'hr_director', 'hr_manager', 'hr_officer'].includes(user.role)) throw new Error('FORBIDDEN');
}

export function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  if (message === 'UNAUTHORIZED') return Response.json({ detail: 'Not authenticated' }, { status: 401 });
  if (message === 'FORBIDDEN') return Response.json({ detail: 'Insufficient permissions' }, { status: 403 });
  console.error('API error:', error);
  return Response.json({ detail: 'Internal server error' }, { status: 500 });
}
