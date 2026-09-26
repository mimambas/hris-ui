import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requireAdmin, requireUser } from '@/lib/server/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request); requireAdmin(user);
    const client = getSupabaseAdmin();
    const { data: record, error } = await client.from('offboarding_records').select('id,employee_id,last_working_date,reason,employee:employee_id(full_name,employee_id,base_salary,join_date)').eq('organization_id', user.organization_id).eq('id', params.id).maybeSingle();
    if (error) throw error;
    if (!record) return NextResponse.json({ detail: 'Offboarding record not found' }, { status: 404 });
    const employee = Array.isArray(record.employee) ? record.employee[0] : record.employee;
    const salary = Number(employee?.base_salary ?? 0);
    const joinDate = employee?.join_date ? new Date(`${employee.join_date}T00:00:00`) : null;
    const lastDay = new Date(`${record.last_working_date}T00:00:00`);
    const monthsWorked = joinDate ? Math.max(0, Math.floor((lastDay.getTime() - joinDate.getTime()) / (30 * 86400000))) : 0;
    const proratedSalary = Math.round(salary / 30 * lastDay.getDate());
    return NextResponse.json({ id: record.id, employee: employee?.full_name ?? 'Unknown', employee_code: employee?.employee_id ?? '', reason: record.reason, last_working_date: record.last_working_date, base_salary: salary, months_worked: monthsWorked, prorated_salary: proratedSalary, unused_leave_compensation: 0, outstanding_deductions: 0, estimated_total: proratedSalary, disclaimer: 'Estimate only. Validate against company policy and Indonesian employment law before payment.' });
  } catch (error) { return apiError(error); }
}
