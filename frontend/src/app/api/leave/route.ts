import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requireAdmin, requireUser } from '@/lib/server/auth';

const LEAVE_TYPES = ['annual', 'sick', 'personal', 'maternity', 'unpaid'];
const STATUSES = ['pending', 'approved', 'rejected', 'cancelled'];

function normalize(row: any) {
  return {
    ...row,
    employee_name: row.employee?.full_name ?? 'Unknown employee',
    employee_email: row.employee?.email ?? '',
    department: row.employee?.departments?.name ?? 'Unassigned',
  };
}

function daysBetween(start: string, end: string) {
  const from = new Date(`${start}T00:00:00Z`).getTime();
  const to = new Date(`${end}T00:00:00Z`).getTime();
  return Math.floor((to - from) / 86400000) + 1;
}

export async function GET(request: Request) {
  try {
    await requireUser(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employee_id');
    const year = searchParams.get('year');
    const client = getSupabaseAdmin();
    let query = client.from('leave_requests').select('*, employee:employee_id(full_name,email,departments(name))', { count: 'exact' });
    if (status && status !== 'all' && STATUSES.includes(status)) query = query.eq('status', status);
    if (employeeId) query = query.eq('employee_id', employeeId);
    if (year && /^\d{4}$/.test(year)) query = query.gte('start_date', `${year}-01-01`).lte('start_date', `${year}-12-31`);
    const { data, count, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ items: (data ?? []).map(normalize), total: count ?? 0 });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const employeeId = String(body.employee_id ?? '').trim();
    const leaveType = String(body.leave_type ?? '').trim().toLowerCase();
    const startDate = String(body.start_date ?? '').trim();
    const endDate = String(body.end_date ?? '').trim();
    const reason = String(body.reason ?? '').trim();
    if (!employeeId || !LEAVE_TYPES.includes(leaveType) || !startDate || !endDate || !reason) return NextResponse.json({ detail: 'Employee, leave type, dates, and reason are required' }, { status: 422 });
    const totalDays = daysBetween(startDate, endDate);
    if (totalDays < 1 || totalDays > 365) return NextResponse.json({ detail: 'Leave dates are invalid' }, { status: 422 });
    const client = getSupabaseAdmin();
    const { data: employee, error: employeeError } = await client.from('employees').select('id').eq('id', employeeId).maybeSingle();
    if (employeeError) throw employeeError;
    if (!employee) return NextResponse.json({ detail: 'Employee not found' }, { status: 404 });
    const { data: overlap, error: overlapError } = await client.from('leave_requests').select('id').eq('employee_id', employeeId).in('status', ['pending', 'approved']).lte('start_date', endDate).gte('end_date', startDate).limit(1);
    if (overlapError) throw overlapError;
    if (overlap?.length) return NextResponse.json({ detail: 'This leave overlaps an existing request' }, { status: 409 });
    const { data, error } = await client.from('leave_requests').insert({ employee_id: employeeId, leave_type: leaveType, start_date: startDate, end_date: endDate, total_days: totalDays, reason, status: 'pending' }).select('*, employee:employee_id(full_name,email,departments(name))').single();
    if (error) throw error;
    return NextResponse.json(normalize(data), { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
