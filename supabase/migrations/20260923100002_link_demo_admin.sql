update public.users u
set employee_id = e.id, updated_at = now()
from public.employees e
where u.email = 'admin@hris.local'
  and u.employee_id is null
  and e.employee_id = 'EMP-DEMO-001';
