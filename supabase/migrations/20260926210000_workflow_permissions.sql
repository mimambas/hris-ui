insert into public.permissions(permission_key, description) values
 ('notifications:read','Read notifications'),('notifications:write','Create/manage notifications'),
 ('onboarding:read','Read onboarding workflows'),('onboarding:write','Manage onboarding workflows'),
 ('offboarding:read','Read offboarding workflows'),('offboarding:write','Manage offboarding workflows')
on conflict(permission_key) do nothing;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.permission_key in ('notifications:read','notifications:write','onboarding:read','onboarding:write','offboarding:read','offboarding:write') where r.organization_id=(select id from public.organizations where slug='demo') and r.role_key in ('super_admin','hr_director','hr_manager','hr_officer') on conflict do nothing;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.permission_key in ('notifications:read','onboarding:read') where r.organization_id=(select id from public.organizations where slug='demo') and r.role_key='employee' on conflict do nothing;
