import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requireAdmin, requireUser } from '@/lib/server/auth';

const PAGE_SIZE_DEFAULT = 10;

function normalizeEmployee(row: any) {
  return {
    id: row.id,
    employee_id: row.employee_id,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
    join_date: row.join_date,
    employment_status: row.employment_status,
    employment_type: row.employment_type,
    department_id: row.department_id,
    position_id: row.position_id,
    status: row.status,
    branch: row.branch,
    base_salary: row.base_salary,
    contract_end: row.contract_end,
    department: row.departments?.name ?? null,
    position: row.positions?.title ?? null,
    created_at: row.created_at,
  };
}

export async function GET(request: Request) {
  try {
    await requireUser(request);
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const perPage = Math.min(100, Math.max(1, Number(searchParams.get('per_page') || PAGE_SIZE_DEFAULT)));
    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status');
    const departmentId = searchParams.get('department_id');
    const client = getSupabaseAdmin();
    let query = client.from('employees').select('*, departments(name), positions(title)', { count: 'exact' });
    if (search) query = query.or(`full_name.ilike.%${search}%,employee_id.ilike.%${search}%`);
    if (status && status !== 'all') query = query.eq('status', status);
    if (departmentId && departmentId !== 'all') query = query.eq('department_id', departmentId);
    const from = (page - 1) * perPage;
    const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, from + perPage - 1);
    if (error) throw error;
    const total = count ?? 0;
    return NextResponse.json({ items: (data ?? []).map(normalizeEmployee), total, page, per_page: perPage, total_pages: Math.max(1, Math.ceil(total / perPage)) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    requireAdmin(user);
    const body = await request.json();
    const fullName = String(body.full_name ?? '').trim();
    const joinDate = String(body.join_date ?? '').trim();
    if (!fullName || !joinDate) return NextResponse.json({ detail: 'Full name and join date are required' }, { status: 422 });
    if (body.nik && !/^\d{16}$/.test(String(body.nik))) return NextResponse.json({ detail: 'NIK must be 16 digits' }, { status: 422 });
    const client = getSupabaseAdmin();
    const prefix = `EMP-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-`;
    const { data: latest } = await client.from('employees').select('employee_id').like('employee_id', `${prefix}%`).order('employee_id', { ascending: false }).limit(1).maybeSingle();
    const sequence = latest?.employee_id ? Number(latest.employee_id.slice(-3)) + 1 : 1;
    const record = {
      employee_id: `${prefix}${String(sequence).padStart(3, '0')}`,
      full_name: fullName,
      nik: body.nik || null,
      npwp: body.npwp || null,
      place_of_birth: body.place_of_birth || null,
      date_of_birth: body.date_of_birth || null,
      gender: body.gender || null,
      phone: body.phone || null,
      email: body.email?.trim().toLowerCase() || null,
      address_ktp: body.address_ktp || null,
      address_domisili: body.address_domisili || null,
      emergency_contact_name: body.emergency_contact_name || null,
      emergency_contact_phone: body.emergency_contact_phone || null,
      emergency_contact_relation: body.emergency_contact_relation || null,
      join_date: joinDate,
      employment_status: body.employment_status || 'contract',
      employment_type: body.employment_type || 'full-time',
      department_id: body.department_id || null,
      position_id: body.position_id || null,
      reporting_to: body.reporting_to || null,
      branch: body.branch || null,
      base_salary: body.base_salary ? Number(body.base_salary) : null,
      bank_name: body.bank_name || null,
      bank_account: body.bank_account || null,
      bank_account_name: body.bank_account_name || null,
      status: 'active',
    };
    const { data, error } = await client.from('employees').insert(record).select('*, departments(name), positions(title)').single();
    if (error) {
      if (error.code === '23505') return NextResponse.json({ detail: 'Employee ID, NIK, or email already exists' }, { status: 409 });
      throw error;
    }
    return NextResponse.json(normalizeEmployee(data), { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
