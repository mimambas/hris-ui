create table if not exists public.payroll_periods (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  period_start date not null,
  period_end date not null,
  status varchar(20) not null default 'draft' check (status in ('draft', 'processing', 'processed', 'locked')),
  processed_at timestamptz,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (period_start, period_end),
  check (period_end >= period_start)
);

create table if not exists public.payroll_entries (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references public.payroll_periods(id) on delete cascade,
  employee_id uuid not null references public.employees(id),
  basic_salary numeric(14,2) not null default 0 check (basic_salary >= 0),
  allowance numeric(14,2) not null default 0 check (allowance >= 0),
  overtime numeric(14,2) not null default 0 check (overtime >= 0),
  gross_salary numeric(14,2) not null default 0 check (gross_salary >= 0),
  pph21 numeric(14,2) not null default 0 check (pph21 >= 0),
  bpjs_kes numeric(14,2) not null default 0 check (bpjs_kes >= 0),
  bpjs_tk numeric(14,2) not null default 0 check (bpjs_tk >= 0),
  other_deduction numeric(14,2) not null default 0 check (other_deduction >= 0),
  net_salary numeric(14,2) not null default 0 check (net_salary >= 0),
  status varchar(20) not null default 'draft' check (status in ('draft', 'processed', 'error')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (period_id, employee_id)
);

create index if not exists payroll_periods_status_idx on public.payroll_periods(status);
create index if not exists payroll_entries_period_idx on public.payroll_entries(period_id);

insert into public.payroll_periods (name, period_start, period_end, status)
values ('September 2026', '2026-09-01', '2026-09-30', 'draft')
on conflict (period_start, period_end) do update set name = excluded.name;
