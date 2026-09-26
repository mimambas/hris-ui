import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requireAdmin, requireUser } from '@/lib/server/auth';

async function load(client: ReturnType<typeof getSupabaseAdmin>, organizationId: string, id: string) {
  const { data, error } = await client
    .from('offboarding_records')
    .select('id,status,employee_id,employee:employee_id(full_name,employee_id),tasks:offboarding_tasks(*)')
    .eq('organization_id', organizationId).eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

function normalize(row: any) {
  const tasks = Array.isArray(row.tasks) ? row.tasks : [];
  const done = tasks.filter((task: any) => task.done).length;
  return {
    id: row.id, employee_id: row.employee_id, employee: row.employee?.full_name ?? 'Unknown employee',
    employee_code: row.employee?.employee_id ?? '', status: row.status,
    progress: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
    tasks: tasks.map((task: any) => ({ id: task.task_key, title: task.title, owner: task.owner, done: task.done })),
  };
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    requireAdmin(user);
    const body = await request.json();
    const client = getSupabaseAdmin();

    if (typeof body.task_key === 'string') {
      const record = await load(client, user.organization_id, params.id);
      if (!record || record.status !== 'active') return NextResponse.json({ detail: 'Active offboarding record not found' }, { status: 404 });
      const done = typeof body.done === 'boolean' ? body.done : true;
      const { data, error } = await client
        .from('offboarding_tasks')
        .update({ done, completed_at: done ? new Date().toISOString() : null, updated_at: new Date().toISOString() })
        .eq('organization_id', user.organization_id).eq('offboarding_id', params.id).eq('task_key', body.task_key)
        .select('id').maybeSingle();
      if (error) throw error;
      if (!data) return NextResponse.json({ detail: 'Clearance task not found' }, { status: 404 });
      const refreshed = await load(client, user.organization_id, params.id);
      return NextResponse.json(normalize(refreshed));
    }

    const action = String(body.action ?? '');
    if (action !== 'complete') return NextResponse.json({ detail: 'Unsupported action' }, { status: 422 });
    const record = await load(client, user.organization_id, params.id);
    if (!record) return NextResponse.json({ detail: 'Offboarding record not found' }, { status: 404 });
    const tasks = Array.isArray(record.tasks) ? record.tasks : [];
    if (!tasks.length || tasks.some((task: any) => !task.done)) {
      return NextResponse.json({ detail: 'Complete all clearance tasks before completing offboarding' }, { status: 409 });
    }
    const { data, error } = await client
      .from('offboarding_records')
      .update({ status: 'completed', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('organization_id', user.organization_id).eq('id', params.id).eq('status', 'active')
      .select('id,status').maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ detail: 'Offboarding status changed; try again' }, { status: 409 });
    const { error: employeeError } = await client
      .from('employees')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('organization_id', user.organization_id).eq('id', record.employee_id);
    if (employeeError) throw employeeError;
    await client.from('audit_logs').insert({ organization_id: user.organization_id, user_id: user.id, entity_type: 'offboarding', entity_id: params.id, action: 'complete' });
    return NextResponse.json(normalize(await load(client, user.organization_id, params.id)));
  } catch (error) { return apiError(error); }
}
