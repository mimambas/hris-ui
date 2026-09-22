-- Idempotent demo data for local and production smoke testing.
-- Safe to apply repeatedly; no credentials or service keys are stored here.

create unique index if not exists leave_balances_employee_type_year_uidx
  on public.leave_balances (employee_id, leave_type, year);

insert into public.departments (name, code, cost_center)
values
  ('Human Resources', 'HR', 'CC-HR'),
  ('Engineering', 'ENG', 'CC-ENG'),
  ('Finance', 'FIN', 'CC-FIN'),
  ('Marketing', 'MKT', 'CC-MKT')
on conflict (code) do update set name = excluded.name, cost_center = excluded.cost_center;

insert into public.positions (title, code, level, grade, department_id, min_salary, max_salary)
select seed.title, seed.code, seed.level, seed.grade, d.id, seed.min_salary, seed.max_salary
from (values
  ('HR Manager', 'HR-MGR', 5, 'M5', 'HR', 15000000::numeric, 25000000::numeric),
  ('HR Officer', 'HR-OFF', 3, 'M3', 'HR', 7000000::numeric, 13000000::numeric),
  ('Tech Lead', 'ENG-LEAD', 6, 'E6', 'ENG', 20000000::numeric, 35000000::numeric),
  ('Backend Developer', 'ENG-BE', 4, 'E4', 'ENG', 12000000::numeric, 22000000::numeric),
  ('Finance Officer', 'FIN-OFF', 3, 'F3', 'FIN', 8000000::numeric, 15000000::numeric),
  ('Marketing Specialist', 'MKT-SPEC', 3, 'M3', 'MKT', 8000000::numeric, 15000000::numeric)
) as seed(title, code, level, grade, department_code, min_salary, max_salary)
join public.departments d on d.code = seed.department_code
on conflict (code) do update set
  title = excluded.title,
  department_id = excluded.department_id,
  min_salary = excluded.min_salary,
  max_salary = excluded.max_salary;

insert into public.employees (
  employee_id, full_name, email, phone, join_date, employment_status, employment_type,
  department_id, position_id, branch, base_salary, status
)
select seed.employee_id, seed.full_name, seed.email, seed.phone, seed.join_date::date,
  'permanent', 'full-time', d.id, p.id, 'Jakarta HQ', seed.base_salary, 'active'
from (values
  ('EMP-DEMO-001', 'Rina Sari', 'rina.demo@hris.local', '+62 812-1000-0001', '2020-03-15', 'HR', 'HR-MGR', 18000000::numeric),
  ('EMP-DEMO-002', 'Budi Hartono', 'budi.demo@hris.local', '+62 812-1000-0002', '2021-06-01', 'ENG', 'ENG-LEAD', 25000000::numeric),
  ('EMP-DEMO-003', 'Sari Dewi', 'sari.demo@hris.local', '+62 812-1000-0003', '2023-01-10', 'MKT', 'MKT-SPEC', 12000000::numeric),
  ('EMP-DEMO-004', 'Andi Pratama', 'andi.demo@hris.local', '+62 812-1000-0004', '2022-09-20', 'FIN', 'FIN-OFF', 14000000::numeric),
  ('EMP-DEMO-005', 'Dewi Lestari', 'dewi.demo@hris.local', '+62 812-1000-0005', '2024-02-14', 'HR', 'HR-OFF', 10000000::numeric),
  ('EMP-DEMO-006', 'Rizky Prasetyo', 'rizky.demo@hris.local', '+62 812-1000-0006', '2023-08-01', 'ENG', 'ENG-BE', 16000000::numeric)
) as seed(employee_id, full_name, email, phone, join_date, department_code, position_code, base_salary)
join public.departments d on d.code = seed.department_code
join public.positions p on p.code = seed.position_code
on conflict (employee_id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  phone = excluded.phone,
  department_id = excluded.department_id,
  position_id = excluded.position_id,
  base_salary = excluded.base_salary,
  status = 'active';

insert into public.leave_balances (employee_id, leave_type, year, total_days, used_days)
select e.id, seed.leave_type, extract(year from current_date)::integer, seed.total_days, seed.used_days
from public.employees e
cross join (values
  ('annual', 12::numeric, 2::numeric),
  ('sick', 12::numeric, 1::numeric),
  ('personal', 3::numeric, 0::numeric)
) as seed(leave_type, total_days, used_days)
where e.employee_id like 'EMP-DEMO-%'
on conflict (employee_id, leave_type, year) do update set
  total_days = excluded.total_days,
  used_days = excluded.used_days;

insert into public.leave_requests (employee_id, leave_type, start_date, end_date, total_days, reason, status)
select e.id, 'annual', current_date + 7, current_date + 9, 3, 'Demo family vacation request', 'pending'
from public.employees e
where e.employee_id = 'EMP-DEMO-002'
  and not exists (
    select 1 from public.leave_requests r
    where r.employee_id = e.id and r.reason = 'Demo family vacation request'
  );

insert into public.leave_requests (employee_id, leave_type, start_date, end_date, total_days, reason, status, approved_at)
select e.id, 'sick', current_date - 7, current_date - 7, 1, 'Demo medical appointment', 'approved', now()
from public.employees e
where e.employee_id = 'EMP-DEMO-003'
  and not exists (
    select 1 from public.leave_requests r
    where r.employee_id = e.id and r.reason = 'Demo medical appointment'
  );
