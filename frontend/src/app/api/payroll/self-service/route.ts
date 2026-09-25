import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requireUser } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    if (!user.employee_id) return NextResponse.json({ detail: 'Your user account is not linked to an employee record' }, { status: 422 });
    const { data, error } = await getSupabaseAdmin()
      .from('payroll_entries')
      .select('id,status,basic_salary,allowance,overtime,gross_salary,pph21,bpjs_kes,bpjs_tk,other_deduction,net_salary, created_at, payroll_periods!inner(name,period_start,period_end,status)')
      .eq('organization_id', user.organization_id)
      .eq('employee_id', user.employee_id)
      .in('status', ['processed', 'paid', 'locked'])
      .order('created_at', { ascending: false });
    if (error) throw error;
    const items = (data ?? []).map((row: any) => {
      const period = Array.isArray(row.payroll_periods) ? row.payroll_periods[0] : row.payroll_periods;
      return {
        id: row.id,
        period: period?.name ?? '—',
        period_start: period?.period_start,
        period_end: period?.period_end,
        status: row.status,
        basic: Number(row.basic_salary), allowance: Number(row.allowance), overtime: Number(row.overtime),
        gross: Number(row.gross_salary), deductions: Number(row.pph21) + Number(row.bpjs_kes) + Number(row.bpjs_tk) + Number(row.other_deduction),
        net: Number(row.net_salary),
      };
    });
    return NextResponse.json({ items });
  } catch (error) { return apiError(error); }
}
