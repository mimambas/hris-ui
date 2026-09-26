import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requirePermission, requireUser } from '@/lib/server/auth';
import { calculatePayroll } from '@/lib/payroll';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request); requirePermission(user, 'payroll:write');
    const client = getSupabaseAdmin();
    const { data: period, error: periodError } = await client.from('payroll_periods').select('*').eq('organization_id', user.organization_id).eq('id', params.id).maybeSingle();
    if (periodError) throw periodError;
    if (!period) return NextResponse.json({ detail: 'Payroll period not found' }, { status: 404 });
    if (period.status === 'locked') return NextResponse.json({ detail: 'Payroll period is locked' }, { status: 409 });
    const { data: employees, error: employeeError } = await client.from('employees').select('id,base_salary').eq('organization_id', user.organization_id).eq('status', 'active');
    if (employeeError) throw employeeError;
    const rows = (employees ?? []).map((employee: any) => {
      const basic = Number(employee.base_salary ?? 0);
      // Statutory engine: allowance is the configured 10% of base, tax/BPJS use
      // PTKP + progressive brackets and capped contributions (see lib/payroll.ts).
      const calc = calculatePayroll({ basicSalary: basic, allowance: Math.round(basic * 0.1) });
      return { organization_id: user.organization_id, period_id: params.id, employee_id: employee.id, basic_salary: calc.basic_salary, allowance: calc.allowance, overtime: calc.overtime, gross_salary: calc.gross_salary, pph21: calc.pph21, bpjs_kes: calc.bpjs_kes, bpjs_tk: calc.bpjs_tk, other_deduction: calc.other_deduction, net_salary: calc.net_salary, status: 'processed', error_message: null };
    });
    const { data: result, error: rpcError } = await client.rpc('payroll_process_atomic', {
      p_organization_id: user.organization_id,
      p_period_id: params.id,
      p_entries: rows,
    });
    if (rpcError) return NextResponse.json({ detail: rpcError.message }, { status: rpcError.message?.includes('locked') ? 409 : 500 });
    const { data: updated, error: updatedError } = await client.from('payroll_periods').select('*').eq('organization_id', user.organization_id).eq('id', params.id).maybeSingle();
    if (updatedError) throw updatedError;
    return NextResponse.json({ period: updated, count: result?.count ?? rows.length });
  } catch (error) { return apiError(error); }
}
