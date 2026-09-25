create table if not exists public.organization_settings (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  updated_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
insert into public.organization_settings (organization_id, settings)
select id, '{}'::jsonb from public.organizations
on conflict (organization_id) do nothing;
