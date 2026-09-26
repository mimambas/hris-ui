import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requirePermission, requireUser } from '@/lib/server/auth';

function normalizeEmployee(row: any) {
  return { ...row, department: row.departments?.name ?? null, position: row.positions?.title ?? null };
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    const { data, error } = await getSupabaseAdmin().from('employees').select('*, departments(name), positions(title)').eq('id', params.id).eq('organization_id', user.organization_id).maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ detail: 'Employee not found' }, { status: 404 });
    return NextResponse.json(normalizeEmployee(data));
  } catch (error) {
    return apiError(error);
  }
}

const SELF_EDITABLE = ['phone', 'address_ktp', 'address_domisili', 'emergency_contact_name', 'emergency_contact_phone', 'bank_name', 'bank_account'];

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const elevated = user.permissions.includes('employee:write') || ['super_admin', 'hr_director'].includes(user.role);
    if (!elevated) {
      // PRD 1.3: employees may edit only their own contact fields; sensitive/HR fields
      // (name, NIK, NPWP, salary, department, status...) require elevated permission.
      if (user.employee_id !== params.id) return NextResponse.json({ detail: 'Employees may only edit their own profile' }, { status: 403 });
    }
    const allowed = elevated
      ? ['full_name', 'nik', 'npwp', 'phone', 'email', 'address_ktp', 'address_domisili', 'emergency_contact_name', 'emergency_contact_phone', 'employment_status', 'employment_type', 'department_id', 'position_id', 'reporting_to', 'branch', 'base_salary', 'bank_name', 'bank_account', 'bank_account_name', 'status']
      : SELF_EDITABLE;
    const update = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
    if (!Object.keys(update).length) return NextResponse.json({ detail: 'No permitted fields supplied' }, { status: 422 });
    if (typeof update.email === 'string') update.email = update.email.trim().toLowerCase();
    const { data, error } = await getSupabaseAdmin().from('employees').update(update).eq('id', params.id).eq('organization_id', user.organization_id).select('*, departments(name), positions(title)').maybeSingle();
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
    requirePermission(user, 'employee:write');
    const { data, error } = await getSupabaseAdmin().from('employees').update({ status: 'inactive' }).eq('id', params.id).eq('organization_id', user.organization_id).select('id,status').maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ detail: 'Employee not found' }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
