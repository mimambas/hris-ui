create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  name varchar(255) not null,
  document_type varchar(80) not null,
  original_filename varchar(255) not null,
  storage_path varchar(500),
  mime_type varchar(100),
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  expiry_date date,
  status varchar(20) not null default 'valid' check (status in ('valid', 'expiring', 'expired')),
  uploaded_by uuid references public.users(id),
  reminder_sent_at timestamptz,
  renewal_requested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists documents_employee_idx on public.documents(employee_id);
create index if not exists documents_status_idx on public.documents(status);

create table if not exists public.onboarding_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) on delete set null,
  name varchar(200) not null,
  role varchar(200) not null,
  department varchar(200) not null,
  start_date date not null,
  buddy varchar(200) not null default 'Not assigned',
  status varchar(20) not null default 'On track' check (status in ('On track', 'Completed', 'At risk')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists onboarding_records_status_idx on public.onboarding_records(status);

create table if not exists public.onboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  onboarding_id uuid not null references public.onboarding_records(id) on delete cascade,
  task_key varchar(50) not null,
  label varchar(255) not null,
  owner varchar(100) not null,
  due_date date not null,
  done boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(onboarding_id, task_key)
);
create index if not exists onboarding_tasks_record_idx on public.onboarding_tasks(onboarding_id);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title varchar(255) not null,
  description text not null,
  category varchar(30) not null,
  icon varchar(30) not null default 'bell',
  group_key varchar(20) not null default 'today',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
create index if not exists notifications_user_unread_idx on public.notifications(user_id) where read_at is null;

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

insert into public.onboarding_records (id, name, role, department, start_date, buddy, status)
values
 ('00000000-0000-0000-0000-000000000101', 'Dimas Saputra', 'Senior Backend Developer', 'Engineering', '2026-09-18', 'Rizky Prasetyo', 'On track'),
 ('00000000-0000-0000-0000-000000000102', 'Nadia Putri', 'Product Designer', 'Design', '2026-09-15', 'Maya Anggraeni', 'On track'),
 ('00000000-0000-0000-0000-000000000103', 'Kevin Wijaya', 'Finance Analyst', 'Finance', '2026-09-01', 'Andi Pratama', 'Completed')
on conflict (id) do nothing;

insert into public.onboarding_tasks (onboarding_id, task_key, label, owner, due_date, done)
select r.id, t.task_key, t.label, t.owner, t.due_date, t.done
from (values
 ('00000000-0000-0000-0000-000000000101'::uuid, 'welcome', 'Send welcome email', 'HR', '2026-09-18'::date, true),
 ('00000000-0000-0000-0000-000000000101'::uuid, 'documents', 'Collect employment documents', 'HR', '2026-09-19'::date, true),
 ('00000000-0000-0000-0000-000000000101'::uuid, 'account', 'Create email & system accounts', 'IT', '2026-09-20'::date, false),
 ('00000000-0000-0000-0000-000000000102'::uuid, 'welcome', 'Send welcome email', 'HR', '2026-09-15'::date, true),
 ('00000000-0000-0000-0000-000000000102'::uuid, 'documents', 'Collect employment documents', 'HR', '2026-09-16'::date, false),
 ('00000000-0000-0000-0000-000000000103'::uuid, 'welcome', 'Send welcome email', 'HR', '2026-09-01'::date, true),
 ('00000000-0000-0000-0000-000000000103'::uuid, 'documents', 'Collect employment documents', 'HR', '2026-09-02'::date, true)
) as t(onboarding_id, task_key, label, owner, due_date, done)
join public.onboarding_records r on r.id = t.onboarding_id
on conflict (onboarding_id, task_key) do nothing;

insert into public.notifications (user_id, title, description, category, icon, group_key, created_at)
select u.id, n.title, n.description, n.category, n.icon, n.group_key, n.created_at
from public.users u
cross join (values
 ('Leave request submitted', 'Budi Hartono applied for 3 days of annual leave (22-24 Sep)', 'leave', 'file-text', 'today', now() - interval '5 minutes'),
 ('Payroll approved', 'September 2026 payroll has been processed for 478 employees', 'payroll', 'check-circle', 'today', now() - interval '1 hour'),
 ('Contract expiring soon', 'Andi Pratama''s employment contract expires on 20 Sep 2026', 'alert', 'alert-triangle', 'today', now() - interval '3 hours'),
 ('New employee onboarding', 'Nadia Putri started onboarding for Product Designer role', 'onboarding', 'users', 'yesterday', now() - interval '1 day'),
 ('Document uploaded', 'BPJS Certificate for Dewi Lestari has been uploaded', 'document', 'file-text', 'older', now() - interval '2 days')
) as n(title, description, category, icon, group_key, created_at)
where u.email = 'admin@hris.local'
  and not exists (select 1 from public.notifications existing where existing.user_id = u.id and existing.title = n.title);
