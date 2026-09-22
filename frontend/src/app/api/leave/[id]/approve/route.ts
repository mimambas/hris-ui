import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requireAdmin, requireUser } from '@/lib/server/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    requireAdmin(user);
    const { data, error } = await getSupabaseAdmin().from('leave_requests').update({ status: 'approved', approved_by: user.id, approved_at: new Date().toISOString(), rejection_reason: null }).eq('id', params.id).eq('status', 'pending').select('id,status').maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ detail: 'Leave request is not pending or was not found' }, { status: 409 });
    return NextResponse.json(data);
  } catch (error) {
    return apiError(error);
  }
}
