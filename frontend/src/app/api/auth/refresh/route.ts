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
    const access = await new SignJWT({ sub: user.id, role: user.role, organization_id: user.organization_id, type: 'access' }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('15m').sign(new TextEncoder().encode(secretValue));
    const refresh = await new SignJWT({ sub: user.id, type: 'refresh' }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(new TextEncoder().encode(secretValue));
    return NextResponse.json({ access_token: access, refresh_token: refresh, token_type: 'bearer' });
  } catch {
    return NextResponse.json({ detail: 'Invalid refresh token' }, { status: 401 });
  }
}
