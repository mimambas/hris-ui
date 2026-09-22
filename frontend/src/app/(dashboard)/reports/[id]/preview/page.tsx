'use client';

import Link from 'next/link';
import { ArrowLeft, Download, Share2, BarChart3, PieChart, TrendingUp, Users } from 'lucide-react';
import ModuleHeader from '@/components/ui/ModuleHeader';

const reportMeta = {
  title: 'Workforce Analytics Report',
  period: 'September 2026',
  generated: '20 Sep 2026, 09:15 WIB',
  generatedBy: 'Rina Sari (HR Manager)',
  totalEmployees: 486,
  avgTenure: '2.4 years',
  turnoverRate: '8.2%',
  avgPerformance: '3.8 / 5.0',
};

const sections = [
  {
    id: 'headcount',
    icon: Users,
    title: 'Headcount Breakdown',
    color: 'bg-primary-surface text-primary',
    chart: 'bar' as const,
    data: [
      { label: 'Engineering', value: 186, pct: 38.3 },
      { label: 'Customer Success', value: 94, pct: 19.3 },
      { label: 'Marketing', value: 56, pct: 11.5 },
      { label: 'Product & Design', value: 48, pct: 9.9 },
      { label: 'Finance', value: 32, pct: 6.6 },
      { label: 'Human Resources', value: 24, pct: 4.9 },
    ],
    max: 186,
  },
  {
    id: 'tenure',
    icon: TrendingUp,
    title: 'Tenure Distribution',
    color: 'bg-cta-surface text-cta-hover',
    chart: 'bar' as const,
    data: [
      { label: '< 1 year', value: 142, pct: 29.2 },
      { label: '1-2 years', value: 156, pct: 32.1 },
      { label: '3-5 years', value: 112, pct: 23.0 },
      { label: '5+ years', value: 76, pct: 15.6 },
    ],
    max: 156,
  },
  {
    id: 'performance',
    icon: BarChart3,
    title: 'Performance Rating Distribution',
    color: 'bg-violet-50 text-violet-600',
    chart: 'bar' as const,
    data: [
      { label: 'Exceeds (5)', value: 48, pct: 9.9 },
      { label: 'Above (4)', value: 168, pct: 34.6 },
      { label: 'Meets (3)', value: 192, pct: 39.5 },
      { label: 'Below (2)', value: 64, pct: 13.2 },
      { label: 'Poor (1)', value: 14, pct: 2.9 },
    ],
    max: 192,
  },
];

const recommendations = [
  { title: 'High turnover in Engineering', detail: '12% attrition rate, above company average of 8.2%. Recommend salary benchmarking and retention analysis.', priority: 'high' },
  { title: 'Aging workforce in Finance', detail: 'Average age 42, 35% within 5 years of retirement. Recommend succession planning.', priority: 'medium' },
  { title: 'Strong hiring velocity', detail: 'Net headcount growth of 12 this month, 80% offer acceptance rate. Maintain current pipeline.', priority: 'low' },
];

const priorityMeta: Record<string, { label: string; color: string }> = {
  high: { label: 'High priority', color: 'bg-red-50 text-semantic-down' },
  medium: { label: 'Medium priority', color: 'bg-amber-50 text-accent-yellow' },
  low: { label: 'Low priority', color: 'bg-cta-surface text-cta-hover' },
};

export default function ReportPreviewPage() {
  return (
    <div>
      <Link href="/reports" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors mb-5">
        <ArrowLeft size={14} /> Back to Reports
      </Link>

      <ModuleHeader
        eyebrow="Report preview"
        title={reportMeta.title}
        description={`${reportMeta.period} · Generated ${reportMeta.generated}`}
        action={<><button className="btn-secondary gap-2"><Share2 size={15} /> Share</button><button className="btn-cta gap-2"><Download size={15} /> Export PDF</button></>}
      />

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card"><p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Total employees</p><p className="mt-2 font-mono text-2xl font-bold text-ink">{reportMeta.totalEmployees}</p></div>
        <div className="card"><p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Avg. tenure</p><p className="mt-2 font-mono text-2xl font-bold text-ink">{reportMeta.avgTenure}</p></div>
        <div className="card"><p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Turnover rate</p><p className="mt-2 font-mono text-2xl font-bold text-semantic-down">{reportMeta.turnoverRate}</p></div>
        <div className="card"><p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Avg. performance</p><p className="mt-2 font-mono text-2xl font-bold text-ink">{reportMeta.avgPerformance}</p></div>
      </div>

      {/* Chart sections */}
      <div className="space-y-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.id} className="card p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-hairline-soft flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${section.color}`}>
                  <Icon size={16} />
                </div>
                <h2 className="text-sm font-bold text-ink">{section.title}</h2>
              </div>
              <div className="px-5 py-5 space-y-3">
                {section.data.map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <span className="text-xs text-body w-24 shrink-0 font-mono">{item.label}</span>
                    <div className="flex-1 h-6 rounded-md bg-surface-strong overflow-hidden">
                      <div
                        className="h-full rounded-md bg-primary transition-all duration-500"
                        style={{ width: `${(item.value / section.max) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-ink w-12 text-right font-mono">{item.value}</span>
                    <span className="text-[11px] text-muted w-12 text-right">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      <div className="card mt-6 p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-hairline-soft">
          <h2 className="text-sm font-bold text-ink">Key Recommendations</h2>
        </div>
        <div className="divide-y divide-hairline-soft">
          {recommendations.map((rec) => {
            const pm = priorityMeta[rec.priority];
            return (
              <div key={rec.title} className="px-5 py-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-sm font-semibold text-ink">{rec.title}</h3>
                  <span className={`badge text-[10px] ${pm.color}`}>{pm.label}</span>
                </div>
                <p className="text-xs text-body leading-relaxed">{rec.detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between text-[11px] text-muted">
        <span>Generated by {reportMeta.generatedBy}</span>
        <span>Report ID: RPT-20260920-001</span>
      </div>
    </div>
  );
}
