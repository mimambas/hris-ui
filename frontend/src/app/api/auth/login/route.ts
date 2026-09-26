import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { checkRateLimit } from '@/lib/server/rate-limit';

function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase environment variables are not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function secret() {
  const value = process.env.JWT_SECRET_KEY;
  if (!value) throw new Error('JWT_SECRET_KEY is not configured');
  return new TextEncoder().encode(value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    if (!email || !password) return NextResponse.json({ detail: 'Email and password are required' }, { status: 422 });
    const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const rateKey = `${forwarded || 'unknown'}:${email}`;
    if (!checkRateLimit(rateKey)) return NextResponse.json({ detail: 'Too many login attempts. Try again later.' }, { status: 429 });

    const { data: user, error } = await supabase()
      .from('users')
      .select('id,email,password_hash,role,is_active,organization_id')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    if (!user || !user.is_active || !user.organization_id || !(await bcrypt.compare(password, user.password_hash))) {
      return NextResponse.json({ detail: 'Invalid credentials' }, { status: 401 });
    }

    const accessToken = await new SignJWT({ sub: user.id, role: user.role, organization_id: user.organization_id, type: 'access' })
      .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('15m').sign(secret());
    const refreshToken = await new SignJWT({ sub: user.id, type: 'refresh' })
      .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(secret());
    await supabase().from('users').update({ last_login: new Date().toISOString() }).eq('id', user.id);
    return NextResponse.json({ access_token: accessToken, refresh_token: refreshToken, token_type: 'bearer' });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ detail: 'Authentication service is unavailable' }, { status: 503 });
  }
}
