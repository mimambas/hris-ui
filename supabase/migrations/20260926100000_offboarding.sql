create table if not exists public.offboarding_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id),
  reason varchar(100) not null,
  last_working_date date not null,
  status varchar(20) not null default 'active' check (status in ('active','completed','cancelled')),
  notes text,
  created_by uuid not null references public.users(id),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.offboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  offboarding_id uuid not null references public.offboarding_records(id) on delete cascade,
  task_key varchar(50) not null,
  title varchar(255) not null,
  owner varchar(100) not null,
  done boolean not null default false,
  completed_at timestamptz,
  unique(offboarding_id, task_key)
);
create index if not exists offboarding_org_idx on public.offboarding_records(organization_id, created_at desc);
create index if not exists offboarding_tasks_idx on public.offboarding_tasks(organization_id, offboarding_id);
