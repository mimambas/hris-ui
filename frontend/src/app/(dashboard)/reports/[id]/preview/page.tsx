'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Download, Share2, BarChart3, TrendingUp, Users } from 'lucide-react';
import api from '@/lib/api';
import ModuleHeader from '@/components/ui/ModuleHeader';
import { useToast } from '@/components/ui/Toast';

const typeMeta: Record<string, { title: string; icon: typeof Users }> = { headcount: { title: 'Headcount Report', icon: Users }, payroll: { title: 'Payroll Summary', icon: BarChart3 }, attendance: { title: 'Attendance Report', icon: TrendingUp }, leave: { title: 'Leave Utilization', icon: TrendingUp } };
const colors = ['bg-primary-surface text-primary', 'bg-cta-surface text-cta-hover', 'bg-violet-50 text-violet-600'];

export default function ReportPreviewPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  useEffect(() => { api.get('/reports', { params: { range: 'This month' } }).then((response) => setData(response.data)).catch(() => toast('Unable to load report preview.', 'error')).finally(() => setLoading(false)); }, [toast]);
  const rows = data?.rows ?? [];
  const meta = typeMeta[id ?? 'headcount'] ?? typeMeta.headcount;
  const download = () => { const content = ['Category,Label,Value', ...rows.map((row: any) => `${row.category},${row.label},${row.value}`)].join('\n'); const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${id ?? 'report'}-preview.csv`; anchor.click(); URL.revokeObjectURL(url); toast('Report preview exported as CSV.', 'success'); };
  const share = async () => { const url = window.location.href; const canShare = typeof navigator.share === 'function'; try { if (canShare) await navigator.share({ title: meta.title, url }); else await navigator.clipboard.writeText(url); toast(canShare ? 'Report shared.' : 'Report link copied.', 'success'); } catch (error: any) { if (error?.name !== 'AbortError') toast('Unable to share report.', 'error'); } };
  if (loading) return <p className="text-sm text-muted">Loading report preview…</p>;
  return <div><Link href="/reports" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors mb-5"><ArrowLeft size={14} /> Back to Reports</Link><ModuleHeader eyebrow="Report preview" title={meta.title} description="Generated from live HRIS data" action={<><button onClick={() => void share()} className="btn-secondary gap-2"><Share2 size={15} /> Share</button><button onClick={download} className="btn-cta gap-2"><Download size={15} /> Export CSV</button></>} /><div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"><div className="card"><p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Headcount</p><p className="mt-2 font-mono text-2xl font-bold text-ink">{data?.kpis?.total_headcount ?? 0}</p></div><div className="card"><p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Active</p><p className="mt-2 font-mono text-2xl font-bold text-ink">{data?.kpis?.active_headcount ?? 0}</p></div><div className="card"><p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Attendance</p><p className="mt-2 font-mono text-2xl font-bold text-ink">{data?.kpis?.attendance_rate ?? 0}%</p></div><div className="card"><p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Leave requests</p><p className="mt-2 font-mono text-2xl font-bold text-ink">{data?.kpis?.leave_requests ?? 0}</p></div></div><div className="card"><h2 className="text-sm font-bold text-ink mb-4">Live report rows</h2><div className="space-y-3">{rows.length === 0 ? <p className="py-8 text-center text-sm text-muted">No data for this range.</p> : rows.map((row: any, index: number) => <div key={`${row.category}-${row.label}-${index}`} className="flex items-center gap-3 rounded-lg border border-hairline-soft p-3"><span className={`badge ${colors[index % colors.length]}`}>{row.category}</span><span className="flex-1 text-sm text-ink">{row.label}</span><span className="font-mono text-sm font-semibold text-ink">{Number(row.value).toLocaleString('id-ID')}</span></div>)}</div></div></div>;
}
