-- Idempotent demo login accounts for RBAC smoke testing.
-- These are demo credentials only; rotate or remove them before real production use.
insert into public.users (email, password_hash, role, is_active, employee_id, organization_id)
select seed.email, seed.password_hash, seed.role, true, e.id, o.id
from (values
  ('director.demo@hris.local', '$2b$12$GG4lAkXiFE0iZyxRE39obO7XrTS9ZFfGCm3t/BM2ijAvdhHaZsPba', 'hr_director', 'EMP-DEMO-001'),
  ('manager.demo@hris.local', '$2b$12$0cPGF9.NycmVNMiiiTQwQ.HPb3k69hwAEINKe714/YqBZJq3XFX.m', 'hr_manager', 'EMP-DEMO-002'),
  ('officer.demo@hris.local', '$2b$12$0D0jLjuqsv2aF0Qz3mjqDuDtaQYgIV4m0m1O5xs5W/L3glJ7d42U2', 'hr_officer', 'EMP-DEMO-005'),
  ('employee.demo@hris.local', '$2b$12$89PICI7qtc0DVZ451eokUe76E8NvdNEp8YiaO/5PbzwA1gC2Aa0LS', 'employee', 'EMP-DEMO-003')
) as seed(email, password_hash, role, employee_code)
join public.employees e on e.employee_id = seed.employee_code
join public.organizations o on o.slug = 'demo'
on conflict (email) do update set
  password_hash = excluded.password_hash,
  role = excluded.role,
  is_active = true,
  employee_id = excluded.employee_id,
  organization_id = excluded.organization_id,
  updated_at = now();

insert into public.organization_memberships (organization_id, user_id, role_id, status)
select u.organization_id, u.id, r.id, 'active'
from public.users u
join public.roles r on r.organization_id = u.organization_id and r.role_key = u.role
where u.email in ('director.demo@hris.local', 'manager.demo@hris.local', 'officer.demo@hris.local', 'employee.demo@hris.local')
on conflict (organization_id, user_id) do update set role_id = excluded.role_id, status = 'active', updated_at = now();
