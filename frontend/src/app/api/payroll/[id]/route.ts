import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requirePermission, requireUser } from '@/lib/server/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    requirePermission(user, 'payroll:read');
    const client = getSupabaseAdmin();
    const { data, error } = await client.from('payroll_entries').select('*, employees!inner(full_name,email,employee_id,bank_name,bank_account,departments(name),positions(title)), payroll_periods!inner(name,period_start,period_end,status)').eq('organization_id', user.organization_id).eq('id', params.id).maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ detail: 'Payroll entry not found' }, { status: 404 });
    const employee = Array.isArray(data.employees) ? data.employees[0] : data.employees;
    const period = Array.isArray(data.payroll_periods) ? data.payroll_periods[0] : data.payroll_periods;
    return NextResponse.json({
      id: data.id, employee_id: data.employee_id, name: employee?.full_name ?? 'Unknown employee', employee_code: employee?.employee_id ?? '', email: employee?.email ?? '',
      role: Array.isArray(employee?.positions) ? employee.positions[0]?.title ?? '—' : employee?.positions?.title ?? '—', department: Array.isArray(employee?.departments) ? employee.departments[0]?.name ?? '—' : employee?.departments?.name ?? '—',
      period: period?.name ?? '—', period_start: period?.period_start, period_end: period?.period_end, status: data.status,
      basic: Number(data.basic_salary), allowance: Number(data.allowance), overtime: Number(data.overtime), gross: Number(data.gross_salary), tax: Number(data.pph21), bpjs_kes: Number(data.bpjs_kes), bpjs_tk: Number(data.bpjs_tk), other: Number(data.other_deduction), net: Number(data.net_salary), bank: employee?.bank_name ?? '—', account_number: employee?.bank_account ? `••••${String(employee.bank_account).slice(-4)}` : '—',
    });
  } catch (error) { return apiError(error); }
}
