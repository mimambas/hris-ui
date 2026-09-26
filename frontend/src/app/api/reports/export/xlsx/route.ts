import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { apiError, getSupabaseAdmin, requireAdmin, requireUser } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await requireUser(request); requireAdmin(user);
    const params = new URL(request.url).searchParams;
    const report = params.get('report') ?? 'headcount'; const range = params.get('range') ?? 'This month';
    const { data, error } = await getSupabaseAdmin().from('employees').select('employee_id,full_name,email,department_id,departments(name),status,join_date').eq('organization_id', user.organization_id).order('full_name');
    if (error) throw error;
    const rows = (data ?? []).map((row: any) => ({ 'Employee ID': row.employee_id, Name: row.full_name, Email: row.email ?? '', Department: Array.isArray(row.departments) ? row.departments[0]?.name ?? 'Unassigned' : row.departments?.name ?? 'Unassigned', Status: row.status, 'Join Date': row.join_date ?? '' }));
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, report.slice(0, 31));
    const bytes = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return new NextResponse(bytes, { headers: { 'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'content-disposition': `attachment; filename="${report}-${range.toLowerCase().replace(/\s+/g, '-')}.xlsx"` } });
  } catch (error) { return apiError(error); }
}
