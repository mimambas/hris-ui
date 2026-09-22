import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requireUser } from '@/lib/server/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireUser(request);
    const { data, error } = await getSupabaseAdmin().from('leave_requests').update({ status: 'cancelled' }).eq('id', params.id).in('status', ['pending', 'approved']).select('id,status').maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ detail: 'Leave request cannot be cancelled or was not found' }, { status: 409 });
    return NextResponse.json(data);
  } catch (error) {
    return apiError(error);
  }
}
