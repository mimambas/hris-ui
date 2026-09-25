import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requirePermission, requireUser } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

const MAX_SETTINGS_BYTES = 64_000;

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    requirePermission(user, 'organization:read');
    const client = getSupabaseAdmin();
    const { data, error } = await client.from('organization_settings').select('settings,updated_at').eq('organization_id', user.organization_id).maybeSingle();
    if (error) throw error;
    return NextResponse.json({ settings: data?.settings ?? {}, updated_at: data?.updated_at ?? null });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser(request);
    requirePermission(user, 'organization:write');
    const body = await request.json();
    const settings = body.settings;
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      return NextResponse.json({ detail: 'settings object is required' }, { status: 422 });
    }
    if (JSON.stringify(settings).length > MAX_SETTINGS_BYTES) {
      return NextResponse.json({ detail: 'Settings payload is too large' }, { status: 422 });
    }
    const client = getSupabaseAdmin();
    const { data, error } = await client
      .from('organization_settings')
      .upsert(
        { organization_id: user.organization_id, settings, updated_by: user.id, updated_at: new Date().toISOString() },
        { onConflict: 'organization_id' },
      )
      .select('settings,updated_at')
      .single();
    if (error) throw error;
    await client.from('audit_logs').insert({ organization_id: user.organization_id, user_id: user.id, entity_type: 'organization_settings', entity_id: user.organization_id, action: 'update', new_value: JSON.stringify(settings) });
    return NextResponse.json({ settings: data.settings, updated_at: data.updated_at });
  } catch (error) {
    return apiError(error);
  }
}
