import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

/** Lightweight readiness probe: verifies both runtime env and database connectivity. */
export async function GET() {
  const started = Date.now();
  try {
    const { error } = await getSupabaseAdmin().from('organizations').select('id', { head: true, count: 'exact' }).limit(1);
    if (error) throw error;
    return NextResponse.json({ status: 'ok', latency_ms: Date.now() - started, time: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ status: 'degraded', detail: error instanceof Error ? error.message : 'unknown' }, { status: 503 });
  }
}
