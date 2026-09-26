import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requirePermission, requireUser } from '@/lib/server/auth';

const MAX_ATTEMPTS = 3;
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request); requirePermission(user, 'notifications:write');
    const client = getSupabaseAdmin();
    const current = await client.from('notification_deliveries').select('id,status,attempts,channel').eq('organization_id', user.organization_id).eq('id', params.id).maybeSingle();
    if (current.error) throw current.error;
    if (!current.data) return NextResponse.json({ detail: 'Delivery not found' }, { status: 404 });
    if (current.data.status === 'delivered') return NextResponse.json({ detail: 'Delivery already completed' }, { status: 409 });
    const attempts = Number(current.data.attempts ?? 0) + 1;
    const terminal = attempts >= MAX_ATTEMPTS;
    const status = current.data.channel === 'in_app' ? 'delivered' : terminal ? 'failed' : 'pending';
    const { data, error } = await client.from('notification_deliveries').update({ attempts, status, last_error: status === 'failed' ? 'No external delivery provider configured' : null, delivered_at: status === 'delivered' ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq('organization_id', user.organization_id).eq('id', params.id).select('id,channel,status,attempts,last_error,delivered_at').single();
    if (error) throw error;
    await client.from('audit_logs').insert({ organization_id: user.organization_id, user_id: user.id, entity_type: 'notification_delivery', entity_id: params.id, action: 'retry', new_value: JSON.stringify({ attempts, status }) });
    return NextResponse.json(data);
  } catch (error) { return apiError(error); }
}
