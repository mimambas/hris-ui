create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug varchar(100) not null unique,
  name varchar(200) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  permission_key varchar(100) not null unique,
  description varchar(255),
  created_at timestamptz not null default now()
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  role_key varchar(50) not null,
  name varchar(100) not null,
  is_system boolean not null default true,
  created_at timestamptz not null default now(),
  unique(organization_id, role_key)
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  status varchar(20) not null default 'active' check (status in ('active', 'suspended', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id, user_id)
);

insert into public.organizations (slug, name)
values ('demo', 'Demo Organization')
on conflict (slug) do update set name = excluded.name, updated_at = now();

alter table public.users add column if not exists organization_id uuid;
alter table public.departments add column if not exists organization_id uuid;
alter table public.positions add column if not exists organization_id uuid;
alter table public.employees add column if not exists organization_id uuid;
alter table public.attendance_records add column if not exists organization_id uuid;
alter table public.leave_requests add column if not exists organization_id uuid;
alter table public.leave_balances add column if not exists organization_id uuid;
alter table public.audit_logs add column if not exists organization_id uuid;
alter table public.payroll_periods add column if not exists organization_id uuid;
alter table public.payroll_entries add column if not exists organization_id uuid;
alter table public.expense_claims add column if not exists organization_id uuid;
alter table public.documents add column if not exists organization_id uuid;
alter table public.onboarding_records add column if not exists organization_id uuid;
alter table public.onboarding_tasks add column if not exists organization_id uuid;
alter table public.notifications add column if not exists organization_id uuid;
alter table public.recruitment_vacancies add column if not exists organization_id uuid;
alter table public.recruitment_candidates add column if not exists organization_id uuid;

update public.users set organization_id = (select id from public.organizations where slug = 'demo') where organization_id is null;
update public.departments set organization_id = (select id from public.organizations where slug = 'demo') where organization_id is null;
update public.positions set organization_id = (select id from public.organizations where slug = 'demo') where organization_id is null;
update public.employees set organization_id = (select id from public.organizations where slug = 'demo') where organization_id is null;
update public.attendance_records set organization_id = (select id from public.organizations where slug = 'demo') where organization_id is null;
update public.leave_requests set organization_id = (select id from public.organizations where slug = 'demo') where organization_id is null;
update public.leave_balances set organization_id = (select id from public.organizations where slug = 'demo') where organization_id is null;
update public.audit_logs set organization_id = (select id from public.organizations where slug = 'demo') where organization_id is null;
update public.payroll_periods set organization_id = (select id from public.organizations where slug = 'demo') where organization_id is null;
update public.payroll_entries set organization_id = (select id from public.organizations where slug = 'demo') where organization_id is null;
update public.expense_claims set organization_id = (select id from public.organizations where slug = 'demo') where organization_id is null;
update public.documents set organization_id = (select id from public.organizations where slug = 'demo') where organization_id is null;
update public.onboarding_records set organization_id = (select id from public.organizations where slug = 'demo') where organization_id is null;
update public.onboarding_tasks set organization_id = (select id from public.organizations where slug = 'demo') where organization_id is null;
update public.notifications set organization_id = (select id from public.organizations where slug = 'demo') where organization_id is null;
update public.recruitment_vacancies set organization_id = (select id from public.organizations where slug = 'demo') where organization_id is null;
update public.recruitment_candidates set organization_id = (select id from public.organizations where slug = 'demo') where organization_id is null;

alter table public.users alter column organization_id set not null;
alter table public.departments alter column organization_id set not null;
alter table public.positions alter column organization_id set not null;
alter table public.employees alter column organization_id set not null;
alter table public.attendance_records alter column organization_id set not null;
alter table public.leave_requests alter column organization_id set not null;
alter table public.leave_balances alter column organization_id set not null;
alter table public.audit_logs alter column organization_id set not null;
alter table public.payroll_periods alter column organization_id set not null;
alter table public.payroll_entries alter column organization_id set not null;
alter table public.expense_claims alter column organization_id set not null;
alter table public.documents alter column organization_id set not null;
alter table public.onboarding_records alter column organization_id set not null;
alter table public.onboarding_tasks alter column organization_id set not null;
alter table public.notifications alter column organization_id set not null;
alter table public.recruitment_vacancies alter column organization_id set not null;
alter table public.recruitment_candidates alter column organization_id set not null;

