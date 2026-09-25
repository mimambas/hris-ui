import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requireAdmin, requireUser } from '@/lib/server/auth';

const STATUSES = ['pending', 'in-progress', 'completed'] as const;
const PRIORITIES = ['Low', 'Medium', 'High'] as const;

function normalize(row: any) {
  return { id: row.id, title: row.name, category: row.category, assignee: row.assignee, employee: row.assignee, dueDate: row.due_date, priority: row.priority, status: row.status };
}

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    requireAdmin(user);
    const { data, error } = await getSupabaseAdmin()
      .from('checklist_templates')
      .select('id,name,category,assignee,due_date,priority,status')
      .eq('organization_id', user.organization_id)
      .order('due_date');
    if (error) throw error;
    return NextResponse.json({ items: (data ?? []).map(normalize) });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    requireAdmin(user);
    const body = await request.json();
    const name = String(body.name ?? '').trim();
    const category = String(body.category ?? '').trim();
    const assignee = String(body.assignee ?? 'New hire').trim();
    const dueDate = String(body.due_date ?? '').trim();
    const priority = String(body.priority ?? 'Medium');
    if (!name || !category || !dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return NextResponse.json({ detail: 'Name, category, and due date are required' }, { status: 422 });
    if (!PRIORITIES.includes(priority as any)) return NextResponse.json({ detail: 'Invalid priority' }, { status: 422 });
    const { data, error } = await getSupabaseAdmin()
      .from('checklist_templates')
      .insert({ organization_id: user.organization_id, name, category, assignee, due_date: dueDate, priority })
      .select('id,name,category,assignee,due_date,priority,status')
      .single();
    if (error) throw error;
    await getSupabaseAdmin().from('audit_logs').insert({ organization_id: user.organization_id, user_id: user.id, entity_type: 'checklist_task', entity_id: data.id, action: 'create', new_value: name });
    return NextResponse.json(normalize(data), { status: 201 });
  } catch (error) { return apiError(error); }
}
