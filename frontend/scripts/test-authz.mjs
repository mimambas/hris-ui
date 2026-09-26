import assert from 'node:assert/strict';
import { requirePermission, scopeOrganization } from '../src/lib/server/authorization.ts';

const admin = { id: '1', email: 'a@x', role: 'super_admin', is_active: true, employee_id: null, organization_id: 'org-a', permissions: [] };
const director = { ...admin, id: '2', role: 'hr_director', email: 'd@x' };
const officer = { ...admin, id: '3', role: 'hr_officer', email: 'o@x', permissions: ['attendance:read', 'leave:write'] };
const employee = { ...admin, id: '4', role: 'employee', email: 'e@x', permissions: ['employee:read'] };

// super_admin / hr_director bypass grants by design.
requirePermission(admin, 'anything:write');
requirePermission(director, 'anything:write');

// Grantees pass their own permission.
requirePermission(officer, 'attendance:read');
requirePermission(officer, 'leave:write');

// Deny is thrown for missing grants — this is the PRD 12.2 guarantee.
assert.throws(() => requirePermission(officer, 'payroll:write'), (e) => e.message === 'FORBIDDEN', 'officer must not get payroll');
assert.throws(() => requirePermission(employee, 'recruitment:read'), (e) => e.message === 'FORBIDDEN', 'employee must not read recruitment PII');
assert.throws(() => requirePermission(employee, 'audit:read'), (e) => e.message === 'FORBIDDEN', 'employee must not read audit');
assert.throws(() => requirePermission(employee, 'employee:write'), (e) => e.message === 'FORBIDDEN', 'employee must not write others');

// scopeOrganization pins every query to the caller's tenant.
const calls = [];
const builder = { eq: (column, value) => { calls.push([column, value]); return builder; } };
scopeOrganization(builder, admin);
assert.deepEqual(calls, [['organization_id', 'org-a']], 'query must be constrained to caller org');

console.log('All authorization helper tests passed.');

// Cross-tenant: two organizations must never see each other's rows.
const orgA = { ...admin, id: 'a', organization_id: 'org-a' };
const orgB = { ...admin, id: 'b', organization_id: 'org-b' };
const scoped = (user) => { const trace = []; scopeOrganization({ eq: (c, v) => { trace.push(`${c}=${v}`); return { eq: () => {} }; } }, user); return trace.join('&'); };
assert.equal(scoped(orgA), 'organization_id=org-a', 'org A pinned to own tenant');
assert.equal(scoped(orgB), 'organization_id=org-b', 'org B pinned to own tenant');
assert.notEqual(scoped(orgA), scoped(orgB), 'tenants must differ');

// Role separation matrix: an employee can never receive HR-only permissions.
const HR_ONLY = ['payroll:write', 'audit:read', 'recruitment:read', 'onboarding:write', 'offboarding:write', 'organization:write'];
for (const permission of HR_ONLY) {
  assert.throws(() => requirePermission(employee, permission), (e) => e.message === 'FORBIDDEN', `employee denied ${permission}`);
}
console.log('All tenant and permission matrix tests passed.');
