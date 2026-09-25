import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requireAdmin, requireUser } from '@/lib/server/auth';

const STATUSES = ['present', 'late', 'absent', 'half-day', 'leave', 'wfh'];

function parseBody(body: any, currentDate: string) {
  const date = String(body.date ?? currentDate);
  const status = String(body.status ?? 'present');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { detail: 'A valid date is required' };
  if (!STATUSES.includes(status)) return { detail: 'Invalid attendance status' };
  const toDate = (time: any) => { if (!time) return null; const value = new Date(`${date}T${String(time)}`); return Number.isNaN(value.getTime()) ? null : value.toISOString(); };
  const checkIn = body.check_in_time !== undefined ? toDate(body.check_in_time) : body.check_in !== undefined ? (body.check_in ? new Date(body.check_in).toISOString() : null) : undefined;
  const checkOut = body.check_out_time !== undefined ? toDate(body.check_out_time) : body.check_out !== undefined ? (body.check_out ? new Date(body.check_out).toISOString() : null) : undefined;
  if (body.check_in_time && !checkIn) return { detail: 'Invalid check-in time' };
  if (body.check_out_time && !checkOut) return { detail: 'Invalid check-out time' };
  if (checkIn && checkOut && new Date(checkOut) < new Date(checkIn)) return { detail: 'Check-out must be after check-in' };
  const duration = checkIn && checkOut ? (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 3600000 : 0;
  return { date, status, checkIn, checkOut, duration, lateMinutes: body.late_minutes == null && checkIn ? Math.max(0, new Date(checkIn).getHours() * 60 + new Date(checkIn).getMinutes() - 540) : Math.max(0, Number(body.late_minutes ?? 0)), overtime: Math.max(0, Number(body.overtime_hours ?? Math.max(0, duration - 8))) };
}

function normalize(row: any) {
  const employee = row.employees ?? {};
  const department = Array.isArray(employee.departments) ? employee.departments[0] : employee.departments;
  return { ...row, name: employee.full_name, employee_code: employee.employee_id, department: department?.name ?? 'Unassigned', check_in_time: row.check_in ? new Date(row.check_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : null, check_out_time: row.check_out ? new Date(row.check_out).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : null };
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    const isAdmin = ['super_admin', 'hr_director', 'hr_manager', 'hr_officer'].includes(user.role);
    const client = getSupabaseAdmin();
    let query = client.from('attendance_records').select('*, employees!inner(full_name, employee_id, department_id, departments(name))').eq('organization_id', user.organization_id).eq('id', params.id);
    if (!isAdmin) {
      if (!user.employee_id) return NextResponse.json({ detail: 'Your user account is not linked to an employee record' }, { status: 422 });
      query = query.eq('employee_id', user.employee_id);
    }
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ detail: 'Attendance record not found' }, { status: 404 });
    return NextResponse.json(normalize(data));
  } catch (error) { return apiError(error); }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    const client = getSupabaseAdmin();
    const { data: existing, error: existingError } = await client.from('attendance_records').select('*').eq('id', params.id).maybeSingle();
    if (existingError) throw existingError;
    if (!existing) return NextResponse.json({ detail: 'Attendance record not found' }, { status: 404 });
    const isAdmin = ['super_admin', 'hr_director', 'hr_manager', 'hr_officer'].includes(user.role);
    if (!isAdmin && existing.employee_id !== user.employee_id) return NextResponse.json({ detail: 'You can only update your own attendance' }, { status: 403 });
    const body = await request.json();
    if (!isAdmin) {
      const allowed = Object.keys(body).filter(key => !['check_out_time', 'check_out'].includes(key));
      if (allowed.length) return NextResponse.json({ detail: 'Employees can only clock out their own attendance' }, { status: 403 });
      const checkOut = new Date();
      const update = await client.from('attendance_records').update({ check_out: checkOut.toISOString() }).eq('id', params.id).eq('employee_id', user.employee_id).is('check_out', null).select('*, employees!inner(full_name, employee_id, department_id, departments(name))').maybeSingle();
      if (update.error) throw update.error;
      if (!update.data) return NextResponse.json({ detail: 'Attendance is already closed or was not found' }, { status: 409 });
      return NextResponse.json(normalize(update.data));
    }
    const parsed = parseBody(body, existing.date);
    if ('detail' in parsed) return NextResponse.json(parsed, { status: 422 });
    const update: Record<string, unknown> = { date: parsed.date, status: parsed.status, late_minutes: parsed.lateMinutes, overtime_hours: parsed.overtime };
    if (parsed.checkIn !== undefined) update.check_in = parsed.checkIn;
    if (parsed.checkOut !== undefined) update.check_out = parsed.checkOut;
    if (body.notes !== undefined) update.notes = String(body.notes).trim() || null;
    const { data, error } = await client.from('attendance_records').update(update).eq('id', params.id).select('*, employees!inner(full_name, employee_id, department_id, departments(name))').single();
    if (error) { if (error.code === '23505') return NextResponse.json({ detail: 'Attendance already exists for this employee and date' }, { status: 409 }); throw error; }
    return NextResponse.json(normalize(data));
  } catch (error) { return apiError(error); }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    requireAdmin(user);
    const { data, error } = await getSupabaseAdmin().from('attendance_records').delete().eq('id', params.id).select('id').maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ detail: 'Attendance record not found' }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error) { return apiError(error); }
}
