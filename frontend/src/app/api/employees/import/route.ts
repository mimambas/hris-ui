import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requireAdmin, requireUser } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

function csv(rows: any[]) {
  const value = (item: unknown) => `"${String(item ?? '').replaceAll('"', '""')}"`;
  return ['Employee ID,Employee Name,Email,Join Date,Employment Status,Employment Type', ...rows.map((row) => [row.employee_id, row.full_name, row.email, row.join_date, row.employment_status, row.employment_type].map(value).join(','))].join('\n');
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    requireAdmin(user);
    const body = await request.json();
    const rows = Array.isArray(body.rows) ? body.rows : [];
    if (!rows.length || rows.length > 1000) return NextResponse.json({ detail: 'Rows must contain between 1 and 1000 records' }, { status: 422 });
    const valid: any[] = []; const errors: { line: number; reason: string }[] = [];
    const client = getSupabaseAdmin();
    for (const [index, row] of rows.entries()) {
      const name = String(row.full_name ?? '').trim(); const joinDate = String(row.join_date ?? '').trim();
      if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(joinDate)) { errors.push({ line: index + 1, reason: 'full_name and valid join_date are required' }); continue; }
      if (row.nik && !/^\d{16}$/.test(String(row.nik))) { errors.push({ line: index + 1, reason: 'NIK must be 16 digits' }); continue; }
      const departmentName = String(row.department ?? '').trim();
      const positionTitle = String(row.position ?? '').trim();
      const department = departmentName ? await client.from('departments').select('id').eq('organization_id', user.organization_id).eq('name', departmentName).maybeSingle() : { data: null, error: null };
      if (department.error) throw department.error;
      if (departmentName && !department.data) { errors.push({ line: index + 1, reason: `Department not found: ${departmentName}` }); continue; }
      const position = positionTitle ? await client.from('positions').select('id').eq('organization_id', user.organization_id).eq('title', positionTitle).maybeSingle() : { data: null, error: null };
      if (position.error) throw position.error;
      if (positionTitle && !position.data) { errors.push({ line: index + 1, reason: `Position not found: ${positionTitle}` }); continue; }
      valid.push({ organization_id: user.organization_id, employee_id: String(row.employee_id ?? '').trim() || null, full_name: name, email: row.email ? String(row.email).trim().toLowerCase() : null, phone: row.phone || null, nik: row.nik || null, npwp: row.npwp || null, join_date: joinDate, employment_status: row.employment_status || 'contract', employment_type: row.employment_type || 'full-time', department_id: department.data?.id ?? null, position_id: position.data?.id ?? null, branch: row.location || null, base_salary: row.salary ? Number(String(row.salary).replace(/[^0-9.\-]/g, '')) : null, status: 'active' });
    }
    if (errors.length) return NextResponse.json({ imported: 0, valid_rows: valid.length, errors, preview: valid.slice(0, 10) }, { status: 422 });
    const { data, error } = await client.from('employees').insert(valid).select('id,employee_id,full_name,email');
    if (error) { if (error.code === '23505') return NextResponse.json({ detail: 'Duplicate employee_id, NIK, or email found', imported: 0 }, { status: 409 }); throw error; }
    await client.from('audit_logs').insert({ organization_id: user.organization_id, user_id: user.id, entity_type: 'employee_import', action: 'create', new_value: JSON.stringify({ count: data?.length ?? 0 }) });
    return NextResponse.json({ imported: data?.length ?? 0, errors: [], items: data ?? [] }, { status: 201 });
  } catch (error) { return apiError(error); }
}

export async function GET(request: Request) {
  try {
    const user = await requireUser(request); requireAdmin(user);
    const { data, error } = await getSupabaseAdmin().from('employees').select('employee_id,full_name,email,join_date,employment_status,employment_type').eq('organization_id', user.organization_id).order('created_at', { ascending: false }).limit(1000);
    if (error) throw error;
    return new NextResponse(csv(data ?? []), { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="employees.csv"' } });
  } catch (error) { return apiError(error); }
}
