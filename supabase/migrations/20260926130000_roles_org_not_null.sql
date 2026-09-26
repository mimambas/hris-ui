-- requireUser() resolves the active role by joining organization_memberships
-- to roles. A role with a NULL organization_id would silently drop out of that
-- join and revoke access, so organization_id must be mandatory.
update public.roles set organization_id = (select id from public.organizations where slug = 'demo') where organization_id is null;
alter table public.roles alter column organization_id set not null;
create index if not exists roles_org_idx on public.roles(organization_id);
