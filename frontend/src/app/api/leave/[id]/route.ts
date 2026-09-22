import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requireAdmin, requireUser } from '@/lib/server/auth';

const normalize = (row: any) => ({ ...row, employee_name: row.employee?.full_name ?? 'Unknown employee', employee_email: row.employee?.email ?? '', department: row.employee?.departments?.name ?? 'Unassigned' });

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireUser(request);
    const { data, error } = await getSupabaseAdmin().from('leave_requests').select('*, employee:employee_id(full_name,email,departments(name))').eq('id', params.id).maybeSingle();
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
    requireAdmin(user);
    const { data, error } = await getSupabaseAdmin().from('leave_requests').delete().eq('id', params.id).eq('status', 'rejected').select('id').maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ detail: 'Only rejected requests can be removed' }, { status: 409 });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
