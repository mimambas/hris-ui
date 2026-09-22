create table if not exists public.recruitment_vacancies (
  id uuid primary key default gen_random_uuid(),
  title varchar(200) not null,
  department varchar(200) not null,
  employment_type varchar(30) not null default 'Full-time',
  openings integer not null default 1 check (openings > 0),
  description text,
  status varchar(20) not null default 'draft' check (status in ('draft', 'open', 'closed')),
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.recruitment_candidates (
  id uuid primary key default gen_random_uuid(),
  vacancy_id uuid references public.recruitment_vacancies(id) on delete set null,
  name varchar(200) not null,
  role varchar(200) not null,
  stage varchar(20) not null default 'Applied' check (stage in ('Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected')),
  applied_date date not null default current_date,
  email varchar(200) not null,
  phone varchar(50),
  location varchar(200),
  source varchar(100),
  rating integer not null default 0 check (rating between 0 and 5),
  experience varchar(100),
  skills text[] not null default '{}',
  notes text not null default '',
  interview_date date,
  interview_time time,
  interviewer varchar(200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists recruitment_candidates_stage_idx on public.recruitment_candidates(stage);
create index if not exists recruitment_candidates_vacancy_idx on public.recruitment_candidates(vacancy_id);

insert into public.recruitment_vacancies (id, title, department, status, openings)
values
 ('00000000-0000-0000-0000-000000000201', 'Senior Backend Developer', 'Engineering', 'open', 1),
 ('00000000-0000-0000-0000-000000000202', 'Product Designer', 'Product & Design', 'open', 1),
 ('00000000-0000-0000-0000-000000000203', 'Finance Analyst', 'Finance', 'open', 1)
on conflict (id) do nothing;

insert into public.recruitment_candidates (id, vacancy_id, name, role, stage, applied_date, email, phone, location, source, rating, experience, skills, notes, interview_date, interview_time, interviewer)
values
 ('00000000-0000-0000-0000-000000000211', '00000000-0000-0000-0000-000000000201', 'Dimas Saputra', 'Senior Backend Developer', 'Interview', '2026-09-21', 'dimas.saputra@email.com', '+628123450001', 'Jakarta Selatan', 'LinkedIn', 4, '7 years', array['Python','FastAPI','PostgreSQL'], 'Strong distributed systems background. Culture interview pending.', '2026-09-25', '10:00', 'Budi Hartono'),
 ('00000000-0000-0000-0000-000000000212', '00000000-0000-0000-0000-000000000202', 'Nadia Putri', 'Product Designer', 'Screening', '2026-09-20', 'nadia.putri@email.com', '+628123450002', 'Bandung', 'Jobstreet', 3, '4 years', array['Figma','Research','Design Systems'], 'Portfolio review looks promising. Schedule phone screen.', null, null, null),
 ('00000000-0000-0000-0000-000000000213', '00000000-0000-0000-0000-000000000203', 'Kevin Wijaya', 'Finance Analyst', 'Offer', '2026-09-19', 'kevin.wijaya@email.com', '+628123450003', 'Jakarta Pusat', 'Referral', 5, '5 years', array['Financial Modeling','Excel','PPh 21'], 'Offer sent on 21 Sep. Awaiting response.', null, null, null),
 ('00000000-0000-0000-0000-000000000214', null, 'Larasati Hadi', 'HR Officer', 'Applied', '2026-09-18', 'larasati.hadi@email.com', '+628123450004', 'Depok', 'Career page', 0, '2 years', array['Recruitment','HRIS','Payroll'], '', null, null, null),
 ('00000000-0000-0000-0000-000000000215', null, 'Yoga Pranoto', 'Frontend Developer', 'Interview', '2026-09-17', 'yoga.pranoto@email.com', '+628123450005', 'Jakarta Barat', 'LinkedIn', 4, '6 years', array['React','TypeScript','Next.js'], 'Technical interview passed. Strong frontend fundamentals.', '2026-09-26', '14:00', 'Rizky Prasetyo')
on conflict (id) do nothing;
