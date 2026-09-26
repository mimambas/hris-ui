import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requirePermission, requireUser } from '@/lib/server/auth';

function pdfEscape(value: string) { return value.replace(/([\\()])/g, '\\$1').replace(/[^\x20-\x7E]/g, '?'); }
function buildPdf(title: string, rows: { label: string; value: string }[]) {
  const lines = [title, `Generated ${new Date().toISOString()}`, '', ...rows.map((row) => `${row.label}: ${row.value}`)];
  const content = ['BT', '/F1 12 Tf', '50 780 Td', ...lines.flatMap((line, index) => [index ? '0 -18 Td' : '', `(${pdfEscape(line)}) Tj`]), 'ET'].filter(Boolean).join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  for (let i = 0; i < objects.length; i++) { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`; }
  const xref = pdf.length; pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`; for (let i = 1; i < offsets.length; i++) pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`; pdf += `trailer\n<< /Size ${objects.length + 1 } /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

export async function GET(request: Request) {
  try {
    const user = await requireUser(request); requirePermission(user, 'reports:read');
    const params = new URL(request.url).searchParams;
    const report = params.get('report') ?? 'headcount'; const range = params.get('range') ?? 'This month';
    const client = getSupabaseAdmin();
    const { data: employees, error } = await client.from('employees').select('full_name,employee_id,status,department_id,departments(name)').eq('organization_id', user.organization_id).order('full_name');
    if (error) throw error;
    const rows = (employees ?? []).map((employee: any) => ({ label: `${employee.full_name} (${employee.employee_id})`, value: `${employee.status} — ${Array.isArray(employee.departments) ? employee.departments[0]?.name ?? 'Unassigned' : employee.departments?.name ?? 'Unassigned'}` }));
    const body = buildPdf(`${report} report — ${range}`, rows);
    return new NextResponse(body, { headers: { 'content-type': 'application/pdf', 'content-disposition': `attachment; filename="${report}-${range.toLowerCase().replace(/\s+/g, '-')}.pdf"` } });
  } catch (error) { return apiError(error); }
}
