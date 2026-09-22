import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requireAdmin, requireUser } from '@/lib/server/auth';

function normalizePeriod(row: any) { return { id: row.id, name: row.name, period_start: row.period_start, period_end: row.period_end, status: row.status, processed_at: row.processed_at, locked_at: row.locked_at }; }

export async function GET(request: Request) {
  try {
    await requireUser(request);
    const { data, error } = await getSupabaseAdmin().from('payroll_periods').select('*').order('period_start', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ items: (data ?? []).map(normalizePeriod) });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request); requireAdmin(user);
    const body = await request.json();
    const name = String(body.name ?? '').trim(); const start = String(body.period_start ?? ''); const end = String(body.period_end ?? '');
    if (!name || !start || !end) return NextResponse.json({ detail: 'Name, start date, and end date are required' }, { status: 422 });
    const { data, error } = await getSupabaseAdmin().from('payroll_periods').insert({ name, period_start: start, period_end: end, status: 'draft' }).select('*').single();
    if (error) { if (error.code === '23505') return NextResponse.json({ detail: 'Payroll period already exists' }, { status: 409 }); throw error; }
    return NextResponse.json(normalizePeriod(data), { status: 201 });
  } catch (error) { return apiError(error); }
}
