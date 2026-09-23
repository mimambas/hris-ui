import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { jwtVerify, type JWTPayload } from 'jose';

export type AuthUser = { id: string; email: string; role: string; is_active: boolean; employee_id: string | null; organization_id: string; permissions: string[] };

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
  const client = getSupabaseAdmin();
  const { data: user, error } = await client
    .from('users').select('id,email,role,is_active,employee_id,organization_id').eq('id', payload.sub).maybeSingle();
  if (error || !user?.is_active || !user.organization_id) throw new Error('UNAUTHORIZED');
  const { data: membership, error: membershipError } = await client.from('organization_memberships').select('role:roles(role_key), role_permissions(permission:permissions(permission_key))').eq('organization_id', user.organization_id).eq('user_id', user.id).eq('status', 'active').maybeSingle();
  if (membershipError || !membership) throw new Error('UNAUTHORIZED');
  const roleValue = Array.isArray(membership.role) ? membership.role[0]?.role_key : (membership.role as any)?.role_key;
  const permissions = (membership.role_permissions ?? []).map((item: any) => { const permission = Array.isArray(item.permission) ? item.permission[0] : item.permission; return permission?.permission_key; }).filter(Boolean);
  return { ...user, role: roleValue ?? user.role, permissions } as AuthUser;
}

export function requirePermission(user: AuthUser, permission: string) {
  if (!user.permissions.includes(permission) && !['super_admin', 'hr_director'].includes(user.role)) throw new Error('FORBIDDEN');
}

export function scopeOrganization<T extends { eq: (column: string, value: string) => T }>(query: T, user: AuthUser) {
  return query.eq('organization_id', user.organization_id);
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
