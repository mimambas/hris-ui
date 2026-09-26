import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requirePermission, requireUser } from '@/lib/server/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    requirePermission(user, 'leave:write');
    const { data, error } = await getSupabaseAdmin().rpc('leave_approve_atomic', { p_organization_id: user.organization_id, p_leave_id: params.id, p_approver_id: user.id });
    if (error) return NextResponse.json({ detail: error.message }, { status: error.message?.includes('not pending') ? 409 : 422 });
    return NextResponse.json(data);
  } catch (error) {
    return apiError(error);
  }
}
