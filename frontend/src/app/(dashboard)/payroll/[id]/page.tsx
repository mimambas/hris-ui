'use client';

import Link from 'next/link';
import { ArrowLeft, Download, Printer, FileText, CheckCircle2, Building2 } from 'lucide-react';
import ModuleHeader from '@/components/ui/ModuleHeader';

function downloadPayslip() {
  const content = ['HRIS PAYSLIP', `Employee,${payroll.name}`, `Employee ID,${payroll.id}`, `Period,${payroll.period}`, `Gross,${payroll.gross}`, `Net pay,${payroll.net}`, `Bank,${payroll.bank}`].join('\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'payslip-september-2026.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

const payroll = { name: 'Rina Sari', id: 'EMP-20260101-001', role: 'HR Manager', department: 'Human Resources', period: 'September 2026', gross: 'Rp 15.000.000', basic: 'Rp 15.000.000', allowance: 'Rp 1.500.000', tax: 'Rp 1.950.000', bpjs: 'Rp 675.000', other: 'Rp 0', net: 'Rp 13.875.000', bank: 'BCA •••• 7890' };

export default function PayslipPage() {
  return <div>
    <Link href="/payroll" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors mb-5"><ArrowLeft size={14} /> Back to Payroll</Link>
    <ModuleHeader eyebrow="Payroll detail" title="Payslip" description={`${payroll.period} · ${payroll.name}`} action={<><button onClick={() => window.print()} className="btn-secondary gap-2"><Printer size={15} /> Print</button><button onClick={downloadPayslip} className="btn-cta gap-2"><Download size={15} /> Download PDF</button></>} />
    <div className="max-w-3xl">
      <div className="card p-0 overflow-hidden">
        <div className="bg-surface-dark text-white px-6 sm:px-8 py-6 flex items-start justify-between"><div><div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><span className="text-xs font-bold">H</span></div><span className="text-sm font-bold">HRIS</span></div><p className="text-xs text-indigo-200">PT Maju Bersama Indonesia</p><p className="text-xs text-indigo-200 mt-0.5">Jl. Sudirman Kav. 52-53, Jakarta</p></div><div className="text-right"><p className="text-lg font-bold">PAYSLIP</p><p className="text-xs text-indigo-200 mt-1">{payroll.period}</p><span className="inline-flex items-center gap-1.5 mt-3 rounded-pill bg-cta/20 text-cta-light px-3 py-1 text-[11px] font-semibold"><CheckCircle2 size={12} /> Paid</span></div></div>
        <div className="px-6 sm:px-8 py-6 border-b border-hairline"><div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><div><p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Employee</p><p className="text-sm font-bold text-ink mt-1">{payroll.name}</p><p className="text-xs text-muted font-mono mt-0.5">{payroll.id}</p></div><div><p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Position</p><p className="text-sm font-semibold text-ink mt-1">{payroll.role}</p><p className="text-xs text-muted mt-0.5">{payroll.department}</p></div><div><p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Payment method</p><p className="text-sm font-semibold text-ink mt-1">{payroll.bank}</p><p className="text-xs text-muted mt-0.5">Paid on 28 Sep 2026</p></div></div></div>
        <div className="px-6 sm:px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-8"><div><div className="flex items-center gap-2 mb-4"><div className="w-7 h-7 rounded-lg bg-cta-surface flex items-center justify-center"><span className="text-xs text-cta font-bold">+</span></div><h2 className="text-sm font-bold text-ink">Earnings</h2></div><div className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-body">Basic salary</span><span className="font-mono text-ink">{payroll.basic}</span></div><div className="flex justify-between"><span className="text-body">Transport & meal allowance</span><span className="font-mono text-ink">{payroll.allowance}</span></div><div className="pt-3 mt-3 border-t border-hairline flex justify-between"><span className="font-bold text-ink">Gross earnings</span><span className="font-mono font-bold text-ink">{payroll.gross}</span></div></div></div><div><div className="flex items-center gap-2 mb-4"><div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center"><span className="text-xs text-semantic-down font-bold">−</span></div><h2 className="text-sm font-bold text-ink">Deductions</h2></div><div className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-body">PPh 21</span><span className="font-mono text-semantic-down">{payroll.tax}</span></div><div className="flex justify-between"><span className="text-body">BPJS contributions</span><span className="font-mono text-semantic-down">{payroll.bpjs}</span></div><div className="flex justify-between"><span className="text-body">Other deductions</span><span className="font-mono text-semantic-down">{payroll.other}</span></div><div className="pt-3 mt-3 border-t border-hairline flex justify-between"><span className="font-bold text-ink">Total deductions</span><span className="font-mono font-bold text-semantic-down">Rp 2.625.000</span></div></div></div></div>
        <div className="mx-6 sm:mx-8 mb-8 rounded-xl bg-primary-surface px-5 py-5 flex items-center justify-between"><div><p className="text-xs font-semibold text-primary">Net pay</p><p className="text-xs text-body mt-1">Amount transferred to your account</p></div><p className="font-mono text-xl font-bold text-ink">{payroll.net}</p></div>
        <div className="px-6 sm:px-8 pb-6 flex items-center gap-2 text-[11px] text-muted"><Building2 size={13} /> This payslip is system-generated and does not require a signature.</div>
      </div>
    </div>
  </div>;
}
