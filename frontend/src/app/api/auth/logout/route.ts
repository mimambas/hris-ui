import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { apiError, getSupabaseAdmin, requireUser } from '@/lib/server/auth';

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) throw new Error('UNAUTHORIZED');
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const { payload } = await jwtVerify(token!, new TextEncoder().encode(secret));
    if (typeof payload.jti === 'string') {
      const { error } = await getSupabaseAdmin()
        .from('user_sessions')
        .update({ revoked_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('token_id', payload.jti)
        .is('revoked_at', null);
      if (error) throw error;
    }
    return NextResponse.json({ revoked: true });
  } catch (error) { return apiError(error); }
}
