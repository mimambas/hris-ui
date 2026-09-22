insert into public.expense_claims (claim_number, employee_id, category, amount, expense_date, description, receipt_attached, status)
select 'EXP-DEMO-001', e.id, 'Client Entertainment', 2450000, current_date - 1, 'Demo client dinner claim', true, 'pending'
from public.employees e where e.employee_id = 'EMP-DEMO-004'
on conflict (claim_number) do nothing;

insert into public.expense_claims (claim_number, employee_id, category, amount, expense_date, description, receipt_attached, status)
select 'EXP-DEMO-002', e.id, 'Software & Tools', 950000, current_date - 3, 'Demo software subscription', true, 'approved'
from public.employees e where e.employee_id = 'EMP-DEMO-002'
on conflict (claim_number) do nothing;
