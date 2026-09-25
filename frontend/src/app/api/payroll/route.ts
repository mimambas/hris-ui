import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { apiError, getSupabaseAdmin, requireAdmin, requireUser } from '@/lib/server/auth';

function normalizeEntry(row: any) {
  const employee = row.employees ?? {};
  const department = Array.isArray(employee.departments) ? employee.departments[0] : employee.departments;
  const position = Array.isArray(employee.positions) ? employee.positions[0] : employee.positions;
  return { id: row.id, employee_id: row.employee_id, name: employee.full_name ?? 'Unknown', initials: (employee.full_name ?? 'U').split(/\s+/).map((x: string) => x[0]).join('').slice(0, 2).toUpperCase(), department: department?.name ?? 'Unassigned', position: position?.title ?? '—', basic_salary: Number(row.basic_salary), allowance: Number(row.allowance), overtime: Number(row.overtime), gross_salary: Number(row.gross_salary), pph21: Number(row.pph21), bpjs_kes: Number(row.bpjs_kes), bpjs_tk: Number(row.bpjs_tk), other_deduction: Number(row.other_deduction), net_salary: Number(row.net_salary), status: row.status, error_message: row.error_message, bank: employee.bank_name ?? '—', account_number: employee.bank_account ? `••••${String(employee.bank_account).slice(-4)}` : '—' };
}

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    requireAdmin(user);
    const { searchParams } = new URL(request.url);
    const periodId = searchParams.get('period_id');
    if (!periodId) return NextResponse.json({ detail: 'period_id is required' }, { status: 422 });
    const client = getSupabaseAdmin();
    let query = client.from('payroll_entries').select('*, employees!inner(full_name, bank_name, bank_account, departments(name), positions(title))').eq('organization_id', user.organization_id).eq('period_id', periodId);
    const search = searchParams.get('search')?.trim();
    if (search) query = query.ilike('employees.full_name', `%${search}%`);
    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) throw error;
    return NextResponse.json({ items: (data ?? []).map(normalizeEntry), total: data?.length ?? 0 });
  } catch (error) { return apiError(error); }
}
