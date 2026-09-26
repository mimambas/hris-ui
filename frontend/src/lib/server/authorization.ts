/**
 * Pure authorization decisions, isolated from DB/network imports so they can be
 * unit-tested directly under `node --experimental-strip-types`.
 */
export type AuthUser = { id: string; email: string; role: string; is_active: boolean; employee_id: string | null; organization_id: string; permissions: string[] };

export function requirePermission(user: AuthUser, permission: string) {
  if (!user.permissions.includes(permission) && !['super_admin', 'hr_director'].includes(user.role)) throw new Error('FORBIDDEN');
}

export function requireAdmin(user: AuthUser) {
  if (!['super_admin', 'hr_director', 'hr_manager', 'hr_officer'].includes(user.role)) throw new Error('FORBIDDEN');
}

/** Pins every Supabase query to the caller's organization (tenant isolation). */
export function scopeOrganization<T extends { eq: (column: string, value: string) => T }>(query: T, user: AuthUser) {
  return query.eq('organization_id', user.organization_id);
}
