'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Users, Clock, CalendarDays, TrendingUp, TrendingDown, ArrowUpRight, Wallet, FileText, X, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

type Range = 'This month' | 'Last quarter' | 'This year';
type Drilldown = { title: string; description: string; href: string } | null;

const kpis = [
  { label: 'Total Employees', value: '486', change: '+12', trend: 'up' as const, icon: Users, color: 'bg-primary-surface text-primary', detail: '+2.5% this month', href: '/employees' },
  { label: 'Present Today', value: '442', change: '90.9%', trend: 'up' as const, icon: Clock, color: 'bg-cta-surface text-cta', detail: '44 absent or on leave', href: '/attendance' },
  { label: 'Pending Leave', value: '3', change: '-2', trend: 'down' as const, icon: CalendarDays, color: 'bg-amber-50 text-accent-yellow', detail: 'Awaiting approval', href: '/leave' },
  { label: 'Turnover Rate', value: '2.1%', change: '-0.3%', trend: 'down' as const, icon: TrendingDown, color: 'bg-red-50 text-semantic-down', detail: 'Down from 2.4% last month', href: '/reports' },
];

const rangeData: Record<Range, { months: { month: string; count: number }[]; attendance: { day: string; rate: number }[] }> = {
  'This month': {
    months: [{ month: 'Apr', count: 462 }, { month: 'May', count: 468 }, { month: 'Jun', count: 471 }, { month: 'Jul', count: 474 }, { month: 'Aug', count: 480 }, { month: 'Sep', count: 486 }],
    attendance: [{ day: 'Mon', rate: 93.2 }, { day: 'Tue', rate: 91.8 }, { day: 'Wed', rate: 94.1 }, { day: 'Thu', rate: 92.5 }, { day: 'Fri', rate: 90.9 }],
  },
  'Last quarter': {
    months: [{ month: 'Jul', count: 474 }, { month: 'Aug', count: 480 }, { month: 'Sep', count: 486 }],
    attendance: [{ day: 'Week 1', rate: 92.3 }, { day: 'Week 2', rate: 93.4 }, { day: 'Week 3', rate: 91.8 }, { day: 'Week 4', rate: 93.1 }],
  },
  'This year': {
    months: [{ month: 'Jan', count: 438 }, { month: 'Mar', count: 451 }, { month: 'May', count: 468 }, { month: 'Jul', count: 474 }, { month: 'Sep', count: 486 }],
    attendance: [{ day: 'Q1', rate: 91.4 }, { day: 'Q2', rate: 92.2 }, { day: 'Q3', rate: 93.1 }, { day: 'Q4', rate: 92.7 }],
  },
};

const departmentHeadcount = [
  { dept: 'HR', count: 24 }, { dept: 'Eng', count: 186 }, { dept: 'Design', count: 48 },
  { dept: 'Finance', count: 32 }, { dept: 'Mktg', count: 56 }, { dept: 'CS', count: 94 },
];

const activity = [
  { name: 'Sari Dewi', initials: 'SD', action: 'Applied for annual leave', time: '2 min ago', color: 'bg-primary-surface text-primary' },
  { name: 'Budi Hartono', initials: 'BH', action: 'Checked in late (09:12)', time: '1 hour ago', color: 'bg-amber-50 text-accent-yellow' },
  { name: 'Andi Pratama', initials: 'AP', action: 'Submitted expense claim (Rp 2.4M)', time: '3 hours ago', color: 'bg-cta-surface text-cta' },
  { name: 'Rina Sari', initials: 'RS', action: 'Approved payroll for Sep 2026', time: 'Yesterday', color: 'bg-primary-surface text-primary-light' },
  { name: 'Maya Anggraeni', initials: 'MA', action: 'Uploaded design system docs', time: 'Yesterday', color: 'bg-violet-50 text-violet-600' },
  { name: 'Dimas Saputra', initials: 'DS', action: 'Completed onboarding (12/12)', time: '2 days ago', color: 'bg-cta-surface text-cta' },
];

const upcoming = [
  { title: 'Contract expiring', desc: '3 employees — Oct 2026', dot: 'bg-semantic-down', urgency: 'high' },
  { title: 'Probation ending', desc: '2 employees — Oct 2026', dot: 'bg-accent-yellow', urgency: 'medium' },
  { title: 'Birthdays this month', desc: '8 employees', dot: 'bg-primary', urgency: 'low' },
  { title: 'Work anniversaries', desc: '5 employees this month', dot: 'bg-cta', urgency: 'low' },
  { title: 'Payroll deadline', desc: '28 Sep 2026', dot: 'bg-accent-yellow', urgency: 'medium' },
  { title: 'BPJS sync due', desc: '30 Sep 2026', dot: 'bg-primary', urgency: 'low' },
];

