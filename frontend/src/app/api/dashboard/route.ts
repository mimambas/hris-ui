import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { apiError, getSupabaseAdmin, requireUser } from '@/lib/server/auth';

const RANGES = ['This month', 'Last quarter', 'This year'] as const;

export async function GET(request: Request) {
  try {
    await requireUser(request);
    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get('range') ?? 'This month';
    const range = (RANGES as readonly string[]).includes(rangeParam) ? rangeParam : 'This month';

    const client = getSupabaseAdmin();
    const [{ count: totalCount, error: totalError }, { count: activeCount, error: activeError }, { count: pendingLeave, error: pendingError }] = await Promise.all([
      client.from('employees').select('id', { count: 'exact', head: true }),
      client.from('employees').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      client.from('leave_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);
    if (totalError) throw totalError;
    if (activeError) throw activeError;
    if (pendingError) throw pendingError;

    const [{ data: byDepartment, error: departmentError }, { data: joins, error: joinsError }] = await Promise.all([
      client.from('employees').select('department_id, departments(name)').eq('status', 'active'),
      client.from('employees').select('join_date').gte('join_date', '1970-01-01'),
    ]);
    if (departmentError) throw departmentError;
    if (joinsError) throw joinsError;

    const headcountByDepartment = new Map<string, number>();
    for (const row of byDepartment ?? []) {
      const relation: any = row.departments;
      const name = (Array.isArray(relation) ? relation[0]?.name : relation?.name) ?? 'Unassigned';
      headcountByDepartment.set(name, (headcountByDepartment.get(name) ?? 0) + 1);
    }
    const departmentHeadcount = [...headcountByDepartment.entries()]
      .map(([dept, count]) => ({ dept, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const now = new Date();
    const monthsBack = range === 'This month' ? 6 : range === 'Last quarter' ? 3 : 12;
    const buckets: { key: string; label: string; count: number }[] = [];
    for (let index = monthsBack - 1; index >= 0; index -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
      buckets.push({ key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`, label: date.toLocaleString('en-US', { month: 'short' }), count: 0 });
    }
    const bucketIndex = new Map(buckets.map((bucket, index) => [bucket.key, index]));
    for (const row of joins ?? []) {
      if (!row.join_date) continue;
      const key = String(row.join_date).slice(0, 7);
      const index = bucketIndex.get(key);
      if (index === undefined) continue;
      buckets[index].count += 1;
    }
    let running = 0;
    const headcountTrend = buckets.map((bucket) => {
      running += bucket.count;
      return { month: bucket.label, count: running };
    });
    if (headcountTrend.length > 0) {
      const earliest = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
      headcountTrend[0] = { month: headcountTrend[0].month, count: running - earliest + buckets[0].count };
    }

    return NextResponse.json({
      total_employees: totalCount ?? 0,
      active_employees: activeCount ?? 0,
      pending_leave: pendingLeave ?? 0,
      department_headcount: departmentHeadcount,
      headcount_trend: headcountTrend,
    });
  } catch (error) {
    return apiError(error);
  }
}