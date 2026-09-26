import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requirePermission, requireUser } from '@/lib/server/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    requirePermission(user, 'leave:write');
    const body = await request.json().catch(() => ({}));
    const reason = String(body.reason ?? '').trim();
    if (!reason) return NextResponse.json({ detail: 'Rejection reason is required' }, { status: 422 });
    const { data, error } = await getSupabaseAdmin().from('leave_requests').update({ status: 'rejected', rejection_reason: reason, approved_by: user.id, approved_at: new Date().toISOString() }).eq('organization_id', user.organization_id).eq('id', params.id).eq('status', 'pending').select('id,status,rejection_reason').maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ detail: 'Leave request is not pending or was not found' }, { status: 409 });
    return NextResponse.json(data);
  } catch (error) {
    return apiError(error);
  }
}
