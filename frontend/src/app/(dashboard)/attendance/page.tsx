'use client';

import { useState, useMemo } from 'react';
import {
  Users, Clock, AlertTriangle, CheckCircle2, Search, X, ChevronLeft, ChevronRight,
  UserPlus, MapPin, CalendarDays, FileText,
} from 'lucide-react';
import ModuleHeader from '@/components/ui/ModuleHeader';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

type AttendanceStatus = 'present' | 'late' | 'absent' | 'half-day' | 'leave' | 'wfh';

type AttendanceRecord = {
  id: string;
  name: string;
  initials: string;
  department: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  hours: string;
  date: string;
  isManual?: boolean;
};

const statusMeta: Record<AttendanceStatus, { label: string; color: string }> = {
  present: { label: 'Present', color: 'bg-cta-surface text-cta-hover' },
  late: { label: 'Late', color: 'bg-amber-50 text-accent-yellow' },
  absent: { label: 'Absent', color: 'bg-red-50 text-semantic-down' },
  'half-day': { label: 'Half Day', color: 'bg-primary-surface text-primary' },
  leave: { label: 'On Leave', color: 'bg-surface-strong text-muted' },
  wfh: { label: 'WFH', color: 'bg-sky-50 text-sky-600' },
};

function generateWeekDates(offset: number): { label: string; short: string; dayNum: number; isToday: boolean }[] {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + offset * 7);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  return dayNames.map((name, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const isToday = d.toDateString() === today.toDateString();
    return { label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), short: name, dayNum: d.getDate(), isToday };
  });
}

const employees = [
  { id: '1', name: 'Rina Sari', initials: 'RS', department: 'HR' },
  { id: '2', name: 'Budi Hartono', initials: 'BH', department: 'Engineering' },
  { id: '3', name: 'Sari Dewi', initials: 'SD', department: 'Marketing' },
  { id: '4', name: 'Andi Pratama', initials: 'AP', department: 'Finance' },
  { id: '5', name: 'Dewi Lestari', initials: 'DL', department: 'HR' },
  { id: '6', name: 'Rizky Prasetyo', initials: 'RP', department: 'Engineering' },
  { id: '7', name: 'Maya Anggraeni', initials: 'MA', department: 'Design' },
  { id: '8', name: 'Fajar Nugroho', initials: 'FN', department: 'Engineering' },
];

function mockForDate(dateOffset: number): AttendanceRecord[] {
  const base = employees;
  const statuses: AttendanceStatus[] = ['present', 'late', 'present', 'absent', 'half-day', 'present', 'present', 'leave'];
  const times = ['08:55', '09:12', '08:30', null, '08:00', '08:58', '07:45', null];
  const outs = ['17:05', null, '17:00', null, '13:00', '17:02', '16:50', null];
  const hours = ['8h 10m', '—', '8h 30m', '—', '5h 00m', '8h 04m', '9h 05m', '—'];
  const seed = dateOffset * 7 + 3;
  return base.map((emp, i) => {
    const statusIdx = (i + seed) % statuses.length;
    const status = statuses[statusIdx];
    const isAbsent = status === 'absent' || status === 'leave';
    return {
      id: `${dateOffset}-${emp.id}`,
      name: emp.name,
      initials: emp.initials,
      department: emp.department,
      checkIn: isAbsent ? null : times[statusIdx],
      checkOut: isAbsent ? null : outs[statusIdx],
      status,
      hours: isAbsent ? '—' : hours[statusIdx],
      date: '22 Sep 2026',
    };
  });
}

