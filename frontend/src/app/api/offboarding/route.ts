import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requirePermission, requireUser } from '@/lib/server/auth';

const TASKS = [
  ['asset-return', 'Asset return', 'IT team'],
  ['task-handover', 'Task handover', 'Manager'],
  ['access-revocation', 'Access revocation', 'IT team'],
  ['final-settlement', 'Final settlement', 'HR team'],
] as const;

function normalize(row: any) {
  const tasks = Array.isArray(row.tasks) ? row.tasks : [];
  const done = tasks.filter((task: any) => task.done).length;
  return {
    id: row.id,
    employee_id: row.employee_id,
    employee: row.employee?.full_name ?? 'Unknown employee',
    employee_code: row.employee?.employee_id ?? '',
    reason: row.reason,
    last_working_date: row.last_working_date,
    status: row.status,
    notes: row.notes,
    progress: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
    tasks: tasks.map((task: any) => ({ id: task.task_key, title: task.title, owner: task.owner, done: task.done })),
    created_at: row.created_at,
    completed_at: row.completed_at,
  };
}

async function fetchRecords(client: ReturnType<typeof getSupabaseAdmin>, organizationId: string, id?: string) {
  let query = client.from('offboarding_records').select('*, employee:employee_id(full_name,employee_id), tasks:offboarding_tasks(*)').eq('organization_id', organizationId);
  if (id) query = query.eq('id', id);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    requirePermission(user, 'offboarding:write');
    return NextResponse.json({ items: (await fetchRecords(getSupabaseAdmin(), user.organization_id)).map(normalize) });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    requirePermission(user, 'offboarding:write');
    const body = await request.json();
    const employeeId = String(body.employee_id ?? '').trim();
    const reason = String(body.reason ?? '').trim();
    const lastWorkingDate = String(body.last_working_date ?? '').trim();
    if (!employeeId || !reason || !/^\d{4}-\d{2}-\d{2}$/.test(lastWorkingDate)) {
      return NextResponse.json({ detail: 'Employee, reason, and last working date are required' }, { status: 422 });
    }
    const client = getSupabaseAdmin();
    const { data: employee, error: employeeError } = await client
      .from('employees').select('id').eq('organization_id', user.organization_id).eq('id', employeeId).eq('status', 'active').maybeSingle();
    if (employeeError) throw employeeError;
    if (!employee) return NextResponse.json({ detail: 'Active employee not found' }, { status: 404 });
    const { data: existing, error: existingError } = await client
      .from('offboarding_records').select('id').eq('organization_id', user.organization_id).eq('employee_id', employeeId).eq('status', 'active').maybeSingle();
    if (existingError) throw existingError;
    if (existing) return NextResponse.json({ detail: 'Employee already has an active offboarding' }, { status: 409 });

    const { data, error } = await client.from('offboarding_records').insert({
      organization_id: user.organization_id, employee_id: employeeId, reason,
      last_working_date: lastWorkingDate, notes: body.notes ? String(body.notes) : null, created_by: user.id,
    }).select('id').single();
    if (error) throw error;
    const { error: taskError } = await client.from('offboarding_tasks').insert(
      TASKS.map(([task_key, title, owner]) => ({ organization_id: user.organization_id, offboarding_id: data.id, task_key, title, owner }))
    );
    if (taskError) {
      await client.from('offboarding_records').delete().eq('id', data.id).eq('organization_id', user.organization_id);
      throw taskError;
    }
    await client.from('audit_logs').insert({ organization_id: user.organization_id, user_id: user.id, entity_type: 'offboarding', entity_id: data.id, action: 'create', new_value: reason });
    const record = (await fetchRecords(client, user.organization_id, data.id))[0];
    return NextResponse.json(normalize(record), { status: 201 });
  } catch (error) { return apiError(error); }
}
