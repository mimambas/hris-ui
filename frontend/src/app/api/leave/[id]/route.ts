import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requirePermission, requireUser } from '@/lib/server/auth';

const normalize = (row: any) => ({ ...row, employee_name: row.employee?.full_name ?? 'Unknown employee', employee_email: row.employee?.email ?? '', department: row.employee?.departments?.name ?? 'Unassigned' });

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    requirePermission(user, 'leave:read');
    const client = getSupabaseAdmin();
    let query = client.from('leave_requests').select('*, employee:employee_id(full_name,email,departments(name))').eq('organization_id', user.organization_id).eq('id', params.id);
    if (!['super_admin', 'hr_director', 'hr_manager', 'hr_officer'].includes(user.role)) {
      if (!user.employee_id) return NextResponse.json({ detail: 'Your user account is not linked to an employee record' }, { status: 422 });
      query = query.eq('employee_id', user.employee_id);
    }
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ detail: 'Leave request not found' }, { status: 404 });
    return NextResponse.json(normalize(data));
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    requirePermission(user, 'leave:write');
    const { data, error } = await getSupabaseAdmin().from('leave_requests').delete().eq('id', params.id).eq('status', 'rejected').select('id').maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ detail: 'Only rejected requests can be removed' }, { status: 409 });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
