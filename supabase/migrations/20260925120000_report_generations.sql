create table if not exists public.report_generations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name varchar(255) not null,
  report_type varchar(50) not null,
  format varchar(20) not null default 'csv',
  range varchar(50),
  row_count integer not null default 0,
  generated_by uuid references public.users(id),
  generated_at timestamptz not null default now()
);
create index if not exists report_generations_org_idx on public.report_generations(organization_id, generated_at desc);
