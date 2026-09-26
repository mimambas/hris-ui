import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requireUser } from '@/lib/server/auth';
export async function DELETE(request: Request) { try { const user = await requireUser(request); const client = getSupabaseAdmin(); const { error } = await client.from('notifications').delete().eq('organization_id', user.organization_id).eq('user_id', user.id); if (error) throw error; return NextResponse.json({ success: true }); } catch (error) { return apiError(error); } }
