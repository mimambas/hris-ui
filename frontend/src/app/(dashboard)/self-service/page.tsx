'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { AlertCircle, CalendarDays, CheckCircle2, Clock, Download, Pencil, Wallet, X } from 'lucide-react';
import ModuleHeader from '@/components/ui/ModuleHeader';
import { useToast } from '@/components/ui/Toast';

type Tab = 'Overview' | 'Payslips' | 'Leave' | 'Attendance' | 'Profile';
type LeaveStatus = 'Approved' | 'Pending' | 'Rejected';

const profile = {
  name: 'Rina Sari', employeeId: 'EMP-20260101-001', email: 'rina.sari@company.com',
  phone: '+628123456789', nik: '3201234567890001', npwp: '12.345.678.9-012.000',
  department: 'Human Resources', position: 'HR Manager',
  address: 'Jl. Sudirman No. 123, Jakarta Selatan',
  emergencyContact: 'Budi Sari - +628987654321 (Spouse)',
  bank: 'BCA - 1234567890',
};

const payslips = [
  { month: 'September 2026', gross: 16500000, deductions: 3105000, net: 13395000 },
  { month: 'August 2026', gross: 16500000, deductions: 3105000, net: 13395000 },
  { month: 'July 2026', gross: 16500000, deductions: 3105000, net: 13395000 },
  { month: 'June 2026', gross: 16500000, deductions: 3105000, net: 13395000 },
  { month: 'May 2026', gross: 16500000, deductions: 3105000, net: 13395000 },
  { month: 'April 2026', gross: 16500000, deductions: 3105000, net: 13395000 },
];

const leaveHistory = [
  { type: 'Annual', dates: '12-14 Aug 2026', days: 3, status: 'Approved' as LeaveStatus },
  { type: 'Sick', dates: '03 Jun 2026', days: 1, status: 'Approved' as LeaveStatus },
  { type: 'Annual', dates: '20-21 Apr 2026', days: 2, status: 'Approved' as LeaveStatus },
  { type: 'Personal', dates: '10 Mar 2026', days: 1, status: 'Approved' as LeaveStatus },
  { type: 'Annual', dates: '22-24 Sep 2026', days: 3, status: 'Pending' as LeaveStatus },
];

const weeklyAttendance = [
  { day: 'Mon', date: '21 Sep', in: '08:02', out: '17:04', status: 'Present', hours: '8h 02m' },
  { day: 'Tue', date: '22 Sep', in: '08:15', out: '17:00', status: 'Late', hours: '7h 45m' },
  { day: 'Wed', date: '23 Sep', in: '07:58', out: '17:08', status: 'Present', hours: '8h 10m' },
  { day: 'Thu', date: '24 Sep', in: '--', out: '--', status: 'Leave', hours: '--' },
  { day: 'Fri', date: '25 Sep', in: '08:01', out: '17:02', status: 'Present', hours: '8h 01m' },
];

