import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requireUser } from '@/lib/server/auth';

const CATEGORIES = ['Travel & Transport', 'Client Entertainment', 'Software & Tools', 'Office Supplies', 'Meals & Entertainment', 'Training & Development'];

function normalize(row: any) {
  const employee = row.employee ?? {};
  const department = Array.isArray(employee.departments) ? employee.departments[0] : employee.departments;
  return { id: row.id, claim_number: row.claim_number, employee_id: row.employee_id, employee: employee.full_name ?? 'Unknown employee', initials: (employee.full_name ?? 'U').split(/\s+/).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase(), department: department?.name ?? 'Unassigned', category: row.category, amount: Number(row.amount), date: row.expense_date, description: row.description, receipt_attached: row.receipt_attached, status: row.status, submitted_date: row.submitted_at, reviewed_by: row.reviewer?.email ?? null, review_note: row.review_note ?? null };
}

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const elevated = ['super_admin', 'hr_director', 'hr_manager', 'hr_officer'].includes(user.role);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim(); const category = searchParams.get('category'); const status = searchParams.get('status');
    const page = Math.max(1, Number(searchParams.get('page') || 1)); const perPage = Math.min(100, Math.max(1, Number(searchParams.get('per_page') || 100)));
    const client = getSupabaseAdmin(); let query = client.from('expense_claims').select('*, employee:employee_id(full_name,departments(name)), reviewer:reviewed_by(email)', { count: 'exact' });
    if (!elevated) { if (!user.employee_id) return NextResponse.json({ detail: 'Your user account is not linked to an employee record' }, { status: 422 }); query = query.eq('employee_id', user.employee_id); }
    if (search) query = query.or(`claim_number.ilike.%${search}%,description.ilike.%${search}%`);
    if (category && category !== 'All') query = query.eq('category', category);
    if (status && status !== 'all') query = query.eq('status', status);
    const from = (page - 1) * perPage; const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, from + perPage - 1);
    if (error) throw error; const total = count ?? 0;
    return NextResponse.json({ items: (data ?? []).map(normalize), total, page, per_page: perPage, total_pages: Math.max(1, Math.ceil(total / perPage)) });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request); const body = await request.json();
    const elevated = ['super_admin', 'hr_director', 'hr_manager', 'hr_officer'].includes(user.role);
    const employeeId = elevated ? String(body.employee_id ?? '').trim() : user.employee_id ?? ''; const category = String(body.category ?? '').trim(); const description = String(body.description ?? '').trim(); const date = String(body.date ?? '').trim(); const amount = Number(body.amount ?? 0);
    if (!category || !CATEGORIES.includes(category) || !description || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(amount) || amount <= 0) return NextResponse.json({ detail: 'Category, positive amount, description, and valid date are required' }, { status: 422 });
    const client = getSupabaseAdmin();
    let resolvedEmployeeId = employeeId;
    if (!resolvedEmployeeId) {
      const { data: account, error: accountError } = await client.from('users').select('employee_id').eq('id', user.id).maybeSingle();
      if (accountError) throw accountError;
      resolvedEmployeeId = account?.employee_id ?? '';
    }
    if (!resolvedEmployeeId) return NextResponse.json({ detail: 'Your user account is not linked to an employee record' }, { status: 422 });
    const { data: employee, error: employeeError } = await client.from('employees').select('id').eq('id', resolvedEmployeeId).eq('status', 'active').maybeSingle();
    if (employeeError) throw employeeError; if (!employee) return NextResponse.json({ detail: 'Active employee not found' }, { status: 404 });
    const { data: latest } = await client.from('expense_claims').select('claim_number').like('claim_number', 'EXP-%').order('created_at', { ascending: false }).limit(1).maybeSingle(); const sequence = Number(String(latest?.claim_number ?? '').match(/(\d+)$/)?.[1] ?? 0) + 1;
    const claimNumber = `EXP-${String(sequence).padStart(4, '0')}`;
    const { data, error } = await client.from('expense_claims').insert({ claim_number: claimNumber, employee_id: resolvedEmployeeId, category, amount, expense_date: date, description, receipt_attached: Boolean(body.receipt_attached) }).select('*, employee:employee_id(full_name,departments(name)), reviewer:reviewed_by(email)').single();
    if (error) throw error;
    await client.from('audit_logs').insert({ user_id: user.id, entity_type: 'expense_claim', entity_id: data.id, action: 'create', new_value: JSON.stringify({ claim_number: claimNumber, amount }) });
    return NextResponse.json(normalize(data), { status: 201 });
  } catch (error) { return apiError(error); }
}
