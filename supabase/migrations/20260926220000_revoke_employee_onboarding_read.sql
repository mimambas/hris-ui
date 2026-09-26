-- Employees must not read organization-wide onboarding records (PRD 12.2):
-- they may only see their own data. Notifications read stays.
delete from public.role_permissions rp
using public.roles r, public.permissions p
where rp.role_id = r.id
  and rp.permission_id = p.id
  and r.organization_id = (select id from public.organizations where slug = 'demo')
  and r.role_key = 'employee'
  and p.permission_key = 'onboarding:read';
