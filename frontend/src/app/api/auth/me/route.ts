import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    if (payload.type !== 'access' || payload.exp * 1000 < Date.now()) throw new Error('Expired token');
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase environment variables are not configured');
    const { data, error } = await createClient(url, key, { auth: { persistSession: false } })
      .from('users').select('id,email,role,is_active,employee_id,created_at').eq('id', payload.sub).maybeSingle();
    if (error || !data || !data.is_active) return NextResponse.json({ detail: 'User not found' }, { status: 401 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ detail: 'Invalid token' }, { status: 401 });
  }
}