export default function AttendancePage() {
  const [search, setSearch] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date();
    return (today.getDay() + 6) % 7;
  });
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [confirmClockOut, setConfirmClockOut] = useState(false);
  const { toast } = useToast();

  const weekDates = useMemo(() => generateWeekDates(weekOffset), [weekOffset]);
  const mockData = useMemo(() => mockForDate(weekOffset + selectedDay), [weekOffset, selectedDay]);

  const filtered = mockData.filter((row) => row.name.toLowerCase().includes(search.toLowerCase()));
  const presentCount = filtered.filter((r) => r.status === 'present').length;
  const lateCount = filtered.filter((r) => r.status === 'late').length;
  const absentCount = filtered.filter((r) => r.status === 'absent' || r.status === 'leave').length;
  const avgHours = filtered.filter((r) => r.status === 'present' || r.status === 'late').reduce((sum, r) => {
    const h = parseFloat(r.hours);
    return sum + (isNaN(h) ? 0 : h);
  }, 0);
  const avgHoursCount = filtered.filter((r) => r.status === 'present' || r.status === 'late' || r.status === 'half-day').length || 1;

  const handleClockIn = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    setClockInTime(time);
    setClockedIn(true);
    toast(`Clock in recorded at ${time}.`, 'success');
  };

  const handleClockOut = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    setClockedIn(false);
    setClockInTime(null);
    setConfirmClockOut(false);
    toast(`Clock out recorded at ${time}. Hours worked calculated automatically.`, 'success');
  };

  const submitManualEntry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const employee = String(form.get('employee') || '').trim();
    const date = String(form.get('date') || '');
    const checkIn = String(form.get('checkIn') || '');
    const checkOut = String(form.get('checkOut') || '');
    const reason = String(form.get('reason') || '').trim();
    if (!employee || !date || !checkIn) {
      toast('Employee, date, and check-in time are required.', 'error');
      return;
    }
    setShowManualEntry(false);
    toast(`Attendance record added for ${employee}. Pending HR Manager approval.`, 'success');
  };

  return (
    <div>
      <ModuleHeader eyebrow="Time & attendance" title="Attendance" description="Track daily attendance, punctuality, and team hours" action={<div className="flex gap-2"><button onClick={() => setShowManualEntry(true)} className="btn-secondary gap-2"><UserPlus size={15} /> Manual entry</button>{clockedIn ? <button onClick={() => setConfirmClockOut(true)} className="btn-cta gap-2 bg-semantic-down hover:bg-semantic-down/90 text-white border-semantic-down"><Clock size={15} /> Clock out</button> : <button onClick={handleClockIn} className="btn-cta gap-2"><Clock size={15} /> Clock in</button>}</div>} />

      {clockedIn && (
        <div className="rounded-xl border border-cta/30 bg-cta-surface p-4 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-cta flex items-center justify-center shrink-0">
            <Clock size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-ink">You are clocked in</p>
            <p className="text-xs text-muted">Checked in at {clockInTime} · Working time in progress</p>
          </div>
          <span className="font-mono text-lg font-bold text-cta">Active</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard icon={CheckCircle2} label="Present" value={String(presentCount)} tone="green" detail={`${((presentCount / filtered.length) * 100).toFixed(1)}% attendance rate`} />
        <StatCard icon={AlertTriangle} label="Late" value={String(lateCount)} tone="amber" detail={`${((lateCount / filtered.length) * 100).toFixed(1)}% of team`} />
        <StatCard icon={Clock} label="Average hours" value={`${(avgHours / avgHoursCount).toFixed(1)}h`} tone="primary" detail="This day's average" />
        <StatCard icon={Users} label="Absent" value={String(absentCount)} tone="red" detail="Includes leave + no-show" />
      </div>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => { setWeekOffset((w) => w - 1); }} className="min-h-10 min-w-10 rounded-md hover:bg-primary-surface" aria-label="Previous week"><ChevronLeft size={16} className="text-muted mx-auto" /></button>
          <h2 className="text-sm font-bold text-ink">{weekOffset === 0 ? 'This week' : weekOffset < 0 ? `${Math.abs(weekOffset)} week(s) ago` : `${weekOffset} week(s) ahead`}</h2>
          <button onClick={() => { setWeekOffset((w) => w + 1); }} className="min-h-10 min-w-10 rounded-md hover:bg-primary-surface" aria-label="Next week"><ChevronRight size={16} className="text-muted mx-auto" /></button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {weekDates.map((day, i) => (
            <button key={i} onClick={() => setSelectedDay(i)} className={`flex-1 min-w-[80px] rounded-lg border p-3 text-center transition-colors cursor-pointer ${i === selectedDay ? 'border-primary bg-primary-surface' : 'border-hairline bg-canvas hover:border-primary-light'}`}>
              <p className={`text-[11px] font-semibold uppercase ${i === selectedDay ? 'text-primary' : 'text-muted'}`}>{day.short}</p>
              <p className={`text-xs mt-1 ${day.isToday ? 'text-primary font-semibold' : 'text-body'}`}>{day.label}</p>
              {day.isToday && <span className="inline-block mt-1.5 px-2 py-0.5 rounded-pill bg-primary text-white text-[9px] font-bold">TODAY</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-hairline-soft flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative max-w-xs flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-soft" />
            <input type="search" aria-label="Search attendance" placeholder="Search by name..." value={search} onChange={(event) => setSearch(event.target.value)} className="w-full min-h-10 rounded-pill bg-surface-strong pl-9 pr-3 py-2 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <p className="text-xs text-muted">{filtered.length} records</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-hairline">
                <th className="table-header">Employee</th>
                <th className="table-header">Department</th>
                <th className="table-header">Check In</th>
                <th className="table-header">Check Out</th>
                <th className="table-header">Hours</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}><EmptyState title="No attendance records found" description="Try another search term." /></td></tr>
              ) : filtered.map((row) => (
                <tr key={row.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-surface flex items-center justify-center shrink-0"><span className="text-[11px] font-bold text-primary">{row.initials}</span></div>
                      <span className="font-semibold text-ink">{row.name}</span>
                    </div>
                  </td>
                  <td className="table-cell text-body">{row.department}</td>
                  <td className="table-cell font-mono text-xs text-ink">{row.checkIn ?? '—'}</td>
                  <td className="table-cell font-mono text-xs text-ink">{row.checkOut ?? '—'}</td>
                  <td className="table-cell font-mono text-xs text-ink">{row.hours}</td>
                  <td className="table-cell"><span className={`badge capitalize ${statusMeta[row.status]?.color}`}>{statusMeta[row.status]?.label}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 border-t border-hairline-soft">
          <p className="text-xs text-muted">Showing {filtered.length} of {mockData.length} employees</p>
        </div>
      </div>

      <ConfirmDialog open={confirmClockOut} title="Clock out now?" description="Your working hours will be calculated based on your clock-in time." confirmLabel="Clock out" variant="primary" onConfirm={handleClockOut} onCancel={() => setConfirmClockOut(false)} />

      {showManualEntry && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setShowManualEntry(false)} />
          <form onSubmit={submitManualEntry} className="relative w-full max-w-md rounded-2xl bg-canvas border border-hairline shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div><h2 className="text-base font-bold text-ink">Manual attendance entry</h2><p className="text-xs text-muted mt-1">For cases where system check-in fails</p></div>
              <button type="button" onClick={() => setShowManualEntry(false)} aria-label="Close manual entry form" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-ink">Employee<select name="employee" required className="input-field mt-1.5"><option value="">Select employee...</option>{employees.map((emp) => <option key={emp.id}>{emp.name}</option>)}</select></label>
              <label className="block text-sm font-semibold text-ink">Date<input name="date" type="date" required className="input-field mt-1.5" /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-semibold text-ink">Check-in time<input name="checkIn" type="time" required className="input-field mt-1.5" /></label>
                <label className="block text-sm font-semibold text-ink">Check-out time<input name="checkOut" type="time" className="input-field mt-1.5" /></label>
              </div>
              <label className="block text-sm font-semibold text-ink">Reason<textarea name="reason" rows={2} required placeholder="Explain why manual entry is needed..." className="input-field mt-1.5" /></label>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-hairline-soft">
              <button type="button" onClick={() => setShowManualEntry(false)} className="btn-secondary text-sm">Cancel</button>
              <button type="submit" className="btn-cta text-sm gap-2"><FileText size={14} /> Submit entry</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