function rupiah(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`;
}

function downloadPayslip(data: typeof payslips[number]) {
  const content = [
    'HRIS PAYSLIP',
    `Employee,${profile.name}`,
    `Employee ID,${profile.employeeId}`,
    `Period,${data.month}`,
    '',
    'Item,Amount',
    `Gross salary,${data.gross}`,
    `Deductions,${data.deductions}`,
    `Net salary,${data.net}`,
  ].join('\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `payslip-${data.month.toLowerCase().replace(/\s+/g, '-')}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function Progress({ value, max }: { value: number; max: number }) {
  const pct = Math.round(value / max * 100);
  return (
    <div className="h-2 rounded-full bg-surface-strong overflow-hidden">
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatusBadge({ status }: { status: LeaveStatus }) {
  const cls = status === 'Approved'
    ? 'bg-cta-surface text-cta'
    : status === 'Pending'
      ? 'bg-amber-50 text-accent-yellow'
      : 'bg-red-50 text-semantic-down';
  return <span className={`badge ${cls}`}>{status}</span>;
}

export default function SelfServicePage() {
  const [tab, setTab] = useState<Tab>('Overview');
  const [payslip, setPayslip] = useState<typeof payslips[number] | null>(null);
  const [showLeave, setShowLeave] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [clockedIn, setClockedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [serverProfile, setServerProfile] = useState<any>(null);
  const [serverPayslips, setServerPayslips] = useState<any[]>([]);
  const [serverLeaves, setServerLeaves] = useState<any[]>([]);
  const [serverAttendance, setServerAttendance] = useState<any[]>([]);
  const [leaveForm, setLeaveForm] = useState({ type: 'Annual', start: '', end: '', reason: '' });
  const [formError, setFormError] = useState('');
  const [profileForm, setProfileForm] = useState({
    phone: profile.phone, address: profile.address, emergency: profile.emergencyContact,
  });
  const { toast } = useToast();
  const loadSelfService = async () => {
    setLoading(true);
    try {
      const me = await api.get('/auth/me');
      const employee = me.data.employee_id ? await api.get(`/employees/${me.data.employee_id}`) : null;
      const [leaves, attendance, documents] = await Promise.all([
        api.get('/leave', { params: { employee_id: me.data.employee_id, per_page: 100 } }),
        api.get('/attendance', { params: { employee_id: me.data.employee_id, per_page: 100 } }),
        api.get('/documents', { params: { per_page: 100 } }),
      ]);
      setServerProfile(employee?.data ?? null);
      setServerLeaves(leaves.data.items ?? []);
      setServerAttendance(attendance.data.items ?? []);
      const open = (attendance.data.items ?? []).some((row: any) => row.check_in_time && !row.check_out_time);
      setClockedIn(open);
      setServerPayslips([]);
      if (employee?.data) setProfileForm((current) => ({ ...current, phone: employee.data.phone ?? '', address: employee.data.address_domisili ?? employee.data.address_ktp ?? '', emergency: `${employee.data.emergency_contact_name ?? ''} ${employee.data.emergency_contact_phone ?? ''}`.trim() }));
    } catch (error: any) { toast(error.response?.data?.detail || 'Unable to load your workspace.', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void loadSelfService(); }, []);

  const leaveDays = useMemo(() => {
    if (!leaveForm.start || !leaveForm.end) return 0;
    const diff = new Date(leaveForm.end).getTime() - new Date(leaveForm.start).getTime();
    return diff >= 0 ? Math.floor(diff / 86400000) + 1 : 0;
  }, [leaveForm.start, leaveForm.end]);

  const submitLeave = async () => {
    if (!leaveForm.start || !leaveForm.end || leaveDays < 1) {
      return setFormError('Choose a valid start and end date.');
    }
    if (!leaveForm.reason.trim()) return setFormError('Reason is required.');
    setFormError('');
    try { await api.post('/leave', { leave_type: leaveForm.type.toLowerCase(), start_date: leaveForm.start, end_date: leaveForm.end, reason: leaveForm.reason }); setShowLeave(false); setLeaveForm({ type: 'Annual', start: '', end: '', reason: '' }); await loadSelfService(); toast('Leave request submitted for approval.', 'success'); } catch (error: any) { toast(error.response?.data?.detail || 'Unable to submit leave request.', 'error'); }
  };

  const saveProfile = async () => {
    if (!/^\+?[0-9\s-]{10,}$/.test(profileForm.phone)) {
      return toast('Enter a valid phone number.', 'error');
    }
    if (!profileForm.address.trim() || !profileForm.emergency.trim()) {
      return toast('Address and emergency contact are required.', 'error');
    }
    try { if (!serverProfile?.id) throw new Error('Employee profile unavailable'); await api.put(`/employees/${serverProfile.id}`, { phone: profileForm.phone, address_domisili: profileForm.address, emergency_contact_name: profileForm.emergency.split(' - ')[0], emergency_contact_phone: profileForm.emergency.match(/\+?[0-9\s-]+/)?.[0]?.trim() ?? profileForm.emergency }); setShowProfile(false); await loadSelfService(); toast('Profile updated successfully.', 'success'); } catch (error: any) { toast(error.response?.data?.detail || error.message || 'Unable to update profile.', 'error'); }
  };

  return (
    <div>
      <ModuleHeader
        eyebrow="Employee self-service"
        title="My workspace"
        description="View your payroll, leave, attendance, and personal information"
      />
      <div className="flex gap-1 overflow-x-auto border-b border-hairline mb-6" role="tablist">
        {(['Overview', 'Payslips', 'Leave', 'Attendance', 'Profile'] as Tab[]).map((item) => (
          <button
            key={item}
            role="tab"
            aria-selected={tab === item}
            onClick={() => setTab(item)}
            className={`min-h-11 px-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              tab === item ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === 'Overview' && <Overview onTab={setTab} person={serverProfile} />}
      {tab === 'Payslips' && (
        <PayslipsTab
          payslips={serverPayslips}
          onView={setPayslip}
          onDownload={(data) => { downloadPayslip(data); toast('Payslip download started.', 'success'); }}
        />
      )}
      {tab === 'Leave' && <LeaveTab leaves={serverLeaves} onRequest={() => setShowLeave(true)} />}
      {tab === 'Attendance' && (
        <AttendanceTab
          attendance={serverAttendance}
          clockedIn={clockedIn}
          onClock={() => {
            setClockedIn(!clockedIn);
            toast(clockedIn ? 'Clocked out successfully.' : 'Clocked in successfully.', 'success');
          }}
        />
      )}
      {tab === 'Profile' && <ProfileTab onEdit={() => setShowProfile(true)} person={serverProfile} />}

      {payslip && (
        <PayslipModal
          data={payslip}
          onClose={() => setPayslip(null)}
          onDownload={() => { downloadPayslip(payslip); toast('Payslip PDF download started.', 'success'); }}
        />
      )}
      {showLeave && (
        <LeaveModal
          form={leaveForm}
          setForm={setLeaveForm}
          days={leaveDays}
          error={formError}
          onClose={() => { setShowLeave(false); setFormError(''); }}
          onSubmit={submitLeave}
        />
      )}
      {showProfile && (
        <ProfileModal
          form={profileForm}
          setForm={setProfileForm}
          onClose={() => setShowProfile(false)}
          onSave={saveProfile}
        />
      )}
    </div>
  );
}

/* ─── Tab: Overview ─── */

function Overview({ onTab, person }: { onTab: (t: Tab) => void; person?: any }) {
  const name = person?.full_name ?? profile.name;
  const initials = name.split(/\s+/).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="space-y-5">
      <div className="card bg-primary-surface border-primary/10 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0">
          <span className="text-lg font-bold text-white">{initials}</span>
        </div>
        <div>
          <p className="text-xs font-semibold text-primary">Good morning, {name.split(' ')[0]}</p>
          <h2 className="text-xl font-bold text-ink mt-1">Welcome back, {name}</h2>
          <p className="text-sm text-body mt-1">Here is your personal HR workspace.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Leave balance', value: '9 / 12 days', hint: 'Annual leave remaining', icon: CalendarDays, action: () => onTab('Leave') },
          { label: 'Next payday', value: '28 Sep 2026', hint: '6 days from now', icon: Wallet, action: () => onTab('Payslips') },
          { label: 'Attendance rate', value: '94.7%', hint: 'This month', icon: Clock, action: () => onTab('Attendance') },
          { label: 'Pending approvals', value: '1', hint: 'Leave request waiting', icon: AlertCircle, action: () => onTab('Leave') },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} onClick={item.action} className="card text-left hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">{item.label}</span>
                <Icon size={16} className="text-primary" />
              </div>
              <p className="text-xl font-mono font-bold text-ink mt-3">{item.value}</p>
              <p className="text-[11px] text-muted mt-1">{item.hint}</p>
            </button>
          );
        })}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-ink">Recent activity</h2>
          <button onClick={() => onTab('Payslips')} className="text-xs font-semibold text-primary">View payslips</button>
        </div>
        <div className="space-y-4">
          {[
            'September payslip is ready to view',
            'Leave request for 22-24 Sep submitted',
            'August attendance finalized',
            'Profile information was updated',
            'July payslip downloaded',
          ].map((item, i) => (
            <div key={item} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i === 1 ? 'bg-primary-surface text-primary' : 'bg-cta-surface text-cta'}`}>
                <CheckCircle2 size={14} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-ink">{item}</p>
                <p className="text-[11px] text-muted mt-0.5">{i + 1} {i === 0 ? 'hour' : 'days'} ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Tab: Payslips ─── */

function PayslipsTab({ payslips: rows, onView, onDownload }: { payslips: typeof payslips; onView: (d: typeof payslips[number]) => void; onDownload: (d: typeof payslips[number]) => void }) {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-primary-surface flex items-center justify-center">
          <Wallet size={17} className="text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-ink">My payslips</h2>
          <p className="text-xs text-muted mt-0.5">Monthly salary statements</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-hairline">
              {['Month', 'Gross', 'Deductions', 'Net pay', 'Status', 'Actions'].map((h) => (
                <th key={h} className="table-header">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.month} className="table-row">
                <td className="table-cell font-semibold text-ink">{row.month}</td>
                <td className="table-cell text-body font-mono">{rupiah(row.gross)}</td>
                <td className="table-cell text-body font-mono">{rupiah(row.deductions)}</td>
                <td className="table-cell text-ink font-mono font-semibold">{rupiah(row.net)}</td>
                <td className="table-cell"><span className="badge bg-cta-surface text-cta">Paid</span></td>
                <td className="table-cell">
                  <div className="flex gap-1">
                    <button onClick={() => onView(row)} className="min-h-9 px-3 rounded-lg text-xs font-semibold text-primary hover:bg-primary-surface">View</button>
                    <button onClick={() => onDownload(row)} className="min-h-9 min-w-9 rounded-lg hover:bg-primary-surface flex items-center justify-center" aria-label={`Download ${row.month}`}>
                      <Download size={14} className="text-muted" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Tab: Leave ─── */

function LeaveTab({ leaves, onRequest }: { leaves: any[]; onRequest: () => void }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-ink">My leave</h2>
          <p className="text-xs text-muted mt-1">Track your balance and requests</p>
        </div>
        <button onClick={onRequest} className="btn-primary gap-2 text-sm">
          <CalendarDays size={14} /> Request leave
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[{ label: 'Annual leave', used: 3, total: 12 }, { label: 'Sick leave', used: 2, total: 12 }, { label: 'Personal leave', used: 1, total: 3 }].map((item) => (
          <div className="card" key={item.label}>
            <p className="text-xs text-muted">{item.label}</p>
            <p className="text-xl font-mono font-bold text-ink mt-2">
              {item.total - item.used} <span className="text-xs font-sans font-normal text-muted">of {item.total} days left</span>
            </p>
            <div className="mt-3"><Progress value={item.total - item.used} max={item.total} /></div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-sm font-bold text-ink mb-4">Request history</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-hairline">
                {['Type', 'Dates', 'Days', 'Status'].map((h) => <th key={h} className="table-header">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? <tr><td colSpan={4} className="py-8 text-center text-sm text-muted">No leave requests yet.</td></tr> : leaves.map((row) => <tr key={row.id} className="table-row"><td className="table-cell font-semibold text-ink">{row.leave_type}</td><td className="table-cell text-body">{row.start_date} – {row.end_date}</td><td className="table-cell text-body">{row.total_days}</td><td className="table-cell"><StatusBadge status={row.status === 'approved' ? 'Approved' : row.status === 'rejected' ? 'Rejected' : 'Pending'} /></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Tab: Attendance ─── */

function AttendanceTab({ attendance, clockedIn, onClock }: { attendance: any[]; clockedIn: boolean; onClock: () => void }) {
  return (
    <div className="space-y-5">
      <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted">Today, 25 September 2026</p>
          <h2 className="text-lg font-bold text-ink mt-1">{clockedIn ? 'You are clocked in' : 'Ready to start your day?'}</h2>
          <p className="text-xs text-muted mt-1">{clockedIn ? 'Your working time is being recorded.' : 'Clock in when you begin working.'}</p>
        </div>
        <button onClick={onClock} className={clockedIn ? 'btn-secondary gap-2' : 'btn-cta gap-2'}>
          <Clock size={15} /> {clockedIn ? 'Clock out' : 'Clock in'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {([['Present days', '18'], ['Late arrivals', '1'], ['Absent days', '0'], ['Average hours', '8h 02m']] as [string, string][]).map(([label, value]) => (
          <div className="card" key={label}>
            <p className="text-xs text-muted">{label}</p>
            <p className="text-xl font-mono font-bold text-ink mt-2">{value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-sm font-bold text-ink mb-4">This week</h2>
        <div className="space-y-2">
          {attendance.length === 0 ? <p className="py-8 text-center text-sm text-muted">No attendance records yet.</p> : attendance.map((row: any) => (
            <div key={row.id} className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-center rounded-lg border border-hairline-soft p-3">
              <div><p className="text-sm font-semibold text-ink">{row.date}</p><p className="text-[11px] text-muted">{row.status}</p></div>
              <span className="text-sm font-mono text-body">In {row.check_in_time ?? '—'}</span>
              <span className="text-sm font-mono text-body">Out {row.check_out_time ?? '—'}</span>
              <span className="badge w-fit bg-cta-surface text-cta">{row.status}</span>
              <span className="text-sm font-mono text-muted hidden sm:block">{row.hours}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Tab: Profile ─── */

function ProfileTab({ onEdit, person }: { onEdit: () => void; person?: any }) {
  const current = person ?? profile;
  const fields: [string, string][] = [
    ['Full name', current.full_name ?? profile.name],
    ['Employee ID', current.employee_id ?? profile.employeeId],
    ['Email', current.email ?? profile.email],
    ['Phone', current.phone ?? profile.phone],
    ['Department', current.department ?? profile.department],
    ['Position', current.position ?? profile.position],
    ['NIK', current.nik ?? profile.nik],
    ['NPWP', profile.npwp],
    ['Address', profile.address],
    ['Emergency contact', profile.emergencyContact],
    ['Bank account', profile.bank],
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-surface flex items-center justify-center text-primary font-bold">RS</div>
          <div>
            <h2 className="text-base font-bold text-ink">Personal information</h2>
            <p className="text-xs text-muted mt-1">Keep your contact details up to date</p>
          </div>
        </div>
        <button onClick={onEdit} className="btn-secondary gap-2 text-xs"><Pencil size={13} /> Edit profile</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {fields.map(([label, value]) => (
          <div key={label}>
            <p className="text-xs text-muted">{label}</p>
            <p className="text-sm text-ink mt-1 break-words">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Modal: Payslip Detail ─── */

function PayslipModal({ data, onClose, onDownload }: { data: typeof payslips[number]; onClose: () => void; onDownload: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-canvas border border-hairline shadow-2xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-muted">Payslip statement</p>
            <h2 className="text-lg font-bold text-ink mt-1">{data.month}</h2>
            <p className="text-xs text-muted mt-1">{profile.name} - {profile.employeeId}</p>
          </div>
          <button onClick={onClose} className="btn-secondary min-h-9 min-w-9 px-2" aria-label="Close"><X size={14} /></button>
        </div>
        <div className="mt-6 space-y-3">
          <PayslipBreakdown title="Earnings" rows={[['Basic salary', 15000000], ['Allowance', 1000000], ['Overtime', 500000]]} />
          <PayslipBreakdown title="Deductions" rows={[['PPh 21', 1800000], ['BPJS Kesehatan', 660000], ['BPJS Ketenagakerjaan', 450000], ['Other deductions', 95000]]} />
          <div className="rounded-xl bg-primary-surface p-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-primary">Net salary</span>
            <span className="text-lg font-mono font-bold text-ink">{rupiah(data.net)}</span>
          </div>
        </div>
        <button onClick={onDownload} className="btn-primary w-full gap-2 mt-6"><Download size={14} /> Download PDF</button>
      </div>
    </div>
  );
}

function PayslipBreakdown({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div>
      <p className="text-xs font-bold text-ink mb-2">{title}</p>
      {rows.map(([label, value]) => (
        <div className="flex justify-between py-1.5 text-sm" key={label}>
          <span className="text-muted">{label}</span>
          <span className="font-mono text-body">{rupiah(value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Modal: Leave Request ─── */

function LeaveModal({ form, setForm, days, error, onClose, onSubmit }: {
  form: { type: string; start: string; end: string; reason: string };
  setForm: (f: { type: string; start: string; end: string; reason: string }) => void;
  days: number; error: string; onClose: () => void; onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-canvas border border-hairline shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-ink">Request leave</h2>
            <p className="text-xs text-muted mt-1">Submit a request for manager approval</p>
          </div>
          <button onClick={onClose} className="btn-secondary min-h-9 min-w-9 px-2"><X size={14} /></button>
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-ink">
            Leave type
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field mt-1.5">
              <option>Annual</option><option>Sick</option><option>Personal</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-semibold text-ink">
              Start date
              <input type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} className="input-field mt-1.5" />
            </label>
            <label className="block text-sm font-semibold text-ink">
              End date
              <input type="date" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} className="input-field mt-1.5" />
            </label>
          </div>
          <div className="rounded-lg bg-surface-soft p-3 text-sm text-body">
            Requested days: <strong className="font-mono text-ink">{days || '--'}</strong>
          </div>
          <label className="block text-sm font-semibold text-ink">
            Reason
            <textarea
              rows={3} value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="input-field mt-1.5"
              placeholder="Tell your manager why you need leave..."
            />
          </label>
          {error && <p className="text-xs text-semantic-down" role="alert">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-hairline-soft">
          <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button onClick={onSubmit} className="btn-primary text-sm">Submit request</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal: Edit Profile ─── */

function ProfileModal({ form, setForm, onClose, onSave }: {
  form: { phone: string; address: string; emergency: string };
  setForm: (f: { phone: string; address: string; emergency: string }) => void;
  onClose: () => void; onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-canvas border border-hairline shadow-2xl p-6">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-base font-bold text-ink">Edit profile</h2>
            <p className="text-xs text-muted mt-1">Update your contact details</p>
          </div>
          <button onClick={onClose} className="btn-secondary min-h-9 min-w-9 px-2"><X size={14} /></button>
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-ink">
            Phone
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field mt-1.5" />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Address
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="input-field mt-1.5" />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Emergency contact
            <input value={form.emergency} onChange={(e) => setForm({ ...form, emergency: e.target.value })} className="input-field mt-1.5" />
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-hairline-soft">
          <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button onClick={onSave} className="btn-primary text-sm">Save changes</button>
        </div>
      </div>
    </div>
  );
}