const tooltipStyle = { fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' };

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
  const [drilldown, setDrilldown] = useState<Drilldown>(null);
  const data = useMemo(() => rangeData[range], [range]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
        <div><h1 className="text-2xl font-bold text-ink tracking-tight text-balance">Dashboard</h1><p className="text-sm text-muted mt-1">Overview of your organization at a glance · Tuesday, 22 Sep 2026</p></div>
        <label className="text-xs font-semibold text-muted">View range<select aria-label="Dashboard date range" value={range} onChange={(e) => setRange(e.target.value as Range)} className="input-field min-h-10 py-2 mt-1 block w-full sm:w-40"><option>This month</option><option>Last quarter</option><option>This year</option></select></label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {kpis.map(({ label, value, change, trend, icon: Icon, color, detail, href }) => <Link href={href} key={label} className="card card-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"><div className="flex items-start justify-between mb-4"><div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}><Icon size={18} /></div><div className={`flex items-center gap-1 text-xs font-semibold ${trend === 'up' ? 'text-cta' : 'text-semantic-down'}`}>{trend === 'up' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{change}</div></div><p className="text-2xl font-mono font-bold text-ink">{value}</p><p className="text-xs text-muted mt-1">{label}</p><p className="text-[10px] text-muted-soft mt-1">{detail}</p></Link>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <button type="button" onClick={() => setDrilldown({ title: 'Headcount trend', description: `Headcount moved from ${data.months[0].count} to ${data.months[data.months.length - 1].count} employees during ${range.toLowerCase()}. Open Employees to review the current roster and changes.`, href: '/employees' })} className="card lg:col-span-2 text-left cursor-pointer hover:border-primary-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"><h2 className="text-sm font-bold text-ink mb-1">Headcount trend</h2><p className="text-xs text-muted mb-4">{range} · click chart for details</p><ResponsiveContainer width="100%" height={220}><AreaChart data={data.months} margin={{ top: 5, right: 20, bottom: 0, left: 0 }}><defs><linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} /><stop offset="95%" stopColor="#6366F1" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} /><Tooltip contentStyle={tooltipStyle} /><Area type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={2} fill="url(#colorCount)" dot={{ r: 4, fill: '#6366F1' }} /></AreaChart></ResponsiveContainer></button>
        <button type="button" onClick={() => setDrilldown({ title: 'Department headcount', description: `Engineering is the largest team with 186 employees, followed by Customer Success with 94. Open the directory to view team composition.`, href: '/departments' })} className="card text-left cursor-pointer hover:border-primary-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"><h2 className="text-sm font-bold text-ink mb-1">Dept. headcount</h2><p className="text-xs text-muted mb-4">Current distribution · click chart for details</p><ResponsiveContainer width="100%" height={220}><BarChart data={departmentHeadcount} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}><XAxis dataKey="dept" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8"><div className="card"><div className="flex items-center justify-between mb-5"><h2 className="text-sm font-bold text-ink">Recent Activity</h2><Link href="/audit-log" className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors flex items-center gap-1 cursor-pointer">View all <ArrowUpRight size={12} /></Link></div><div className="space-y-0">{activity.map((item, i) => <div key={i} className="flex items-center gap-3 py-3 border-b border-hairline-soft last:border-0"><div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.color}`}><span className="text-[11px] font-bold">{item.initials}</span></div><div className="flex-1 min-w-0"><p className="text-sm text-ink"><span className="font-semibold">{item.name}</span>{' '}<span className="text-body">{item.action}</span></p><p className="text-xs text-muted mt-0.5">{item.time}</p></div></div>)}</div></div><div className="card"><div className="flex items-center justify-between mb-5"><h2 className="text-sm font-bold text-ink">Upcoming</h2><Link href="/notifications" className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors flex items-center gap-1 cursor-pointer">View all <ArrowUpRight size={12} /></Link></div><div className="space-y-0">{upcoming.map((item, i) => <div key={i} className="flex items-center gap-3 py-3 border-b border-hairline-soft last:border-0"><div className={`w-2.5 h-2.5 rounded-full ${item.dot} shrink-0`} /><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-ink">{item.title}</p><p className="text-xs text-muted mt-0.5">{item.desc}</p></div>{item.urgency === 'high' && <span className="badge bg-red-50 text-semantic-down text-[10px]">Urgent</span>}{item.urgency === 'medium' && <span className="badge bg-amber-50 text-accent-yellow text-[10px]">Soon</span>}</div>)}</div></div></div>

      <div className="card"><h2 className="text-sm font-bold text-ink mb-4">Quick actions</h2><div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{[{ label: 'Add employee', icon: Users, href: '/employees/new', color: 'bg-primary-surface text-primary' }, { label: 'Process payroll', icon: Wallet, href: '/payroll', color: 'bg-cta-surface text-cta' }, { label: 'Review leave', icon: CalendarDays, href: '/leave', color: 'bg-amber-50 text-accent-yellow' }, { label: 'View reports', icon: FileText, href: '/reports', color: 'bg-violet-50 text-violet-600' }].map(({ label, icon: Icon, href, color }) => <Link key={label} href={href} className="flex flex-col items-center gap-2 rounded-xl border border-hairline p-4 hover:border-primary-light hover:bg-primary-surface/20 transition-colors cursor-pointer"><div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}><Icon size={18} /></div><span className="text-xs font-semibold text-ink">{label}</span></Link>)}</div></div>
      {drilldown && <DrilldownModal item={drilldown} onClose={() => setDrilldown(null)} />}
    </div>
  );
}
