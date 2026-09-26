import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requirePermission, requireUser } from '@/lib/server/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request); requirePermission(user, 'payroll:write');
    const client = getSupabaseAdmin();
    const { data: period, error } = await client.from('payroll_periods').select('status').eq('organization_id', user.organization_id).eq('id', params.id).maybeSingle();
    if (error) throw error;
    if (!period) return NextResponse.json({ detail: 'Payroll period not found' }, { status: 404 });
    const nextStatus = period.status === 'locked' ? 'processed' : 'locked';
    const { data, error: updateError } = await client.from('payroll_periods').update({ status: nextStatus, locked_at: nextStatus === 'locked' ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq('organization_id', user.organization_id).eq('id', params.id).select('*').single();
    if (updateError) throw updateError;
    return NextResponse.json(data);
  } catch (error) { return apiError(error); }
}
