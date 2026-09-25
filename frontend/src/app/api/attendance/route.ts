import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requireAdmin, requireUser } from '@/lib/server/auth';

const STATUSES = ['present', 'late', 'absent', 'half-day', 'leave', 'wfh'] as const;

function normalize(row: any) {
  const employee = row.employees ?? {};
  const department = Array.isArray(employee.departments) ? employee.departments[0] : employee.departments;
  const checkIn = row.check_in ? new Date(row.check_in) : null;
  const checkOut = row.check_out ? new Date(row.check_out) : null;
  const minutes = checkIn && checkOut ? Math.max(0, Math.round((checkOut.getTime() - checkIn.getTime()) / 60000)) : 0;
  return {
    id: row.id,
    employee_id: row.employee_id,
    name: employee.full_name ?? 'Unknown employee',
    employee_code: employee.employee_id ?? '',
    initials: (employee.full_name ?? 'U').split(/\s+/).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase(),
    department: department?.name ?? 'Unassigned',
    department_id: employee.department_id ?? null,
    date: row.date,
    check_in: row.check_in,
    check_out: row.check_out,
    check_in_time: checkIn?.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) ?? null,
    check_out_time: checkOut?.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) ?? null,
    hours: minutes ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : '—',
    status: row.status,
    overtime_hours: Number(row.overtime_hours ?? 0),
    late_minutes: Number(row.late_minutes ?? 0),
    source: row.source ?? 'web',
    notes: row.notes ?? '',
  };
}

function parseTimestamp(date: string, time?: string | null) {
  if (!time) return null;
  const value = new Date(`${date}T${time}`);
  return Number.isNaN(value.getTime()) ? null : value.toISOString();
}

function validateBody(body: any) {
  const date = String(body.date ?? '').trim();
  const status = String(body.status ?? 'present');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { detail: 'A valid date is required' };
  if (!(STATUSES as readonly string[]).includes(status)) return { detail: 'Invalid attendance status' };
  const checkIn = body.check_in_time ? parseTimestamp(date, String(body.check_in_time)) : body.check_in ? new Date(body.check_in).toISOString() : null;
  const checkOut = body.check_out_time ? parseTimestamp(date, String(body.check_out_time)) : body.check_out ? new Date(body.check_out).toISOString() : null;
  if (body.check_in_time && !checkIn) return { detail: 'Invalid check-in time' };
  if (body.check_out_time && !checkOut) return { detail: 'Invalid check-out time' };
  if (checkIn && checkOut && new Date(checkOut) < new Date(checkIn)) return { detail: 'Check-out must be after check-in' };
  const duration = checkIn && checkOut ? (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 3600000 : 0;
  const lateMinutes = body.late_minutes == null && checkIn ? Math.max(0, Math.round((new Date(checkIn).getHours() * 60 + new Date(checkIn).getMinutes()) - 9 * 60)) : Number(body.late_minutes ?? 0);
  return { date, status, checkIn, checkOut, duration, lateMinutes: Math.max(0, lateMinutes), overtime: Math.max(0, Number(body.overtime_hours ?? Math.max(0, duration - 8))) };
}

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const elevated = ['super_admin', 'hr_director', 'hr_manager', 'hr_officer'].includes(user.role);
    const { searchParams } = new URL(request.url);
    const scopedEmployeeId = elevated ? searchParams.get('employee_id') : user.employee_id;
    if (!elevated && !scopedEmployeeId) return NextResponse.json({ detail: 'Your user account is not linked to an employee record' }, { status: 422 });
    const date = searchParams.get('date');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status');
    const departmentId = searchParams.get('department_id');
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const perPage = Math.min(100, Math.max(1, Number(searchParams.get('per_page') || 100)));
    const client = getSupabaseAdmin();
    let query = client.from('attendance_records').select('*, employees!inner(full_name, employee_id, department_id, departments(name))', { count: 'exact' }).eq('organization_id', user.organization_id);
    if (scopedEmployeeId) query = query.eq('employee_id', scopedEmployeeId);
    if (date) query = query.eq('date', date);
    if (from) query = query.gte('date', from);
    if (to) query = query.lte('date', to);
    if (status && status !== 'all') query = query.eq('status', status);
    if (departmentId && departmentId !== 'all') query = query.eq('employees.department_id', departmentId);
    if (search) query = query.ilike('employees.full_name', `%${search}%`);
    const start = (page - 1) * perPage;
    const { data, count, error } = await query.order('date', { ascending: false }).order('created_at', { ascending: false }).range(start, start + perPage - 1);
    if (error) throw error;
    const total = count ?? 0;
    return NextResponse.json({ items: (data ?? []).map(normalize), total, page, per_page: perPage, total_pages: Math.max(1, Math.ceil(total / perPage)) });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const parsed = validateBody(body);
    if ('detail' in parsed) return NextResponse.json(parsed, { status: 422 });
    const employeeId = ['super_admin', 'hr_director', 'hr_manager', 'hr_officer'].includes(user.role) ? String(body.employee_id ?? '').trim() : user.employee_id ?? '';
    if (!employeeId) return NextResponse.json({ detail: 'Your user account is not linked to an employee record' }, { status: 422 });
    const client = getSupabaseAdmin();
    const { data: employee, error: employeeError } = await client.from('employees').select('id').eq('id', employeeId).eq('status', 'active').maybeSingle();
    if (employeeError) throw employeeError;
    if (!employee) return NextResponse.json({ detail: 'Active employee not found' }, { status: 404 });
    if (body.source === 'manual') requireAdmin(user);
    const { data: duplicate } = await client.from('attendance_records').select('id').eq('employee_id', employeeId).eq('date', parsed.date).maybeSingle();
    if (duplicate) return NextResponse.json({ detail: 'Attendance already exists for this employee and date' }, { status: 409 });
    const record = { organization_id: user.organization_id, employee_id: employeeId, date: parsed.date, check_in: parsed.checkIn, check_out: parsed.checkOut, status: parsed.status, late_minutes: parsed.lateMinutes, overtime_hours: parsed.overtime, source: body.source === 'manual' ? 'manual' : 'web', notes: String(body.notes ?? '').trim() || null };
    const { data, error } = await client.from('attendance_records').insert(record).select('*, employees!inner(full_name, employee_id, department_id, departments(name))').single();
    if (error) { if (error.code === '23505') return NextResponse.json({ detail: 'Attendance already exists for this employee and date' }, { status: 409 }); throw error; }
    return NextResponse.json(normalize(data), { status: 201 });
  } catch (error) { return apiError(error); }
}
