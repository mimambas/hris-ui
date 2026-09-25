import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requireUser } from '@/lib/server/auth';

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    if (!user.employee_id) return NextResponse.json({ detail: 'Your user account is not linked to an employee record' }, { status: 422 });
    const year = new URL(request.url).searchParams.get('year');
    let query = getSupabaseAdmin().from('leave_balances').select('leave_type,year,total_days,used_days').eq('organization_id', user.organization_id).eq('employee_id', user.employee_id);
    if (year && /^\d{4}$/.test(year)) query = query.eq('year', Number(year));
    const { data, error } = await query.order('leave_type');
    if (error) throw error;
    return NextResponse.json({ items: (data ?? []).map((row: any) => ({ ...row, total_days: Number(row.total_days), used_days: Number(row.used_days), remaining_days: Math.max(0, Number(row.total_days) - Number(row.used_days)) })) });
  } catch (error) { return apiError(error); }
}
