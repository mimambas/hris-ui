import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requireAdmin, requireUser } from '@/lib/server/auth';

function normalizeDepartment(row: any, employeeCount = 0) {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    parent_id: row.parent_id,
    parent: row.parent?.name ?? '—',
    head_id: row.head_id,
    head: 'Unassigned',
    head_email: '',
    cost_center: row.cost_center,
    employee_count: employeeCount,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const client = getSupabaseAdmin();
    let query = client.from('departments').select('*, parent:parent_id(name)', { count: 'exact' }).eq('organization_id', user.organization_id);
    if (search) query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    const { data, count, error } = await query.order('name', { ascending: true });
    if (error) throw error;
    const rows = data ?? [];
    const ids = rows.map((row: any) => row.id);
    const counts = new Map<string, number>();
    if (ids.length) {
      const { data: employees, error: employeeError } = await client.from('employees').select('department_id').eq('organization_id', user.organization_id).in('department_id', ids);
      if (employeeError) throw employeeError;
      for (const employee of employees ?? []) counts.set(employee.department_id, (counts.get(employee.department_id) ?? 0) + 1);
    }
    return NextResponse.json({ items: rows.map((row: any) => normalizeDepartment(row, counts.get(row.id) ?? 0)), total: count ?? rows.length });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    requireAdmin(user);
    const body = await request.json();
    const name = String(body.name ?? '').trim();
    const code = String(body.code ?? '').trim().toUpperCase();
    if (!name || !code) return NextResponse.json({ detail: 'Department name and code are required' }, { status: 422 });
    const client = getSupabaseAdmin();
    const record = { organization_id: user.organization_id, name, code, parent_id: body.parent_id || null, head_id: body.head_id || null, cost_center: body.cost_center || null };
    const { data, error } = await client.from('departments').insert(record).select('*, parent:parent_id(name)').single();
    if (error) {
      if (error.code === '23505') return NextResponse.json({ detail: 'Department code already exists' }, { status: 409 });
      throw error;
    }
    return NextResponse.json(normalizeDepartment(data), { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
