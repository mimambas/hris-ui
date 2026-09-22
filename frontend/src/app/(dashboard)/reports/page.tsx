'use client';

import { useState } from 'react';
import {
  BarChart3, Download, FileText, Users, Wallet, Clock, CalendarDays, TrendingUp,
  Eye, X,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import ModuleHeader from '@/components/ui/ModuleHeader';
import StatCard from '@/components/ui/StatCard';
import { useToast } from '@/components/ui/Toast';

type ReportType = 'headcount' | 'payroll' | 'attendance' | 'leave';

const reportTypes: { title: string; description: string; icon: typeof Users; tone: string; type: ReportType }[] = [
  { title: 'Headcount report', description: 'Employee count by department, status, and location', icon: Users, tone: 'bg-primary-surface text-primary', type: 'headcount' },
  { title: 'Payroll summary', description: 'Monthly salary, tax, and benefits breakdown', icon: Wallet, tone: 'bg-cta-surface text-cta', type: 'payroll' },
  { title: 'Attendance report', description: 'Presence, lateness, overtime, and absence trends', icon: Clock, tone: 'bg-amber-50 text-accent-yellow', type: 'attendance' },
  { title: 'Leave utilization', description: 'Leave balances and usage across teams', icon: CalendarDays, tone: 'bg-primary-surface text-primary-light', type: 'leave' },
];

const headcountData = [
  { dept: 'HR', count: 24, target: 26 },
  { dept: 'Eng', count: 186, target: 200 },
  { dept: 'Design', count: 48, target: 50 },
  { dept: 'Finance', count: 32, target: 34 },
  { dept: 'Marketing', count: 56, target: 60 },
  { dept: 'CS', count: 94, target: 100 },
];

const payrollTrendData = [
  { month: 'Apr', gross: 3800, net: 3100, tax: 420 },
  { month: 'May', gross: 3950, net: 3220, tax: 440 },
  { month: 'Jun', gross: 4020, net: 3280, tax: 450 },
  { month: 'Jul', gross: 4100, net: 3350, tax: 460 },
  { month: 'Aug', gross: 4150, net: 3380, tax: 470 },
  { month: 'Sep', gross: 4200, net: 3420, tax: 480 },
];

const attendanceTrendData = [
  { month: 'Apr', present: 92.1, late: 4.2, absent: 3.7 },
  { month: 'May', present: 91.8, late: 4.5, absent: 3.7 },
  { month: 'Jun', present: 93.2, late: 3.8, absent: 3.0 },
  { month: 'Jul', present: 92.5, late: 4.0, absent: 3.5 },
  { month: 'Aug', present: 94.0, late: 3.5, absent: 2.5 },
  { month: 'Sep', present: 93.8, late: 3.6, absent: 2.6 },
];

const leaveTypeData = [
  { name: 'Annual Leave', value: 156, color: '#6366F1' },
  { name: 'Sick Leave', value: 48, color: '#F59E0B' },
  { name: 'Personal Leave', value: 22, color: '#EC4899' },
  { name: 'Maternity', value: 8, color: '#10B981' },
];

const recentReports = [
  { name: 'September 2026 Headcount', type: 'Headcount', date: '22 Sep 2026', format: 'PDF' },
  { name: 'August 2026 Payroll Summary', type: 'Payroll', date: '01 Sep 2026', format: 'XLSX' },
  { name: 'Q3 Attendance Analysis', type: 'Attendance', date: '31 Aug 2026', format: 'PDF' },
  { name: 'Annual Leave Utilization 2026', type: 'Leave', date: '30 Aug 2026', format: 'XLSX' },
];

type ReportData = { type: ReportType; title: string };

function ReportPreviewModal({ report, onClose }: { report: ReportData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-canvas border border-hairline shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-canvas border-b border-hairline-soft px-6 py-4 z-10 flex items-center justify-between">
          <div><h2 className="text-base font-bold text-ink">{report.title}</h2><p className="text-xs text-muted mt-0.5">September 2026</p></div>
          <button onClick={onClose} aria-label="Close report preview" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button>
        </div>

        {report.type === 'headcount' && (
          <div className="px-6 py-5">
            <h3 className="text-sm font-bold text-ink mb-3">Headcount by department</h3>
            <ResponsiveContainer width="100%" height={280}><BarChart data={headcountData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}><XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} /><Bar dataKey="count" fill="#6366F1" radius={[6, 6, 0, 0]} name="Actual" /><Bar dataKey="target" fill="#e2e8f0" radius={[6, 6, 0, 0]} name="Target" /></BarChart></ResponsiveContainer>
            <div className="grid grid-cols-3 gap-4 mt-5"><div className="rounded-xl bg-primary-surface p-4 text-center"><p className="text-[11px] text-muted font-semibold uppercase">Total</p><p className="text-xl font-mono font-bold text-ink mt-1">486</p></div><div className="rounded-xl bg-cta-surface p-4 text-center"><p className="text-[11px] text-muted font-semibold uppercase">Open roles</p><p className="text-xl font-mono font-bold text-cta mt-1">24</p></div><div className="rounded-xl bg-amber-50 p-4 text-center"><p className="text-[11px] text-muted font-semibold uppercase">Departments</p><p className="text-xl font-mono font-bold text-accent-yellow mt-1">6</p></div></div>
          </div>
        )}

        {report.type === 'payroll' && (
          <div className="px-6 py-5">
            <h3 className="text-sm font-bold text-ink mb-3">Payroll trend (in millions)</h3>
            <ResponsiveContainer width="100%" height={280}><LineChart data={payrollTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} /><Line type="monotone" dataKey="gross" stroke="#6366F1" strokeWidth={2} dot={{ r: 4 }} name="Gross" /><Line type="monotone" dataKey="net" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} name="Net" /><Line type="monotone" dataKey="tax" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} name="Tax" /></LineChart></ResponsiveContainer>
          </div>
        )}

        {report.type === 'attendance' && (
          <div className="px-6 py-5">
            <h3 className="text-sm font-bold text-ink mb-3">Attendance trend (%)</h3>
            <ResponsiveContainer width="100%" height={280}><LineChart data={attendanceTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} /><Line type="monotone" dataKey="present" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} name="Present %" /><Line type="monotone" dataKey="late" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} name="Late %" /><Line type="monotone" dataKey="absent" stroke="#EC4899" strokeWidth={2} dot={{ r: 4 }} name="Absent %" /></LineChart></ResponsiveContainer>
          </div>
        )}

        {report.type === 'leave' && (
          <div className="px-6 py-5">
            <h3 className="text-sm font-bold text-ink mb-3">Leave utilization by type</h3>
            <ResponsiveContainer width="100%" height={280}><PieChart><Pie data={leaveTypeData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>{leaveTypeData.map((entry) => <Cell key={entry.name} fill={entry.color} stroke="none" />)}</Pie><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} /></PieChart></ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-4">{leaveTypeData.map((item) => <div key={item.name} className="rounded-lg border border-hairline p-3 flex items-center gap-3"><div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} /><div><p className="text-xs font-semibold text-ink">{item.name}</p><p className="text-[11px] text-muted">{item.value} days used</p></div></div>)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [range, setRange] = useState('This month');
  const [generating, setGenerating] = useState<string | null>(null);
  const [previewReport, setPreviewReport] = useState<ReportData | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);
  const { toast } = useToast();

  const downloadReport = (name: string, format: string) => {
    toast(`${name} (${format}) download started.`, 'success');
  };

  const generateReport = (title: string, type: ReportType) => {
    setGenerating(title);
    setTimeout(() => {
      setGenerating(null);
      setPreviewReport({ type, title });
      toast(`${title} generated successfully.`, 'success');
    }, 1000);
  };

  return (
    <div>
      <ModuleHeader eyebrow="Insights & analytics" title="Reports" description="Turn people data into clear, actionable insights" action={<button onClick={() => setShowExport(true)} className="btn-secondary gap-2"><Download size={15} /> Export center</button>} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard icon={BarChart3} label="Reports generated" value="128" tone="primary" detail="This year" />
        <StatCard icon={Users} label="Headcount" value="486" tone="green" detail="+12 this month" />
        <StatCard icon={TrendingUp} label="Retention rate" value="94.2%" tone="green" detail="Up 1.8% YoY" />
        <StatCard icon={Clock} label="Data freshness" value="Today" tone="primary" detail="Last synced 09:00" />
      </div>

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div><h2 className="text-sm font-bold text-ink">Generate a report</h2><p className="text-xs text-muted mt-1">Choose a report type and time range</p></div>
          <select aria-label="Report time range" value={range} onChange={(e) => setRange(e.target.value)} className="input-field min-h-10 py-2 w-full sm:w-40"><option>This month</option><option>Last month</option><option>This quarter</option><option>This year</option></select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {reportTypes.map((report) => (
            <button key={report.title} onClick={() => generateReport(report.title, report.type)} disabled={generating === report.title} className="text-left rounded-xl border border-hairline p-4 hover:border-primary-light hover:bg-primary-surface/20 transition-colors cursor-pointer">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${report.tone}`}>
                {generating === report.title ? <Clock size={16} className="animate-spin" /> : <report.icon size={16} />}
              </div>
              <p className="text-xs font-bold text-ink">{report.title}</p>
              <p className="text-[11px] leading-relaxed text-muted mt-1">{report.description}</p>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary mt-3">{generating === report.title ? 'Generating…' : <><Eye size={12} /> Preview report</>}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-hairline-soft flex items-center justify-between">
          <div><h2 className="text-sm font-bold text-ink">Recent reports</h2><p className="text-xs text-muted mt-1">Your latest generated reports</p></div>
          <button onClick={() => setShowAllReports(true)} className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="border-b border-hairline">
                <th className="table-header">Report name</th>
                <th className="table-header">Type</th>
                <th className="table-header">Generated</th>
                <th className="table-header">Format</th>
                <th className="table-header text-right">Download</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((report) => (
                <tr key={report.name} className="table-row">
                  <td className="table-cell"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-primary-surface flex items-center justify-center"><FileText size={14} className="text-primary" /></div><span className="font-semibold text-ink">{report.name}</span></div></td>
                  <td className="table-cell text-body">{report.type}</td>
                  <td className="table-cell text-muted">{report.date}</td>
                  <td className="table-cell"><span className="badge bg-surface-strong text-muted">{report.format}</span></td>
                  <td className="table-cell text-right"><button onClick={() => downloadReport(report.name, report.format)} className="btn-secondary min-h-10 py-2 px-3 text-xs gap-1.5"><Download size={13} /> Download</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {previewReport && <ReportPreviewModal report={previewReport} onClose={() => setPreviewReport(null)} />}

      {showExport && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setShowExport(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-canvas border border-hairline shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-ink">Export Center</h2>
              <button onClick={() => setShowExport(false)} aria-label="Close" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-ink">Report type
                <select className="input-field mt-1.5 w-full"><option>All reports</option>{reportTypes.map((r) => <option key={r.type}>{r.title}</option>)}</select>
              </label>
              <label className="block text-sm font-semibold text-ink">Date range
                <select defaultValue="this-month" className="input-field mt-1.5 w-full"><option value="this-month">This month</option><option value="last-month">Last month</option><option value="quarter">This quarter</option><option value="year">This year</option></select>
              </label>
              <label className="block text-sm font-semibold text-ink">Format
                <select defaultValue="pdf" className="input-field mt-1.5 w-full"><option value="pdf">PDF</option><option value="xlsx">XLSX</option><option value="csv">CSV</option></select>
              </label>
            </div>
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-hairline-soft">
              <button onClick={() => setShowExport(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={() => { setShowExport(false); toast('Export started. The file will download shortly.', 'success'); }} className="btn-cta text-sm gap-2"><Download size={14} /> Export</button>
            </div>
          </div>
        </div>
      )}

      {showAllReports && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setShowAllReports(false)} />
          <div className="relative w-full max-w-2xl rounded-2xl bg-canvas border border-hairline shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-canvas border-b border-hairline-soft px-6 py-4 flex items-center justify-between z-10">
              <div><h2 className="text-base font-bold text-ink">All Reports</h2><p className="text-xs text-muted mt-0.5">128 reports generated this year</p></div>
              <button onClick={() => setShowAllReports(false)} aria-label="Close" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button>
            </div>
            <div className="px-6 py-5">
              <div className="space-y-2">
                {[
                  { name: 'September 2026 Headcount', type: 'Headcount', date: '22 Sep 2026', format: 'PDF' },
                  { name: 'August 2026 Payroll Summary', type: 'Payroll', date: '01 Sep 2026', format: 'XLSX' },
                  { name: 'Q3 Attendance Analysis', type: 'Attendance', date: '31 Aug 2026', format: 'PDF' },
                  { name: 'Annual Leave Utilization 2026', type: 'Leave', date: '30 Aug 2026', format: 'XLSX' },
                  { name: 'August 2026 Headcount', type: 'Headcount', date: '01 Aug 2026', format: 'PDF' },
                  { name: 'July 2026 Payroll Summary', type: 'Payroll', date: '01 Jul 2026', format: 'XLSX' },
                  { name: 'Q2 Attendance Analysis', type: 'Attendance', date: '30 Jun 2026', format: 'PDF' },
                  { name: 'Mid-year Leave Balance', type: 'Leave', date: '30 Jun 2026', format: 'CSV' },
                ].map((report, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-hairline hover:bg-surface-soft transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-primary-surface flex items-center justify-center shrink-0"><FileText size={15} className="text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink">{report.name}</p>
                      <p className="text-[11px] text-muted">{report.type} · {report.date}</p>
                    </div>
                    <span className="badge bg-surface-strong text-muted text-[10px]">{report.format}</span>
                    <button onClick={() => downloadReport(report.name, report.format)} className="min-h-9 min-w-9 rounded-lg hover:bg-primary-surface flex items-center justify-center" aria-label={`Download ${report.name}`}><Download size={14} className="text-muted" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