DO $$ BEGIN
  IF NOT EXISTS (select 1 from pg_constraint where conname = 'users_organization_fk') THEN alter table public.users add constraint users_organization_fk foreign key (organization_id) references public.organizations(id); END IF;
  IF NOT EXISTS (select 1 from pg_constraint where conname = 'departments_organization_fk') THEN alter table public.departments add constraint departments_organization_fk foreign key (organization_id) references public.organizations(id); END IF;
  IF NOT EXISTS (select 1 from pg_constraint where conname = 'positions_organization_fk') THEN alter table public.positions add constraint positions_organization_fk foreign key (organization_id) references public.organizations(id); END IF;
  IF NOT EXISTS (select 1 from pg_constraint where conname = 'employees_organization_fk') THEN alter table public.employees add constraint employees_organization_fk foreign key (organization_id) references public.organizations(id); END IF;
  IF NOT EXISTS (select 1 from pg_constraint where conname = 'attendance_organization_fk') THEN alter table public.attendance_records add constraint attendance_organization_fk foreign key (organization_id) references public.organizations(id); END IF;
  IF NOT EXISTS (select 1 from pg_constraint where conname = 'leave_requests_organization_fk') THEN alter table public.leave_requests add constraint leave_requests_organization_fk foreign key (organization_id) references public.organizations(id); END IF;
  IF NOT EXISTS (select 1 from pg_constraint where conname = 'leave_balances_organization_fk') THEN alter table public.leave_balances add constraint leave_balances_organization_fk foreign key (organization_id) references public.organizations(id); END IF;
  IF NOT EXISTS (select 1 from pg_constraint where conname = 'audit_logs_organization_fk') THEN alter table public.audit_logs add constraint audit_logs_organization_fk foreign key (organization_id) references public.organizations(id); END IF;
  IF NOT EXISTS (select 1 from pg_constraint where conname = 'payroll_periods_organization_fk') THEN alter table public.payroll_periods add constraint payroll_periods_organization_fk foreign key (organization_id) references public.organizations(id); END IF;
  IF NOT EXISTS (select 1 from pg_constraint where conname = 'payroll_entries_organization_fk') THEN alter table public.payroll_entries add constraint payroll_entries_organization_fk foreign key (organization_id) references public.organizations(id); END IF;
  IF NOT EXISTS (select 1 from pg_constraint where conname = 'expense_claims_organization_fk') THEN alter table public.expense_claims add constraint expense_claims_organization_fk foreign key (organization_id) references public.organizations(id); END IF;
  IF NOT EXISTS (select 1 from pg_constraint where conname = 'documents_organization_fk') THEN alter table public.documents add constraint documents_organization_fk foreign key (organization_id) references public.organizations(id); END IF;
  IF NOT EXISTS (select 1 from pg_constraint where conname = 'onboarding_records_organization_fk') THEN alter table public.onboarding_records add constraint onboarding_records_organization_fk foreign key (organization_id) references public.organizations(id); END IF;
  IF NOT EXISTS (select 1 from pg_constraint where conname = 'onboarding_tasks_organization_fk') THEN alter table public.onboarding_tasks add constraint onboarding_tasks_organization_fk foreign key (organization_id) references public.organizations(id); END IF;
  IF NOT EXISTS (select 1 from pg_constraint where conname = 'notifications_organization_fk') THEN alter table public.notifications add constraint notifications_organization_fk foreign key (organization_id) references public.organizations(id); END IF;
  IF NOT EXISTS (select 1 from pg_constraint where conname = 'recruitment_vacancies_organization_fk') THEN alter table public.recruitment_vacancies add constraint recruitment_vacancies_organization_fk foreign key (organization_id) references public.organizations(id); END IF;
  IF NOT EXISTS (select 1 from pg_constraint where conname = 'recruitment_candidates_organization_fk') THEN alter table public.recruitment_candidates add constraint recruitment_candidates_organization_fk foreign key (organization_id) references public.organizations(id); END IF;
END $$;

insert into public.roles (organization_id, role_key, name)
select o.id, r.role_key, r.name from public.organizations o cross join (values
 ('super_admin','Super Admin'), ('hr_director','HR Director'), ('hr_manager','HR Manager'), ('hr_officer','HR Officer'), ('employee','Employee')
) r(role_key, name) where o.slug = 'demo' on conflict (organization_id, role_key) do update set name = excluded.name;

insert into public.permissions (permission_key, description) values
 ('organization:read','Read organization data'), ('organization:write','Manage organization settings'), ('employee:read','Read employee records'), ('employee:write','Manage employee records'), ('attendance:read','Read attendance'), ('attendance:write','Manage attendance'), ('leave:read','Read leave'), ('leave:write','Manage leave'), ('payroll:read','Read payroll'), ('payroll:write','Process payroll'), ('documents:read','Read documents'), ('documents:write','Manage documents'), ('audit:read','Read audit log')
on conflict (permission_key) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p where r.organization_id = (select id from public.organizations where slug = 'demo') and r.role_key in ('super_admin','hr_director')
on conflict do nothing;
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p on p.permission_key in ('employee:read','attendance:read','attendance:write','leave:read','leave:write','documents:read') where r.organization_id = (select id from public.organizations where slug = 'demo') and r.role_key = 'employee'
on conflict do nothing;

insert into public.organization_memberships (organization_id, user_id, role_id)
select u.organization_id, u.id, r.id from public.users u join public.roles r on r.organization_id = u.organization_id and r.role_key = u.role
on conflict (organization_id, user_id) do update set role_id = excluded.role_id, status = 'active', updated_at = now();

create index if not exists users_organization_idx on public.users(organization_id);
create index if not exists employees_organization_idx on public.employees(organization_id);
create index if not exists audit_logs_organization_created_idx on public.audit_logs(organization_id, created_at desc);
