create table if not exists public.document_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  requested_by uuid not null references public.users(id),
  document_types text[] not null default '{}',
  due_date date,
  status varchar(20) not null default 'pending' check (status in ('pending','submitted','cancelled','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists document_requests_org_idx on public.document_requests(organization_id, created_at desc);
create index if not exists document_requests_employee_idx on public.document_requests(organization_id, employee_id);
