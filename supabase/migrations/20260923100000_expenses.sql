create table if not exists public.expense_claims (
  id uuid primary key default gen_random_uuid(),
  claim_number varchar(30) not null unique,
  employee_id uuid not null references public.employees(id),
  category varchar(80) not null,
  amount numeric(14,2) not null check (amount > 0),
  expense_date date not null,
  description text not null,
  receipt_attached boolean not null default false,
  receipt_name varchar(255),
  status varchar(20) not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'draft')),
  submitted_at timestamptz not null default now(),
  reviewed_by uuid references public.users(id),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists expense_claims_status_idx on public.expense_claims(status);
create index if not exists expense_claims_employee_idx on public.expense_claims(employee_id);
create index if not exists expense_claims_date_idx on public.expense_claims(expense_date desc);
