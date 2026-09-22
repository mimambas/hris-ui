create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email varchar(200) not null unique,
  password_hash varchar(200) not null,
  role varchar(50) not null default 'employee',
  is_active boolean not null default true,
  employee_id uuid,
  last_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name varchar(200) not null,
  code varchar(20) not null unique,
  parent_id uuid references public.departments(id),
  head_id uuid,
  cost_center varchar(50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.positions (
  id uuid primary key default gen_random_uuid(),
  title varchar(200) not null,
  code varchar(20) not null unique,
  level integer,
  grade varchar(10),
  department_id uuid not null references public.departments(id),
  min_salary numeric,
  max_salary numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  employee_id varchar(20) not null unique,
  full_name varchar(200) not null,
  nik varchar(16) unique,
  npwp varchar(20) unique,
  place_of_birth varchar(100),
  date_of_birth date,
  gender varchar(20),
  blood_type varchar(5),
  religion varchar(50),
  marital_status varchar(20),
  phone varchar(20),
  email varchar(200) unique,
  address_ktp text,
  address_domisili text,
  emergency_contact_name varchar(200),
  emergency_contact_phone varchar(20),
  emergency_contact_relation varchar(50),
  join_date date not null,
  contract_start date,
  contract_end date,
  probation_end date,
  employment_status varchar(20) not null default 'contract',
  employment_type varchar(20) not null default 'full-time',
  department_id uuid references public.departments(id),
  position_id uuid references public.positions(id),
  reporting_to uuid,
  branch varchar(100),
  base_salary numeric(15,2),
  bank_name varchar(100),
  bank_account varchar(50),
  bank_account_name varchar(200),
  bpjs_kesehatan_no varchar(30),
  bpjs_ketenagakerjaan_no varchar(30),
  status varchar(20) not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users add constraint users_employee_fk foreign key (employee_id) references public.employees(id) not valid;

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id),
  date date not null,
  check_in timestamptz,
  check_out timestamptz,
  status varchar(20) not null default 'present',
  overtime_hours numeric(5,2) default 0,
  late_minutes integer default 0,
  source varchar(20) default 'web',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id),
  leave_type varchar(10) not null,
  start_date date not null,
  end_date date not null,
  total_days numeric(4,1) not null,
  reason text,
  attachment_url varchar(500),
  status varchar(20) not null default 'pending',
  approved_by uuid,
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.leave_balances (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id),
  leave_type varchar(10) not null,
  year integer not null,
  total_days numeric(4,1) not null,
  used_days numeric(4,1) not null default 0
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  entity_type varchar(50) not null,
  entity_id uuid,
  action varchar(20) not null,
  old_value text,
  new_value text,
  ip_address varchar(45),
  created_at timestamptz not null default now()
);

insert into public.users (email, password_hash, role, is_active)
values ('admin@hris.local', '$2b$12$S5ysxjn60z9dk.BMJ/BrAOSgwyAuG3cSgQK.PzcTMgebGzWhp5fXS', 'super_admin', true)
on conflict (email) do nothing;
