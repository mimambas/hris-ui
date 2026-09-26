insert into public.permissions (permission_key, description)
values ('recruitment:read','View recruitment candidates and vacancies'), ('recruitment:write','Manage recruitment candidates and vacancies')
on conflict (permission_key) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.permission_key in ('recruitment:read','recruitment:write')
where r.organization_id = (select id from public.organizations where slug='demo')
  and r.role_key in ('super_admin','hr_director','hr_manager','hr_officer')
on conflict do nothing;
