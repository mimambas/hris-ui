import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requirePermission, requireUser } from '@/lib/server/auth';

const STATUSES = ['pending', 'in-progress', 'completed'] as const;

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    requirePermission(user, 'onboarding:write');
    const body = await request.json();
    const status = String(body.status ?? '');
    if (!STATUSES.includes(status as any)) return NextResponse.json({ detail: 'Invalid status' }, { status: 422 });
    const { data, error } = await getSupabaseAdmin()
      .from('checklist_templates')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('organization_id', user.organization_id)
      .eq('id', params.id)
      .select('id,name,category,assignee,due_date,priority,status')
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ detail: 'Task not found' }, { status: 404 });
    await getSupabaseAdmin().from('audit_logs').insert({ organization_id: user.organization_id, user_id: user.id, entity_type: 'checklist_task', entity_id: params.id, action: 'update', new_value: status });
    return NextResponse.json({ id: data.id, title: data.name, category: data.category, assignee: data.assignee, employee: data.assignee, dueDate: data.due_date, priority: data.priority, status: data.status });
  } catch (error) { return apiError(error); }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    requirePermission(user, 'onboarding:write');
    const { data, error } = await getSupabaseAdmin()
      .from('checklist_templates')
      .delete()
      .eq('organization_id', user.organization_id)
      .eq('id', params.id)
      .select('id')
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ detail: 'Task not found' }, { status: 404 });
    await getSupabaseAdmin().from('audit_logs').insert({ organization_id: user.organization_id, user_id: user.id, entity_type: 'checklist_task', entity_id: params.id, action: 'delete' });
    return NextResponse.json({ id: params.id });
  } catch (error) { return apiError(error); }
}
