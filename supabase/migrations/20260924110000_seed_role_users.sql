-- Idempotent demo login accounts for RBAC smoke testing.
-- Demo-only credentials; rotate or remove these accounts before production use.

insert into public.users (email, password_hash, role, is_active, employee_id, organization_id)
select seed.email, seed.password_hash, seed.role, true, e.id, o.id
from (values
  -- Passwords: Director123!, Manager123!, Officer123!, Employee123!
  ('director.demo@hris.local', '$2b$12$E999xIJA9ApkDphHppcvF.GMYKoSJzRXSSFw.9IoVkY5m.kgbGkLG', 'hr_director', 'EMP-DEMO-004'),
  ('manager.demo@hris.local', '$2b$12$xYKHLFo/XY9v7d9JbHExlufEYDd8OaG40uxxHvyKwBJn9lM5kIVc6', 'hr_manager', 'EMP-DEMO-002'),
  ('officer.demo@hris.local', '$2b$12$V.ft1b2Bf0NL/9ltPWA0MOZfpYgCsXofYgteA4g/VmQ1ljPrBXdcS', 'hr_officer', 'EMP-DEMO-005'),
  ('employee.demo@hris.local', '$2b$12$1NEOddxDMHP0JzXpYwWBhuwkU6WhRyeMix2RoDaOTqUTxF7ONyUuq', 'employee', 'EMP-DEMO-003')
) as seed(email, password_hash, role, employee_code)
join public.employees e on e.employee_id = seed.employee_code
join public.organizations o on o.slug = 'demo'
on conflict (email) do nothing;

-- Give management roles the permissions needed by the protected smoke-test APIs.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.permission_key in (
  'organization:read', 'employee:read', 'employee:write', 'attendance:read',
  'attendance:write', 'leave:read', 'leave:write', 'payroll:read',
  'payroll:write', 'documents:read', 'documents:write', 'audit:read'
)
where r.organization_id = (select id from public.organizations where slug = 'demo')
  and r.role_key = 'hr_manager'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.permission_key in (
  'organization:read', 'employee:read', 'attendance:read', 'attendance:write',
  'leave:read', 'leave:write', 'documents:read', 'documents:write'
)
where r.organization_id = (select id from public.organizations where slug = 'demo')
  and r.role_key = 'hr_officer'
on conflict do nothing;

insert into public.organization_memberships (organization_id, user_id, role_id, status)
select u.organization_id, u.id, r.id, 'active'
from public.users u
join public.roles r on r.organization_id = u.organization_id and r.role_key = u.role
where u.email in (
  'director.demo@hris.local', 'manager.demo@hris.local',
  'officer.demo@hris.local', 'employee.demo@hris.local'
)
on conflict (organization_id, user_id) do update
set role_id = excluded.role_id, status = 'active', updated_at = now();
