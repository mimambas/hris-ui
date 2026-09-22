insert into public.attendance_records (employee_id, date, check_in, check_out, status, late_minutes, overtime_hours, source, notes)
select e.id, current_date - 1, current_date - 1 + time '08:55', current_date - 1 + time '17:05', 'present', 0, 0, 'seed', 'Demo attendance record'
from public.employees e
where e.employee_id = 'EMP-DEMO-001'
  and not exists (select 1 from public.attendance_records a where a.employee_id = e.id and a.date = current_date - 1);

insert into public.attendance_records (employee_id, date, check_in, check_out, status, late_minutes, overtime_hours, source, notes)
select e.id, current_date - 1, current_date - 1 + time '09:18', current_date - 1 + time '17:10', 'late', 18, 0, 'seed', 'Demo late attendance record'
from public.employees e
where e.employee_id = 'EMP-DEMO-002'
  and not exists (select 1 from public.attendance_records a where a.employee_id = e.id and a.date = current_date - 1);
