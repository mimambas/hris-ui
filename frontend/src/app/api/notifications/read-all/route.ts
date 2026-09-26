import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requireUser } from '@/lib/server/auth';
export async function POST(request: Request) { try { const user = await requireUser(request); const client = getSupabaseAdmin(); const { error } = await client.from('notifications').update({ read_at: new Date().toISOString() }).eq('organization_id', user.organization_id).eq('user_id', user.id).is('read_at', null); if (error) throw error; return NextResponse.json({ success: true }); } catch (error) { return apiError(error); } }
