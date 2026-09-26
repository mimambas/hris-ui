import { NextResponse } from 'next/server';
import { apiError, getSupabaseAdmin, requirePermission, requireUser } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

type Range = 'This month' | 'Last month' | 'This quarter' | 'This year';

function rangeBounds(range: string): { from: string; to: string } {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  switch (range) {
    case 'Last month': return { from: fmt(lastMonthStart), to: fmt(lastMonthEnd) };
    case 'This quarter': return { from: fmt(quarterStart), to: fmt(now) };
    case 'This year': return { from: fmt(yearStart), to: fmt(now) };
    default: return { from: fmt(monthStart), to: fmt(now) };
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    requirePermission(user, 'reports:read');
    const range = (new URL(request.url).searchParams.get('range') ?? 'This month') as Range;
    const { from, to } = rangeBounds(range);
    const client = getSupabaseAdmin();
    const org = user.organization_id;

    const trendFrom = (() => { const d = new Date(); d.setMonth(d.getMonth() - 5); return d.toISOString().slice(0, 10); })();
    const [employeesRes, attendanceRes, leaveRes, payrollRes, periodsRes, trendAttRes] = await Promise.all([
      client.from('employees').select('department_id, status, departments(name)').eq('organization_id', org),
      client.from('attendance_records').select('status').eq('organization_id', org).gte('date', from).lte('date', to),
      client.from('leave_requests').select('leave_type, status').eq('organization_id', org).gte('start_date', from).lte('start_date', to),
      client.from('payroll_entries').select('gross_salary, net_salary, pph21, bpjs_kes, bpjs_tk, status').eq('organization_id', org),
      client.from('payroll_periods').select('id,name,period_start,status').eq('organization_id', org).gte('period_start', trendFrom).order('period_start'),
      client.from('attendance_records').select('date,status').eq('organization_id', org).gte('date', trendFrom),
    ]);
    const err = [employeesRes, attendanceRes, leaveRes, payrollRes, periodsRes, trendAttRes].find((r) => r.error)?.error;
    if (err) throw err;

    const employees = employeesRes.data ?? [];
    const byDept = new Map<string, number>();
    for (const row of employees) {
      const name = Array.isArray(row.departments) ? row.departments[0]?.name : (row.departments as any)?.name;
      const key = name ?? 'Unassigned';
      byDept.set(key, (byDept.get(key) ?? 0) + 1);
    }
    const headcount_by_department = Array.from(byDept.entries())
      .map(([dept, count]) => ({ dept, count }))
      .sort((a, b) => b.count - a.count);

    const attendance = attendanceRes.data ?? [];
    const attendance_summary = ['present', 'late', 'absent', 'leave', 'wfh', 'half-day'].map((status) => ({
      status, count: attendance.filter((row) => row.status === status).length,
    }));

    const leave = leaveRes.data ?? [];
    const leave_by_type = ['annual', 'sick', 'personal', 'maternity', 'unpaid'].map((type) => ({
      type, count: leave.filter((row) => row.leave_type === type).length,
    }));

    const payroll = (payrollRes.data ?? []).filter((row) => ['processed', 'paid', 'locked'].includes(row.status));
    const payroll_summary = {
      entries: payroll.length,
      gross: payroll.reduce((sum, row) => sum + Number(row.gross_salary ?? 0), 0),
      net: payroll.reduce((sum, row) => sum + Number(row.net_salary ?? 0), 0),
      tax: payroll.reduce((sum, row) => sum + Number(row.pph21 ?? 0), 0),
      bpjs: payroll.reduce((sum, row) => sum + Number(row.bpjs_kes ?? 0) + Number(row.bpjs_tk ?? 0), 0),
    };

    const active = employees.filter((row) => row.status === 'active').length;
    const leaveApproved = leave.filter((row) => row.status === 'approved').length;
    const present = attendance.filter((row) => ['present', 'wfh'].includes(row.status)).length;

    const periodIds = (periodsRes.data ?? []).map((period) => period.id);
    let periodEntries: any[] = [];
    if (periodIds.length) {
      const { data, error: entriesError } = await client.from('payroll_entries').select('period_id,gross_salary,net_salary,pph21').eq('organization_id', org).in('period_id', periodIds);
      if (entriesError) throw entriesError;
      periodEntries = data ?? [];
    }
    const payroll_trend = (periodsRes.data ?? []).map((period) => {
      const rows = periodEntries.filter((entry) => entry.period_id === period.id);
      return { month: period.name, gross: Math.round(rows.reduce((sum, row) => sum + Number(row.gross_salary ?? 0), 0) / 1e6), net: Math.round(rows.reduce((sum, row) => sum + Number(row.net_salary ?? 0), 0) / 1e6), tax: Math.round(rows.reduce((sum, row) => sum + Number(row.pph21 ?? 0), 0) / 1e6) };
    });
    const monthMap = new Map<string, number[]>();
    for (const row of trendAttRes.data ?? []) {
      const key = String(row.date).slice(0, 7);
      const bucket = monthMap.get(key) ?? [];
      bucket.push(row.status === 'present' || row.status === 'wfh' ? 1 : row.status === 'late' ? 2 : 3);
      monthMap.set(key, bucket);
    }
    const attendance_trend = Array.from(monthMap.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([month, values]) => {
      const present = values.filter((v) => v === 1).length; const late = values.filter((v) => v === 2).length; const absent = values.filter((v) => v === 3).length; const total = values.length || 1;
      return { month: month.slice(5), present: Math.round((present / total) * 1000) / 10, late: Math.round((late / total) * 1000) / 10, absent: Math.round((absent / total) * 1000) / 10 };
    });

    return NextResponse.json({
      range,
      generated_at: new Date().toISOString(),
      kpis: {
        total_headcount: employees.length,
        active_headcount: active,
        department_count: headcount_by_department.length,
        leave_requests: leave.length,
        leave_approved: leaveApproved,
        attendance_records: attendance.length,
        attendance_present: present,
        attendance_rate: attendance.length ? Math.round((present / attendance.length) * 1000) / 10 : 0,
      },
      headcount_by_department,
      attendance_summary,
      payroll_trend,
      attendance_trend,
      leave_by_type,
      payroll_summary,
      rows: [
        ...headcount_by_department.map((row) => ({ category: 'Department', label: row.dept, value: row.count })),
        ...attendance_summary.map((row) => ({ category: 'Attendance', label: row.status, value: row.count })),
        ...leave_by_type.map((row) => ({ category: 'Leave', label: row.type, value: row.count })),
        { category: 'Payroll', label: 'gross', value: payroll_summary.gross },
        { category: 'Payroll', label: 'net', value: payroll_summary.net },
        { category: 'Payroll', label: 'tax', value: payroll_summary.tax },
      ],
    });
  } catch (error) {
    return apiError(error);
  }
}
