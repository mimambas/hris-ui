import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requireAdmin, requireUser } from '@/lib/server/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request); requireAdmin(user);
    const client = getSupabaseAdmin();
    const { data: period, error: periodError } = await client.from('payroll_periods').select('*').eq('organization_id', user.organization_id).eq('id', params.id).maybeSingle();
    if (periodError) throw periodError;
    if (!period) return NextResponse.json({ detail: 'Payroll period not found' }, { status: 404 });
    if (period.status === 'locked') return NextResponse.json({ detail: 'Payroll period is locked' }, { status: 409 });
    const { data: employees, error: employeeError } = await client.from('employees').select('id,base_salary').eq('organization_id', user.organization_id).eq('status', 'active');
    if (employeeError) throw employeeError;
    const rows = (employees ?? []).map((employee: any) => {
      const basic = Number(employee.base_salary ?? 0); const allowance = Math.round(basic * 0.1); const overtime = 0; const gross = basic + allowance + overtime; const pph21 = Math.round(gross * 0.05); const bpjsKes = Math.round(gross * 0.04); const bpjsTk = Math.round(gross * 0.03); const net = Math.max(0, gross - pph21 - bpjsKes - bpjsTk);
      return { organization_id: user.organization_id, period_id: params.id, employee_id: employee.id, basic_salary: basic, allowance, overtime, gross_salary: gross, pph21, bpjs_kes: bpjsKes, bpjs_tk: bpjsTk, other_deduction: 0, net_salary: net, status: 'processed', error_message: null };
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
