import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requirePermission, requireUser } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    requirePermission(user, 'employee:write');
    const body = await request.json();
    const employeeIds = Array.isArray(body.employee_ids) ? body.employee_ids.filter(Boolean) : [];
    const subject = String(body.subject ?? '').trim();
    const message = String(body.body ?? '').trim();
    if (!employeeIds.length || employeeIds.length > 500) return NextResponse.json({ detail: 'Select between 1 and 500 recipients' }, { status: 422 });
    if (!subject || !message) return NextResponse.json({ detail: 'Subject and message are required' }, { status: 422 });

    const client = getSupabaseAdmin();
    const { data: employees, error } = await client
      .from('employees').select('id,email,full_name')
      .eq('organization_id', user.organization_id)
      .in('id', employeeIds)
      .eq('status', 'active');
    if (error) throw error;
    if (!employees?.length) return NextResponse.json({ detail: 'No active employees matched' }, { status: 404 });

    const missingEmail = employees.filter((row: any) => !row.email);
    if (missingEmail.length) return NextResponse.json({ detail: `${missingEmail.length} selected employee(s) have no email address`, employees: missingEmail.map((row: any) => row.full_name) }, { status: 422 });

    const rows = employees.map((row: any) => ({
      organization_id: user.organization_id,
      recipient_user_id: null,
      recipient_email: row.email,
      subject,
      body: message,
      created_by: user.id,
    }));
    const { data: queued, error: queueError } = await client.from('email_outbox').insert(rows).select('id,recipient_email,status');
    if (queueError) throw queueError;

    await client.from('audit_logs').insert({
      organization_id: user.organization_id, user_id: user.id, entity_type: 'email_outbox', action: 'create',
      new_value: JSON.stringify({ count: queued?.length ?? 0, subject }),
    });
    // Outbox is queued only: no provider is configured, so we deliberately do not
    // claim the messages were sent.
    return NextResponse.json({ queued: queued?.length ?? 0, status: 'queued', provider: 'none' }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    requirePermission(user, 'employee:write');
    const { data, error } = await getSupabaseAdmin()
      .from('email_outbox').select('id,recipient_email,subject,status,attempts,last_error,created_at')
      .eq('organization_id', user.organization_id).order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    return NextResponse.json({ items: data ?? [], provider: 'none' });
  } catch (error) { return apiError(error); }
}
