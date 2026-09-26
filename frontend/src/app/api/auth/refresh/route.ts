import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify, SignJWT } from 'jose';

export async function POST(request: Request) {
  try {
    const { refresh_token: refreshToken } = await request.json();
    const secretValue = process.env.JWT_SECRET_KEY;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secretValue || !url || !key) throw new Error('Authentication environment is not configured');
    const { payload } = await jwtVerify(refreshToken, new TextEncoder().encode(secretValue));
    if (payload.type !== 'refresh' || typeof payload.sub !== 'string') throw new Error('Invalid refresh token');
    const client = createClient(url, key, { auth: { persistSession: false } });
    const { data: user } = await client.from('users').select('id,role,is_active,organization_id').eq('id', payload.sub).maybeSingle();
    if (!user?.is_active || !user.organization_id) return NextResponse.json({ detail: 'User not found' }, { status: 401 });
    // Reuse the original session row so a refresh rotates token identifiers
    // without creating an unrevocable second session.
    const existing = typeof payload.jti === 'string'
      ? await client.from('user_sessions').select('id,refresh_token_id,revoked_at').eq('user_id', user.id).eq('refresh_token_id', payload.jti).maybeSingle()
      : { data: null, error: null };
    if (existing.error) throw existing.error;
    if (existing.data?.revoked_at) return NextResponse.json({ detail: 'Session revoked' }, { status: 401 });
    const sessionId = existing.data?.id;
    const accessJti = crypto.randomUUID();
    const access = await new SignJWT({ sub: user.id, role: user.role, organization_id: user.organization_id, type: 'access', jti: accessJti }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('15m').sign(new TextEncoder().encode(secretValue));
    const refresh = await new SignJWT({ sub: user.id, type: 'refresh', jti: typeof payload.jti === 'string' ? payload.jti : crypto.randomUUID() }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(new TextEncoder().encode(secretValue));
    if (sessionId) await client.from('user_sessions').update({ token_id: accessJti, revoked_at: null, expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() }).eq('id', sessionId);
    return NextResponse.json({ access_token: access, refresh_token: refresh, token_type: 'bearer' });
  } catch {
    return NextResponse.json({ detail: 'Invalid refresh token' }, { status: 401 });
  }
}
