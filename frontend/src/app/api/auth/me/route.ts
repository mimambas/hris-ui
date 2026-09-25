import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requireUser } from '@/lib/server/auth';

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const { data, error } = await getSupabaseAdmin()
      .from('users')
      .select('id,email,role,is_active,employee_id,organization_id,created_at')
      .eq('id', user.id)
      .maybeSingle();
    if (error || !data || !data.is_active) return NextResponse.json({ detail: 'User not found' }, { status: 401 });
    return NextResponse.json(data);
  } catch (error) {
    return apiError(error);
  }
}
