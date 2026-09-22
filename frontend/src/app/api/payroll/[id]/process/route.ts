import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requireAdmin, requireUser } from '@/lib/server/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request); requireAdmin(user);
    const client = getSupabaseAdmin();
    const { data: period, error: periodError } = await client.from('payroll_periods').select('*').eq('id', params.id).maybeSingle();
    if (periodError) throw periodError;
    if (!period) return NextResponse.json({ detail: 'Payroll period not found' }, { status: 404 });
    if (period.status === 'locked') return NextResponse.json({ detail: 'Payroll period is locked' }, { status: 409 });
    const { data: employees, error: employeeError } = await client.from('employees').select('id,base_salary').eq('status', 'active');
    if (employeeError) throw employeeError;
    const rows = (employees ?? []).map((employee: any) => {
      const basic = Number(employee.base_salary ?? 0); const allowance = Math.round(basic * 0.1); const overtime = 0; const gross = basic + allowance + overtime; const pph21 = Math.round(gross * 0.05); const bpjsKes = Math.round(gross * 0.04); const bpjsTk = Math.round(gross * 0.03); const net = Math.max(0, gross - pph21 - bpjsKes - bpjsTk);
      return { period_id: params.id, employee_id: employee.id, basic_salary: basic, allowance, overtime, gross_salary: gross, pph21, bpjs_kes: bpjsKes, bpjs_tk: bpjsTk, other_deduction: 0, net_salary: net, status: 'processed', error_message: null };
    });
    const { error: deleteError } = await client.from('payroll_entries').delete().eq('period_id', params.id); if (deleteError) throw deleteError;
    if (rows.length) { const { error } = await client.from('payroll_entries').insert(rows); if (error) throw error; }
    const { data: updated, error: updateError } = await client.from('payroll_periods').update({ status: 'processed', processed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', params.id).select('*').single();
    if (updateError) throw updateError;
    return NextResponse.json({ period: updated, count: rows.length });
  } catch (error) { return apiError(error); }
}
