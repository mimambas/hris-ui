import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requirePermission, requireUser } from '@/lib/server/auth';

function normalize(row: any) {
  return { ...row, parent: row.parent?.name ?? '—', head: 'Unassigned', head_email: '' };
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    const { data, error } = await getSupabaseAdmin().from('departments').select('*, parent:parent_id(name)').eq('organization_id', user.organization_id).eq('id', params.id).maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ detail: 'Department not found' }, { status: 404 });
    return NextResponse.json(normalize(data));
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    requirePermission(user, 'organization:write');
    const body = await request.json();
    const allowed = ['name', 'code', 'parent_id', 'head_id', 'cost_center'];
    const update = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
    if (typeof update.name === 'string') update.name = update.name.trim();
    if (typeof update.code === 'string') update.code = update.code.trim().toUpperCase();
    const { data, error } = await getSupabaseAdmin().from('departments').update(update).eq('id', params.id).eq('organization_id', user.organization_id).select('*, parent:parent_id(name)').maybeSingle();
    if (error) {
      if (error.code === '23505') return NextResponse.json({ detail: 'Department code already exists' }, { status: 409 });
      throw error;
    }
    if (!data) return NextResponse.json({ detail: 'Department not found' }, { status: 404 });
    return NextResponse.json(normalize(data));
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    requirePermission(user, 'organization:write');
    const client = getSupabaseAdmin();
    const { count, error: countError } = await client.from('employees').select('id', { count: 'exact', head: true }).eq('organization_id', user.organization_id).eq('department_id', params.id);
    if (countError) throw countError;
    if ((count ?? 0) > 0) return NextResponse.json({ detail: 'Cannot delete a department that still has employees' }, { status: 409 });
    const { data, error } = await client.from('departments').delete().eq('id', params.id).eq('organization_id', user.organization_id).select('id').maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ detail: 'Department not found' }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
