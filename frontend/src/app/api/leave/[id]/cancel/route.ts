import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requireUser } from '@/lib/server/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    const client = getSupabaseAdmin();
    let query = client.from('leave_requests').update({ status: 'cancelled' }).eq('id', params.id).in('status', ['pending', 'approved']);
    if (!['super_admin', 'hr_director', 'hr_manager', 'hr_officer'].includes(user.role)) {
      if (!user.employee_id) return NextResponse.json({ detail: 'Your user account is not linked to an employee record' }, { status: 422 });
      query = query.eq('employee_id', user.employee_id);
    }
    const { data, error } = await query.select('id,status').maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ detail: 'Leave request cannot be cancelled or was not found' }, { status: 409 });
    return NextResponse.json(data);
  } catch (error) {
    return apiError(error);
  }
}
