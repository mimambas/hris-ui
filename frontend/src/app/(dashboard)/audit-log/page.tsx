'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { Search, Download, Filter, ShieldCheck, UserPlus, FileText, Settings, LogIn, MoreHorizontal, X, ChevronDown, CalendarDays } from 'lucide-react';
import ModuleHeader from '@/components/ui/ModuleHeader';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { downloadCsv } from '@/lib/csv';

type AuditEntry = {
  id: string; actor: string; initials: string; action: string; target: string;
  category: string; time: string; ip: string; icon: typeof ShieldCheck; color: string;
  date: string; dateISO: string; detail: string;
  before?: Record<string, string>;
  after?: Record<string, string>;
};

/* ---------- helpers for relative dates ---------- */
function daysAgo(n: number): { date: string; dateISO: string; time: string } {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const day = d.getDate();
  const month = d.toLocaleString('en-GB', { month: 'short' });
  const displayDate = `${day} ${month}`;
  const dateISO = d.toISOString().slice(0, 10);
  const hours = 6 + Math.floor(Math.random() * 13); // 06-18
  const mins = Math.floor(Math.random() * 60);
  const time = `${displayDate} ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  return { date: displayDate, dateISO, time };
}
function label(n: number): { date: string; dateISO: string; time: string; timeLabel: string } {
  const { date, dateISO, time } = daysAgo(n);
  if (n === 0) return { date, dateISO, time: `Today, ${time.split(' ')[1]}`, timeLabel: time };
  if (n === 1) return { date, dateISO, time: `Yesterday, ${time.split(' ')[1]}`, timeLabel: time };
  return { date, dateISO, time, timeLabel: time };
}

/* ---------- 30+ mock entries spread across 90 days ---------- */
const L = [
  label(0), label(0), label(0), label(1), label(1), label(1), label(2), label(2), label(2), label(3),
  label(3), label(4), label(5), label(5), label(6), label(7), label(7), label(8), label(9), label(10),
  label(11), label(12), label(13), label(14), label(15), label(17), label(18), label(19), label(20),
  label(22), label(24), label(26), label(28), label(30), label(35), label(40), label(45), label(50),
  label(55), label(60), label(70), label(80), label(88), label(90), label(92),
];

const auditEntries: AuditEntry[] = [
  { id: '1', actor: 'Rina Sari', initials: 'RS', action: 'Updated employee record', target: 'Budi Hartono · EMP-20260101-002', category: 'Employee', time: L[0].time, ip: '103.28.14.21', icon: UserPlus, color: 'bg-primary-surface text-primary', date: L[0].date, dateISO: L[0].dateISO, detail: 'Updated phone number and emergency contact details.', before: { Phone: '+62 813-4567-8900', 'Emergency contact': 'Siti Hartono (Mother)' }, after: { Phone: '+62 813-4567-8901', 'Emergency contact': 'Siti Hartono (Mother), Bpk. Hartono (Father)' } },
  { id: '2', actor: 'System', initials: 'SY', action: 'Payroll processed', target: 'September 2026 payroll · 478 employees', category: 'Payroll', time: L[1].time, ip: 'Internal', icon: Settings, color: 'bg-cta-surface text-cta-hover', date: L[1].date, dateISO: L[1].dateISO, detail: 'Monthly payroll batch processed. Total disbursement: Rp 4,200,000,000. 8 pending items flagged.' },
  { id: '3', actor: 'Budi Hartono', initials: 'BH', action: 'Downloaded document', target: 'Employment contract · EMP-20260101-002', category: 'Documents', time: L[2].time, ip: '103.28.18.44', icon: FileText, color: 'bg-sky-50 text-sky-600', date: L[2].date, dateISO: L[2].dateISO, detail: 'Downloaded employment contract PDF. File size: 245KB. Access logged for compliance.' },
  { id: '4', actor: 'Rina Sari', initials: 'RS', action: 'Approved leave request', target: 'Maya Anggraeni · Annual leave · 3 days', category: 'Leave', time: L[3].time, ip: '103.28.14.21', icon: ShieldCheck, color: 'bg-violet-50 text-violet-600', date: L[3].date, dateISO: L[3].dateISO, detail: 'Leave approved for 24-26 Sep 2026. Balance deducted: 3 days. Annual leave remaining: 9 days.' },
  { id: '5', actor: 'Andi Pratama', initials: 'AP', action: 'Logged in', target: 'Web application', category: 'Authentication', time: L[4].time, ip: '114.125.80.7', icon: LogIn, color: 'bg-amber-50 text-accent-yellow', date: L[4].date, dateISO: L[4].dateISO, detail: 'Successful login via email/password. 2FA verified. Session started from Chrome on macOS.' },
  { id: '6', actor: 'Rina Sari', initials: 'RS', action: 'Generated report', target: 'Workforce analytics · September 2026', category: 'Reports', time: L[5].time, ip: '103.28.14.21', icon: FileText, color: 'bg-pink-50 text-pink-600', date: L[5].date, dateISO: L[5].dateISO, detail: 'Generated workforce analytics report in PDF format. Date range: 01 Sep - 22 Sep 2026.' },
  { id: '7', actor: 'System', initials: 'SY', action: 'Updated notification settings', target: 'Scheduled maintenance announcement', category: 'System', time: L[6].time, ip: 'Internal', icon: Settings, color: 'bg-surface-strong text-muted', date: L[6].date, dateISO: L[6].dateISO, detail: 'System maintenance notification scheduled for 27 Sep 2026 22:00-02:00 WIB.', before: { 'Notification type': 'None', Schedule: 'None' }, after: { 'Notification type': 'Maintenance banner', Schedule: '27 Sep 2026 22:00-02:00 WIB' } },
  { id: '8', actor: 'Maya Anggraeni', initials: 'MA', action: 'Submitted expense claim', target: 'Travel claim · Rp 1,875,000', category: 'Expenses', time: L[7].time, ip: '36.68.22.109', icon: FileText, color: 'bg-emerald-50 text-emerald-600', date: L[7].date, dateISO: L[7].dateISO, detail: 'Travel & Transport expense claim submitted. Receipt attached. Awaiting manager approval.' },
  { id: '9', actor: 'Sari Dewi', initials: 'SD', action: 'Created job posting', target: 'Senior Marketing Manager', category: 'Employee', time: L[8].time, ip: '36.68.22.110', icon: UserPlus, color: 'bg-primary-surface text-primary', date: L[8].date, dateISO: L[8].dateISO, detail: 'New job posting created for Marketing department. Salary range: Rp 18-25M. 2 openings.' },
  { id: '10', actor: 'System', initials: 'SY', action: 'BPJS sync completed', target: 'Monthly BPJS data sync · 486 employees', category: 'System', time: L[9].time, ip: 'Internal', icon: Settings, color: 'bg-surface-strong text-muted', date: L[9].date, dateISO: L[9].dateISO, detail: 'Automated monthly BPJS Kesehatan and Ketenagakerjaan data synchronization completed successfully.' },
  /* ---- 11-15 ---- */
  { id: '11', actor: 'Rina Sari', initials: 'RS', action: 'Updated department head', target: 'Marketing department', category: 'Employee', time: L[10].time, ip: '103.28.14.21', icon: UserPlus, color: 'bg-primary-surface text-primary', date: L[10].date, dateISO: L[10].dateISO, detail: 'Changed department head assignment.', before: { 'Department head': 'Sari Dewi' }, after: { 'Department head': 'Rina Sari' } },
  { id: '12', actor: 'Andi Pratama', initials: 'AP', action: 'Logged in', target: 'Web application', category: 'Authentication', time: L[11].time, ip: '114.125.80.7', icon: LogIn, color: 'bg-amber-50 text-accent-yellow', date: L[11].date, dateISO: L[11].dateISO, detail: 'Login via SSO (Google Workspace). Session started from Safari on macOS.' },
  { id: '13', actor: 'Dewi Lestari', initials: 'DL', action: 'Submitted leave request', target: 'Sick leave · 1 day', category: 'Leave', time: L[12].time, ip: '36.68.22.115', icon: ShieldCheck, color: 'bg-violet-50 text-violet-600', date: L[12].date, dateISO: L[12].dateISO, detail: 'Sick leave request for 19 Sep 2026. Medical certificate attached.' },
  { id: '14', actor: 'System', initials: 'SY', action: 'Payroll reminder sent', target: 'October payroll deadline · 30 Sep', category: 'Payroll', time: L[13].time, ip: 'Internal', icon: Settings, color: 'bg-cta-surface text-cta-hover', date: L[13].date, dateISO: L[13].dateISO, detail: 'Automated reminder sent to department heads regarding October payroll submission deadline.' },
  { id: '15', actor: 'Fajar Nugroho', initials: 'FN', action: 'Submitted expense claim', target: 'Office supplies · Rp 350,000', category: 'Expenses', time: L[14].time, ip: '103.28.19.33', icon: FileText, color: 'bg-emerald-50 text-emerald-600', date: L[14].date, dateISO: L[14].dateISO, detail: 'Office supplies expense claim for stationery and printer ink.' },
  /* ---- 16-20 ---- */
  { id: '16', actor: 'Rina Sari', initials: 'RS', action: 'Updated salary grade', target: 'Fajar Nugroho · EMP-20260101-015', category: 'Payroll', time: L[15].time, ip: '103.28.14.21', icon: Settings, color: 'bg-cta-surface text-cta-hover', date: L[15].date, dateISO: L[15].dateISO, detail: 'Salary grade updated following annual review.', before: { 'Grade': 'III.2', 'Base salary': 'Rp 12,500,000' }, after: { 'Grade': 'III.3', 'Base salary': 'Rp 14,000,000' } },
  { id: '17', actor: 'System', initials: 'SY', action: 'Leave auto-approved', target: 'Sinta Kusuma · Sick leave · 1 day', category: 'Leave', time: L[16].time, ip: 'Internal', icon: ShieldCheck, color: 'bg-violet-50 text-violet-600', date: L[16].date, dateISO: L[16].dateISO, detail: 'Sick leave auto-approved (medical certificate provided). < 3 days consecutive.' },
  { id: '18', actor: 'Nadia Putri', initials: 'NP', action: 'Logged in', target: 'Web application', category: 'Authentication', time: L[17].time, ip: '36.68.22.120', icon: LogIn, color: 'bg-amber-50 text-accent-yellow', date: L[17].date, dateISO: L[17].dateISO, detail: 'First login. Account created via HR onboarding flow. Chrome on Windows 11.' },
  { id: '19', actor: 'Rina Sari', initials: 'RS', action: 'Approved expense claim', target: 'Maya Anggraeni · Rp 1,875,000', category: 'Expenses', time: L[18].time, ip: '103.28.14.21', icon: FileText, color: 'bg-emerald-50 text-emerald-600', date: L[18].date, dateISO: L[18].dateISO, detail: 'Travel expense claim approved. Payment will be included in next payroll cycle.', before: { Status: 'Pending' }, after: { Status: 'Approved' } },
  { id: '20', actor: 'Budi Hartono', initials: 'BH', action: 'Downloaded document', target: 'Tax form (Form W-8BEN) · EMP-20260101-002', category: 'Documents', time: L[19].time, ip: '103.28.18.44', icon: FileText, color: 'bg-sky-50 text-sky-600', date: L[19].date, dateISO: L[19].dateISO, detail: 'Downloaded tax declaration form. File size: 128KB.' },
  /* ---- 21-25 ---- */
  { id: '21', actor: 'Sari Dewi', initials: 'SD', action: 'Created job posting', target: 'Backend Engineer · Remote', category: 'Employee', time: L[20].time, ip: '36.68.22.110', icon: UserPlus, color: 'bg-primary-surface text-primary', date: L[20].date, dateISO: L[20].dateISO, detail: 'New remote backend engineer posting. Tech stack: Node.js, PostgreSQL. 3 openings.' },
  { id: '22', actor: 'System', initials: 'SY', action: 'BPJS sync completed', target: 'Mid-month BPJS sync · 488 employees', category: 'System', time: L[21].time, ip: 'Internal', icon: Settings, color: 'bg-surface-strong text-muted', date: L[21].date, dateISO: L[21].dateISO, detail: 'Mid-month BPJS data synchronization completed. 2 new enrollees added.' },
  { id: '23', actor: 'Rina Sari', initials: 'RS', action: 'Updated bank details', target: 'Larasati Hadi · EMP-20260101-008', category: 'Payroll', time: L[22].time, ip: '103.28.14.21', icon: Settings, color: 'bg-cta-surface text-cta-hover', date: L[22].date, dateISO: L[22].dateISO, detail: 'Updated bank account for payroll disbursement.', before: { Bank: 'Bank Mandiri', 'Account no': '1234-5678-9012' }, after: { Bank: 'Bank BCA', 'Account no': '9876-5432-1098' } },
  { id: '24', actor: 'Andi Pratama', initials: 'AP', action: 'Submitted expense claim', target: 'Client dinner · Rp 850,000', category: 'Expenses', time: L[23].time, ip: '114.125.80.7', icon: FileText, color: 'bg-emerald-50 text-emerald-600', date: L[23].date, dateISO: L[23].dateISO, detail: 'Client entertainment expense. Receipt attached. Awaiting VP approval (above Rp 500K threshold).' },
  { id: '25', actor: 'System', initials: 'SY', action: 'Announcement posted', target: 'Q4 team-building event', category: 'System', time: L[24].time, ip: 'Internal', icon: Settings, color: 'bg-surface-strong text-muted', date: L[24].date, dateISO: L[24].dateISO, detail: 'Company-wide announcement for Q4 team-building on 28 Oct 2026. All employees notified.' },
  /* ---- 26-30 ---- */
  { id: '26', actor: 'Rina Sari', initials: 'RS', action: 'Updated probation status', target: 'Nadia Putri · Product Designer', category: 'Employee', time: L[25].time, ip: '103.28.14.21', icon: UserPlus, color: 'bg-primary-surface text-primary', date: L[25].date, dateISO: L[25].dateISO, detail: 'Probation status updated.', before: { Status: 'In probation' }, after: { Status: 'Confirmed' } },
  { id: '27', actor: 'Dewi Lestari', initials: 'DL', action: 'Downloaded document', target: 'BPJS certificate · EMP-20260101-010', category: 'Documents', time: L[26].time, ip: '36.68.22.115', icon: FileText, color: 'bg-sky-50 text-sky-600', date: L[26].date, dateISO: L[26].dateISO, detail: 'Downloaded BPJS membership certificate for personal records.' },
  { id: '28', actor: 'Sari Dewi', initials: 'SD', action: 'Approved leave request', target: 'Fajar Nugroho · Annual leave · 5 days', category: 'Leave', time: L[27].time, ip: '36.68.22.110', icon: ShieldCheck, color: 'bg-violet-50 text-violet-600', date: L[27].date, dateISO: L[27].dateISO, detail: 'Annual leave approved for 8-12 Oct 2026. Remaining balance: 7 days.' },
  { id: '29', actor: 'Maya Anggraeni', initials: 'MA', action: 'Logged in', target: 'Mobile application', category: 'Authentication', time: L[28].time, ip: '36.68.22.109', icon: LogIn, color: 'bg-amber-50 text-accent-yellow', date: L[28].date, dateISO: L[28].dateISO, detail: 'Login via biometric (fingerprint) on Android device. App version 3.2.1.' },
  { id: '30', actor: 'System', initials: 'SY', action: 'Generated report', target: 'Monthly attendance · August 2026', category: 'Reports', time: L[29].time, ip: 'Internal', icon: FileText, color: 'bg-pink-50 text-pink-600', date: L[29].date, dateISO: L[29].dateISO, detail: 'Monthly attendance summary generated. 98.3% average attendance rate.' },
  /* ---- 31-35 ---- */
  { id: '31', actor: 'Rina Sari', initials: 'RS', action: 'Updated job title', target: 'Sinta Kusuma · EMP-20260101-007', category: 'Employee', time: L[30].time, ip: '103.28.14.21', icon: UserPlus, color: 'bg-primary-surface text-primary', date: L[30].date, dateISO: L[30].dateISO, detail: 'Job title updated as part of internal restructuring.', before: { 'Job title': 'Junior Accountant' }, after: { 'Job title': 'Staff Accountant' } },
  { id: '32', actor: 'Fajar Nugroho', initials: 'FN', action: 'Logged in', target: 'Web application', category: 'Authentication', time: L[31].time, ip: '103.28.19.33', icon: LogIn, color: 'bg-amber-50 text-accent-yellow', date: L[31].date, dateISO: L[31].dateISO, detail: 'Login via email/password. Failed 2FA once, succeeded on retry.' },
  { id: '33', actor: 'System', initials: 'SY', action: 'Payroll processed', target: 'August 2026 payroll · 475 employees', category: 'Payroll', time: L[32].time, ip: 'Internal', icon: Settings, color: 'bg-cta-surface text-cta-hover', date: L[32].date, dateISO: L[32].dateISO, detail: 'Monthly payroll batch processed. Total disbursement: Rp 4,150,000,000. 3 pending items.' },
  { id: '34', actor: 'Sari Dewi', initials: 'SD', action: 'Generated report', target: 'Headcount dashboard · Q3 2026', category: 'Reports', time: L[33].time, ip: '36.68.22.110', icon: FileText, color: 'bg-pink-50 text-pink-600', date: L[33].date, dateISO: L[33].dateISO, detail: 'Quarterly headcount report generated. Net increase: 12 employees.' },
  { id: '35', actor: 'Rina Sari', initials: 'RS', action: 'Approved expense claim', target: 'Andi Pratama · Conference · Rp 3,200,000', category: 'Expenses', time: L[34].time, ip: '103.28.14.21', icon: FileText, color: 'bg-emerald-50 text-emerald-600', date: L[34].date, dateISO: L[34].dateISO, detail: 'Conference attendance expense approved. Includes registration fee and travel.', before: { Status: 'Pending VP approval' }, after: { Status: 'Approved' } },
  /* ---- 36-40 ---- */
  { id: '36', actor: 'System', initials: 'SY', action: 'BPJS sync completed', target: 'Monthly BPJS sync · 475 employees', category: 'System', time: L[35].time, ip: 'Internal', icon: Settings, color: 'bg-surface-strong text-muted', date: L[35].date, dateISO: L[35].dateISO, detail: 'Automated monthly BPJS sync. 5 employees removed (resigned).' },
  { id: '37', actor: 'Dewi Lestari', initials: 'DL', action: 'Submitted leave request', target: 'Annual leave · 2 days', category: 'Leave', time: L[36].time, ip: '36.68.22.115', icon: ShieldCheck, color: 'bg-violet-50 text-violet-600', date: L[36].date, dateISO: L[36].dateISO, detail: 'Annual leave request for 1-2 Aug 2026. Remaining balance after approval: 10 days.' },
  { id: '38', actor: 'Rina Sari', initials: 'RS', action: 'Updated contract end date', target: 'Andi Pratama · EMP-20260101-003', category: 'Employee', time: L[37].time, ip: '103.28.14.21', icon: UserPlus, color: 'bg-primary-surface text-primary', date: L[37].date, dateISO: L[37].dateISO, detail: 'Contract extended following renewal negotiation.', before: { 'Contract end': '20 Sep 2026' }, after: { 'Contract end': '20 Sep 2027' } },
  { id: '39', actor: 'System', initials: 'SY', action: 'Generated report', target: 'Leave balance report · August 2026', category: 'Reports', time: L[38].time, ip: 'Internal', icon: FileText, color: 'bg-pink-50 text-pink-600', date: L[38].date, dateISO: L[38].dateISO, detail: 'Leave balance summary generated for all 475 active employees.' },
  { id: '40', actor: 'Andi Pratama', initials: 'AP', action: 'Logged in', target: 'Web application', category: 'Authentication', time: L[39].time, ip: '114.125.80.7', icon: LogIn, color: 'bg-amber-50 text-accent-yellow', date: L[39].date, dateISO: L[39].dateISO, detail: 'Login via SSO. Session started from Chrome on Windows 10.' },
  /* ---- 41-45 ---- */
  { id: '41', actor: 'Rina Sari', initials: 'RS', action: 'Approved leave request', target: 'Budi Hartono · Annual leave · 2 days', category: 'Leave', time: L[40].time, ip: '103.28.14.21', icon: ShieldCheck, color: 'bg-violet-50 text-violet-600', date: L[40].date, dateISO: L[40].dateISO, detail: 'Annual leave approved for 5-6 Jul 2026.' },
  { id: '42', actor: 'System', initials: 'SY', action: 'Payroll processed', target: 'July 2026 payroll · 470 employees', category: 'Payroll', time: L[41].time, ip: 'Internal', icon: Settings, color: 'bg-cta-surface text-cta-hover', date: L[41].date, dateISO: L[41].dateISO, detail: 'Monthly payroll batch processed. Total disbursement: Rp 4,050,000,000.' },
  { id: '43', actor: 'Sari Dewi', initials: 'SD', action: 'Updated employee department', target: 'Rizky Pratama · Engineering → Product', category: 'Employee', time: L[42].time, ip: '36.68.22.110', icon: UserPlus, color: 'bg-primary-surface text-primary', date: L[42].date, dateISO: L[42].dateISO, detail: 'Department transfer following internal request.', before: { Department: 'Engineering' }, after: { Department: 'Product' } },
  { id: '44', actor: 'Maya Anggraeni', initials: 'MA', action: 'Downloaded document', target: 'Payslip · July 2026', category: 'Documents', time: L[43].time, ip: '36.68.22.109', icon: FileText, color: 'bg-sky-50 text-sky-600', date: L[43].date, dateISO: L[43].dateISO, detail: 'Downloaded monthly payslip PDF. File size: 89KB.' },
  { id: '45', actor: 'System', initials: 'SY', action: 'Announcement posted', target: 'New remote work policy · Effective 1 Aug', category: 'System', time: L[44].time, ip: 'Internal', icon: Settings, color: 'bg-surface-strong text-muted', date: L[44].date, dateISO: L[44].dateISO, detail: 'Company-wide announcement regarding updated remote work policy for Q3 2026.' },
];

const categories = ['All activity', 'Employee', 'Payroll', 'Documents', 'Leave', 'Authentication', 'Reports', 'Expenses', 'System'];

/* derive unique actor / action lists for filters */
const uniqueActors = ['All actors', ...Array.from(new Set(auditEntries.map((e) => e.actor)))];
const uniqueActions = ['All actions', ...Array.from(new Set(auditEntries.map((e) => e.action)))];

/* ---------- Date range helper ---------- */
function inRange(isoDate: string, range: string): boolean {
  if (range === 'All time' || range === 'This year') return true;
  const d = new Date(isoDate);
  const now = new Date();
  if (range === 'Last 90 days') {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    return d >= cutoff;
  }
  if (range === 'Last 30 days') {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return d >= cutoff;
  }
  if (range === 'This month') {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }
  return true;
}

/* ---------- Detail Modal ---------- */
function DetailModal({ entry, onClose }: { entry: AuditEntry; onClose: () => void }) {
  const Icon = entry.icon;
  const hasBeforeAfter = entry.before && entry.after;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-canvas border border-hairline shadow-2xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center ${entry.color}`}><Icon size={18} /></div>
            <div><h2 className="text-base font-bold text-ink">{entry.action}</h2><p className="text-xs text-muted mt-0.5">{entry.time}</p></div>
          </div>
          <button onClick={onClose} aria-label="Close detail" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button>
        </div>
        <div className="mt-5 space-y-3 border-t border-hairline-soft pt-4">
          <div className="flex justify-between text-sm"><span className="text-muted">Actor</span><span className="font-semibold text-ink">{entry.actor}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted">Target</span><span className="font-semibold text-ink text-right max-w-[60%] truncate">{entry.target}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted">Category</span><span className="badge bg-surface-strong text-muted">{entry.category}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted">IP address</span><span className="font-mono text-xs text-ink">{entry.ip}</span></div>
          <div className="pt-3 border-t border-hairline-soft">
            <p className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-1.5">Details</p>
            <p className="text-xs text-body leading-relaxed">{entry.detail}</p>
          </div>
          {hasBeforeAfter && (
            <div className="pt-3 border-t border-hairline-soft">
              <p className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-2">Changes</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-hairline-soft">
                      <th className="text-left py-1.5 pr-3 font-semibold text-muted">Field</th>
                      <th className="text-left py-1.5 pr-3 font-semibold text-semantic-down">Before</th>
                      <th className="text-left py-1.5 font-semibold text-cta-hover">After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(entry.before!).map((field) => (
                      <tr key={field} className="border-b border-hairline-soft last:border-0">
                        <td className="py-1.5 pr-3 text-muted font-medium">{field}</td>
                        <td className="py-1.5 pr-3 text-body">{entry.before![field]}</td>
                        <td className="py-1.5 text-ink font-semibold">{entry.after![field]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Export Modal ---------- */
function ExportModal({ entries, onClose }: { entries: AuditEntry[]; onClose: () => void }) {
  const [expRange, setExpRange] = useState('all');
  const [expFormat, setExpFormat] = useState('csv');
  const { toast } = useToast();

  const handleExport = () => {
    const filtered = entries.filter((e) => inRange(e.dateISO, expRange === 'this-month' ? 'This month' : expRange === 'last-30' ? 'Last 30 days' : expRange === 'last-90' ? 'Last 90 days' : 'All time'));
    if (expFormat === 'csv') {
      downloadCsv(filtered, `audit-log-${new Date().toISOString().slice(0, 10)}.csv`, [
        { key: 'id', header: 'ID' },
        { key: 'actor', header: 'Actor' },
        { key: 'action', header: 'Action' },
        { key: 'target', header: 'Target' },
        { key: 'category', header: 'Category' },
        { key: 'time', header: 'Timestamp' },
        { key: 'ip', header: 'IP Address' },
        { key: 'detail', header: 'Detail' },
      ]);
      toast(`Audit log exported as CSV (${filtered.length} rows).`, 'success');
    } else {
      const json = JSON.stringify(filtered, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast(`Audit log exported as JSON (${filtered.length} rows).`, 'success');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-canvas border border-hairline shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-ink">Export audit log</h2>
          <button onClick={onClose} aria-label="Close export" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button>
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-ink">Date range
            <select value={expRange} onChange={(e) => setExpRange(e.target.value)} className="input-field mt-1.5">
              <option value="this-month">This month</option>
              <option value="last-30">Last 30 days</option>
              <option value="last-90">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </label>
          <label className="block text-sm font-semibold text-ink">Format
            <select value={expFormat} onChange={(e) => setExpFormat(e.target.value)} className="input-field mt-1.5">
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </label>
        </div>
        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-hairline-soft">
          <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button onClick={handleExport} className="btn-cta text-sm gap-2"><Download size={14} /> Export</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main Page ---------- */
export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All activity');
  const [dateRange, setDateRange] = useState('All time');
  const [actorFilter, setActorFilter] = useState('All actors');
  const [actionFilter, setActionFilter] = useState('All actions');
  const [selected, setSelected] = useState<AuditEntry | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { let active = true; api.get('/audit-log', { params: { search, category } }).then((response) => { if (active) setEntries(response.data.items ?? []); }).catch(() => toast('Unable to load audit log.', 'error')).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [category]);

  const uniqueActors = ['All actors', ...Array.from(new Set(entries.map((e) => e.actor)))];
  const uniqueActions = ['All actions', ...Array.from(new Set(entries.map((e) => e.action)))];
  const filtered = useMemo(() => entries.filter((entry) => {
    const matchesDate = inRange(entry.dateISO, dateRange);
    const matchesActor = actorFilter === 'All actors' || entry.actor === actorFilter;
    const matchesAction = actionFilter === 'All actions' || entry.action === actionFilter;
    return matchesDate && matchesActor && matchesAction;
  }), [entries, dateRange, actorFilter, actionFilter]);

  return (
    <div>
      <ModuleHeader eyebrow="Security & compliance" title="Audit Log" description="Track every important action across your organization" action={<button onClick={() => setShowExport(true)} className="btn-secondary gap-2"><Download size={15} /> Export log</button>} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <div className="card"><p className="text-xs text-muted font-semibold">Events this month</p><p className="mt-2 font-mono text-2xl font-bold text-ink">2,847</p><p className="text-xs text-cta mt-1">+18.4% from last month</p></div>
        <div className="card"><p className="text-xs text-muted font-semibold">Admin actions</p><p className="mt-2 font-mono text-2xl font-bold text-ink">486</p><p className="text-xs text-muted mt-1">17.1% of all activity</p></div>
        <div className="card"><p className="text-xs text-muted font-semibold">Security events</p><p className="mt-2 font-mono text-2xl font-bold text-ink">12</p><p className="text-xs text-cta mt-1">No critical events</p></div>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-hairline-soft space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm"><Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-soft" /><input type="search" aria-label="Search audit log" placeholder="Search activity..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full min-h-11 rounded-pill bg-surface-strong pl-9 pr-4 py-2.5 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
            <div className="flex gap-2">
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="min-h-10 px-3 rounded-pill bg-surface-strong text-xs font-semibold text-muted appearance-none pr-8 cursor-pointer"><option>All time</option><option>This month</option><option>Last 30 days</option><option>Last 90 days</option><option>This year</option></select>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Filter size={13} className="text-muted" />
              <select value={actorFilter} onChange={(e) => setActorFilter(e.target.value)} className="min-h-9 px-3 rounded-pill bg-surface-strong text-[11px] font-semibold text-muted appearance-none pr-8 cursor-pointer">
                {uniqueActors.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="min-h-9 px-3 rounded-pill bg-surface-strong text-[11px] font-semibold text-muted appearance-none pr-8 cursor-pointer">
                {uniqueActions.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`min-h-9 px-3 rounded-pill text-[11px] font-semibold whitespace-nowrap transition-colors ${category === item ? 'bg-primary text-white' : 'bg-surface-strong text-muted hover:text-ink'}`}>{item}</button>)}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead><tr className="border-b border-hairline"><th className="table-header">Activity</th><th className="table-header">Category</th><th className="table-header">Timestamp</th><th className="table-header">IP address</th><th className="table-header w-12"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5}><div className="p-8 text-center text-sm text-muted">Loading audit log…</div></td></tr> : filtered.length === 0 ? <tr><td colSpan={5}><EmptyState title="No activity matches your filters" description="Try a different search term, category, or date range." /></td></tr> : filtered.map((entry) => {
                const Icon = entry.icon;
                return <tr key={entry.id} className="table-row cursor-pointer" onClick={() => setSelected(entry)}><td className="table-cell"><div className="flex items-center gap-3"><div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${entry.color}`}><Icon size={15} /></div><div className="min-w-0"><p className="text-sm font-semibold text-ink">{entry.action}</p><p className="text-xs text-muted mt-0.5 truncate">{entry.actor} · {entry.target}</p></div></div></td><td className="table-cell"><span className="badge bg-surface-strong text-muted">{entry.category}</span></td><td className="table-cell text-xs text-body whitespace-nowrap">{entry.time}</td><td className="table-cell text-xs font-mono text-muted">{entry.ip}</td><td className="table-cell"><button onClick={(e) => { e.stopPropagation(); setSelected(entry); }} aria-label={`Details for ${entry.action}`} className="min-h-10 min-w-10 rounded-md hover:bg-primary-surface"><MoreHorizontal size={16} className="mx-auto text-muted" /></button></td></tr>;
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-hairline-soft flex items-center justify-between text-xs text-muted">
          <span>Showing {filtered.length} of {entries.length} recent events</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} className="text-cta" /> Logs retained for 7 years</span>
        </div>
      </div>
      {selected && <DetailModal entry={selected} onClose={() => setSelected(null)} />}
      {showExport && <ExportModal entries={filtered} onClose={() => setShowExport(false)} />}
    </div>
  );
}
