'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Users, Clock, CalendarDays, TrendingUp, TrendingDown, ArrowUpRight, Wallet, FileText, X, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

type Range = 'This month' | 'Last quarter' | 'This year';
type Drilldown = { title: string; description: string; href: string } | null;
type DashboardData = {
  total_employees: number;
  active_employees: number;
  pending_leave: number;
  department_headcount: { dept: string; count: number }[];
  headcount_trend: { month: string; count: number }[];
};
type Kpi = { label: string; value: string; change: string; trend: 'up' | 'down'; icon: typeof Users; color: string; detail: string; href: string };

const EMPTY_DATA: DashboardData = { total_employees: 0, active_employees: 0, pending_leave: 0, department_headcount: [], headcount_trend: [] };
const tooltipStyle = { fontSize: 12, borderRadius: 12, border: '1px solid var(--hairline)', backgroundColor: 'var(--canvas)', color: 'var(--ink)' };

function DrilldownModal({ item, onClose }: { item: Exclude<Drilldown, null>; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="dashboard-drilldown-title">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-canvas border border-hairline shadow-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div><div className="w-10 h-10 rounded-lg bg-primary-surface flex items-center justify-center mb-3"><BarChart3 size={18} className="text-primary" /></div><h2 id="dashboard-drilldown-title" className="text-base font-bold text-ink">{item.title}</h2><p className="text-sm text-body mt-2 leading-relaxed">{item.description}</p></div>
          <button onClick={onClose} aria-label="Close details" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button>
        </div>
        <Link href={item.href} onClick={onClose} className="btn-cta w-full mt-6 text-sm justify-center">Open detailed view <ArrowUpRight size={14} /></Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [range, setRange] = useState<Range>('This month');
  const [dashboard, setDashboard] = useState<DashboardData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drilldown, setDrilldown] = useState<Drilldown>(null);
  const { toast } = useToast();

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get<DashboardData>('/dashboard', { params: { range } });
      setDashboard(response.data);
    } catch (requestError: any) {
      setError(requestError.response?.data?.detail || 'Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadDashboard(); }, [range]);

  const kpis: Kpi[] = [
    { label: 'Total Employees', value: String(dashboard.total_employees), change: 'Live', trend: 'up', icon: Users, color: 'bg-primary-surface text-primary', detail: `${dashboard.active_employees} active employees`, href: '/employees' },
    { label: 'Active Employees', value: String(dashboard.active_employees), change: dashboard.total_employees ? `${Math.round((dashboard.active_employees / dashboard.total_employees) * 100)}%` : '0%', trend: 'up', icon: Clock, color: 'bg-cta-surface text-cta', detail: 'Current workforce', href: '/employees' },
    { label: 'Pending Leave', value: String(dashboard.pending_leave), change: 'Live', trend: 'down', icon: CalendarDays, color: 'bg-amber-50 text-accent-yellow', detail: 'Awaiting approval', href: '/leave' },
    { label: 'Turnover Rate', value: '—', change: 'N/A', trend: 'down', icon: TrendingDown, color: 'bg-red-50 text-semantic-down', detail: 'Requires historical data', href: '/reports' },
  ];

  const trend = dashboard.headcount_trend.length ? dashboard.headcount_trend : [{ month: 'No data', count: 0 }];
  const departments = dashboard.department_headcount.length ? dashboard.department_headcount : [{ dept: 'No data', count: 0 }];
  const trendDescription = dashboard.headcount_trend.length ? `Current persisted headcount is ${dashboard.total_employees} employees. Open Employees to review the roster.` : 'No employee history is available yet.';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
        <div><h1 className="text-2xl font-bold text-ink tracking-tight text-balance">Dashboard</h1><p className="text-sm text-muted mt-1">Overview of your organization at a glance · Tuesday, 22 Sep 2026</p></div>
        <label className="text-xs font-semibold text-muted">View range<select aria-label="Dashboard date range" value={range} onChange={(e) => setRange(e.target.value as Range)} className="input-field min-h-10 py-2 mt-1 block w-full sm:w-40"><option>This month</option><option>Last quarter</option><option>This year</option></select></label>
      </div>
      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center justify-between gap-3"><p className="text-sm text-semantic-down">{error}</p><button onClick={() => void loadDashboard()} className="btn-secondary text-xs">Retry</button></div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {kpis.map(({ label, value, change, trend: direction, icon: Icon, color, detail, href }) => <Link href={href} key={label} className="card card-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"><div className="flex items-start justify-between mb-4"><div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}><Icon size={18} /></div><div className={`flex items-center gap-1 text-xs font-semibold ${direction === 'up' ? 'text-cta' : 'text-semantic-down'}`}>{direction === 'up' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{change}</div></div><p className="text-2xl font-mono font-bold text-ink">{loading ? '—' : value}</p><p className="text-xs text-muted mt-1">{label}</p><p className="text-[10px] text-muted-soft mt-1">{detail}</p></Link>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <button type="button" onClick={() => setDrilldown({ title: 'Headcount trend', description: trendDescription, href: '/employees' })} className="card lg:col-span-2 text-left cursor-pointer hover:border-primary-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"><h2 className="text-sm font-bold text-ink mb-1">Headcount trend</h2><p className="text-xs text-muted mb-4">{range} · live database data</p><ResponsiveContainer width="100%" height={220}><AreaChart data={trend} margin={{ top: 5, right: 20, bottom: 0, left: 0 }}><defs><linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} /><stop offset="95%" stopColor="#6366F1" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} /><Tooltip contentStyle={tooltipStyle} /><Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} fill="url(#colorCount)" dot={{ r: 4, fill: '#6366F1' }} /></AreaChart></ResponsiveContainer></button>
        <button type="button" onClick={() => setDrilldown({ title: 'Department headcount', description: 'Current department distribution from active employees. Open Departments to review team structure.', href: '/departments' })} className="card text-left cursor-pointer hover:border-primary-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"><h2 className="text-sm font-bold text-ink mb-1">Dept. headcount</h2><p className="text-xs text-muted mb-4">Current distribution · live database data</p><ResponsiveContainer width="100%" height={220}><BarChart data={departments} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}><XAxis dataKey="dept" tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></button>
      </div>
      <div className="card"><h2 className="text-sm font-bold text-ink mb-4">Quick actions</h2><div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{[{ label: 'Add employee', icon: Users, href: '/employees/new', color: 'bg-primary-surface text-primary' }, { label: 'Process payroll', icon: Wallet, href: '/payroll', color: 'bg-cta-surface text-cta' }, { label: 'Review leave', icon: CalendarDays, href: '/leave', color: 'bg-amber-50 text-accent-yellow' }, { label: 'View reports', icon: FileText, href: '/reports', color: 'bg-violet-50 text-violet-600' }].map(({ label, icon: Icon, href, color }) => <Link key={label} href={href} className="flex flex-col items-center gap-2 rounded-xl border border-hairline p-4 hover:border-primary-light hover:bg-primary-surface/20 transition-colors cursor-pointer"><div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}><Icon size={18} /></div><span className="text-xs font-semibold text-ink">{label}</span></Link>)}</div></div>
      {drilldown && <DrilldownModal item={drilldown} onClose={() => setDrilldown(null)} />}
    </div>
  );
}
