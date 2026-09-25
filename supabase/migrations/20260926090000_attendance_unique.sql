-- Deduplicate attendance rows that share the same employee and date before
-- adding the constraint, otherwise a production DB with historical duplicates
-- would make the migration fail.
delete from public.attendance_records a
using public.attendance_records b
where a.organization_id = b.organization_id
  and a.employee_id = b.employee_id
  and a.date = b.date
  and a.ctid < b.ctid;

create unique index if not exists attendance_employee_date_uidx
  on public.attendance_records (employee_id, date);
