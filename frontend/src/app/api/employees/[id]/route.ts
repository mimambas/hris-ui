import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requireAdmin, requireUser } from '@/lib/server/auth';

function normalizeEmployee(row: any) {
  return { ...row, department: row.departments?.name ?? null, position: row.positions?.title ?? null };
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireUser(request);
    const { data, error } = await getSupabaseAdmin().from('employees').select('*, departments(name), positions(title)').eq('id', params.id).maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ detail: 'Employee not found' }, { status: 404 });
    return NextResponse.json(normalizeEmployee(data));
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    requireAdmin(user);
    const body = await request.json();
    const allowed = ['full_name', 'nik', 'npwp', 'phone', 'email', 'address_ktp', 'address_domisili', 'emergency_contact_name', 'emergency_contact_phone', 'employment_status', 'employment_type', 'department_id', 'position_id', 'reporting_to', 'branch', 'base_salary', 'bank_name', 'bank_account', 'bank_account_name', 'status'];
    const update = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
    if (typeof update.email === 'string') update.email = update.email.trim().toLowerCase();
    const { data, error } = await getSupabaseAdmin().from('employees').update(update).eq('id', params.id).select('*, departments(name), positions(title)').maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ detail: 'Employee not found' }, { status: 404 });
    return NextResponse.json(normalizeEmployee(data));
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    requireAdmin(user);
    const { data, error } = await getSupabaseAdmin().from('employees').update({ status: 'inactive' }).eq('id', params.id).select('id,status').maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ detail: 'Employee not found' }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
