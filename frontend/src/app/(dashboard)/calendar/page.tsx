'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react';
import ModuleHeader from '@/components/ui/ModuleHeader';
import { useToast } from '@/components/ui/Toast';

type LeaveType = 'Annual Leave' | 'Sick Leave' | 'Personal Leave';

type LeaveEvent = {
  id: string;
  employee: string;
  department: string;
  type: LeaveType;
  from: string;
  to: string;
};

type DayRecord = {
  status: 'present' | 'absent' | 'late' | 'wfh';
};

const departments = ['All', 'Engineering', 'Design', 'Marketing', 'HR', 'Finance', 'Operations'] as const;

const employees = [
  { name: 'Budi Hartono', department: 'Engineering' },
  { name: 'Sari Dewi', department: 'Marketing' },
  { name: 'Andi Pratama', department: 'Finance' },
  { name: 'Maya Anggraeni', department: 'Design' },
  { name: 'Fajar Nugroho', department: 'Engineering' },
  { name: 'Rina Sari', department: 'HR' },
  { name: 'Rizky Prasetyo', department: 'Engineering' },
  { name: 'Dewi Lestari', department: 'HR' },
  { name: 'Lia Amelia', department: 'Operations' },
  { name: 'Farhan Maulana', department: 'Engineering' },
];

function currentMonthEvents(): LeaveEvent[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = (day: number) => new Date(y, m, day).toISOString().slice(0, 10);
  return [
    { id: '1', employee: 'Budi Hartono', department: 'Engineering', type: 'Annual Leave', from: d(10), to: d(12) },
    { id: '2', employee: 'Sari Dewi', department: 'Marketing', type: 'Sick Leave', from: d(14), to: d(14) },
    { id: '3', employee: 'Andi Pratama', department: 'Finance', type: 'Personal Leave', from: d(16), to: d(17) },
    { id: '4', employee: 'Maya Anggraeni', department: 'Design', type: 'Annual Leave', from: d(18), to: d(20) },
    { id: '5', employee: 'Fajar Nugroho', department: 'Engineering', type: 'Annual Leave', from: d(1), to: d(3) },
    { id: '6', employee: 'Rina Sari', department: 'HR', type: 'Personal Leave', from: d(22), to: d(22) },
    { id: '7', employee: 'Rizky Prasetyo', department: 'Engineering', type: 'Sick Leave', from: d(24), to: d(24) },
    { id: '8', employee: 'Dewi Lestari', department: 'HR', type: 'Annual Leave', from: d(26), to: d(28) },
    { id: '9', employee: 'Lia Amelia', department: 'Operations', type: 'Annual Leave', from: d(27), to: d(29) },
    { id: '10', employee: 'Farhan Maulana', department: 'Engineering', type: 'Personal Leave', from: d(30), to: d(30) },
  ];
}

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function sameDay(a: Date, b: Date) {
  return dateKey(a) === dateKey(b);
}

function getMonthGrid(monthDate: Date) {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startDay = start.getDay();
  const grid: { date: Date; currentMonth: boolean }[] = [];

  for (let i = 0; i < startDay; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() - (startDay - i));
    grid.push({ date: d, currentMonth: false });
  }

  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    grid.push({ date: d, currentMonth: true });
  }

  const remainder = grid.length % 7;
  if (remainder !== 0) {
    const last = grid[grid.length - 1].date;
    for (let i = 1; i <= 7 - remainder; i++) {
      const d = new Date(last);
      d.setDate(last.getDate() + i);
      grid.push({ date: d, currentMonth: false });
    }
  }

  return grid;
}

function getWeekGrid(monthDate: Date) {
  const today = new Date();
  let startOfWeek: Date;
  if (isSameMonth(monthDate, today)) {
    const dayOfWeek = today.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;
    startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - diffToMonday);
  } else {
    startOfWeek = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  }

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    days.push(d);
  }
  return days;
}

const typeColor: Record<LeaveType, string> = {
  'Annual Leave': 'bg-primary',
  'Sick Leave': 'bg-red-500',
  'Personal Leave': 'bg-violet-500',
};

const typeBadge: Record<LeaveType, string> = {
  'Annual Leave': 'bg-primary-surface text-primary',
  'Sick Leave': 'bg-red-50 text-red-600',
  'Personal Leave': 'bg-violet-50 text-violet-600',
};

const attendanceStatusMeta: Record<DayRecord['status'], { label: string; color: string }> = {
  present: { label: 'Present', color: 'bg-cta-surface text-cta-hover' },
  absent: { label: 'Absent', color: 'bg-red-50 text-semantic-down' },
  late: { label: 'Late', color: 'bg-amber-50 text-accent-yellow' },
  wfh: { label: 'WFH', color: 'bg-sky-50 text-sky-600' },
};

function DayDetailModal({
  date,
  events,
  attendance,
  onClose,
}: {
  date: Date;
  events: LeaveEvent[];
  attendance: { name: string; department: string; status: DayRecord['status'] }[];
  onClose: () => void;
}) {
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="day-detail-title">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl bg-canvas border border-hairline shadow-2xl">
        <div className="sticky top-0 z-10 bg-canvas border-b border-hairline-soft px-6 py-4 flex items-center justify-between">
          <h2 id="day-detail-title" className="text-base font-bold text-ink">
            {date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={onClose} aria-label="Close day details" className="btn-secondary min-h-10 min-w-10 px-3">
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-ink mb-3">Employees on leave</h3>
            {events.length === 0 ? (
              <p className="text-sm text-muted">No employees on leave.</p>
            ) : (
              <ul className="space-y-2">
                {events.map((ev) => (
                  <li key={ev.id} className="flex items-center justify-between gap-3 rounded-lg border border-hairline-soft px-3 py-2">
                    <span className="text-sm font-medium text-ink">{ev.employee}</span>
                    <span className={`badge text-[11px] ${typeBadge[ev.type]}`}>{ev.type}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-ink mb-3">Attendance snapshot</h3>
            {attendance.length === 0 ? (
              <p className="text-sm text-muted">No attendance data for this day.</p>
            ) : (
              <ul className="space-y-2">
                {attendance.map((row) => {
                  const meta = attendanceStatusMeta[row.status];
                  return (
                    <li key={row.name} className="flex items-center justify-between gap-3 rounded-lg border border-hairline-soft px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{row.name}</p>
                        <p className="text-xs text-muted truncate">{row.department}</p>
                      </div>
                      <span className={`badge text-[11px] ${meta.color}`}>{meta.label}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const { toast } = useToast();
  const [monthDate, setMonthDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [view, setView] = useState<'month' | 'week'>('month');
  const [department, setDepartment] = useState<string>('All');
  const [employeeFilter, setEmployeeFilter] = useState<string>('All');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const allEvents = useMemo(() => currentMonthEvents(), []);

  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      const deptMatch = department === 'All' || ev.department === department;
      const empMatch = employeeFilter === 'All' || ev.employee === employeeFilter;
      return deptMatch && empMatch;
    });
  }, [allEvents, department, employeeFilter]);

  const filteredEmployees = useMemo(() => {
    if (department === 'All') return employees;
    return employees.filter((e) => e.department === department);
  }, [department]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, LeaveEvent[]> = {};
    for (const ev of filteredEvents) {
      const start = new Date(ev.from);
      const end = new Date(ev.to);
      const current = new Date(start);
      while (current <= end) {
        const key = dateKey(current);
        if (!map[key]) map[key] = [];
        map[key].push(ev);
        current.setDate(current.getDate() + 1);
      }
    }
    return map;
  }, [filteredEvents]);

  const goToPrevMonth = () => setMonthDate((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1));
  const goToNextMonth = () => setMonthDate((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1));
  const goToday = () => {
    const now = new Date();
    setMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const handleDayClick = (date: Date) => setSelectedDay(date);

  const dayAttendance = useCallback(
    (date: Date) => {
      const key = dateKey(date);
      const attendance: { name: string; department: string; status: DayRecord['status'] }[] = [];
      for (const emp of filteredEmployees) {
        const onLeave = (eventsByDate[key] || []).some((ev) => ev.employee === emp.name);
        if (onLeave) continue;

        const status: DayRecord['status'] =
          date.getDay() === 0 || date.getDay() === 6
            ? 'absent'
            : emp.name.includes('Rina') || emp.name.includes('Farhan')
            ? 'wfh'
            : emp.name.includes('Dewi')
            ? 'late'
            : 'present';
        attendance.push({ name: emp.name, department: emp.department, status });
      }
      return attendance;
    },
    [filteredEmployees, eventsByDate],
  );

  return (
    <div>
      <ModuleHeader
        eyebrow="Organization"
        title="Calendar"
        description="Team leave schedule and attendance at a glance."
        action={
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-pill border border-hairline overflow-hidden">
              <button
                type="button"
                onClick={() => setView('month')}
                className={`min-h-10 px-4 text-xs font-semibold transition-colors ${
                  view === 'month' ? 'bg-primary text-on-primary' : 'bg-canvas text-ink hover:bg-primary-surface'
                }`}
              >
                Month
              </button>
              <button
                type="button"
                onClick={() => setView('week')}
                className={`min-h-10 px-4 text-xs font-semibold transition-colors border-l border-hairline ${
                  view === 'week' ? 'bg-primary text-on-primary' : 'bg-canvas text-ink hover:bg-primary-surface'
                }`}
              >
                Week
              </button>
            </div>
          </div>
        }
      />

      <div className="card mb-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2">
              <button type="button" onClick={goToPrevMonth} aria-label="Previous" className="btn-secondary min-h-10 min-w-10 px-3">
                <ChevronLeft size={16} />
              </button>
              <button type="button" onClick={goToday} className="btn-ghost min-h-10 px-4 text-xs font-semibold">
                Today
              </button>
              <button type="button" onClick={goToNextMonth} aria-label="Next" className="btn-secondary min-h-10 min-w-10 px-3">
                <ChevronRight size={16} />
              </button>
            </div>
            <h2 className="text-lg font-bold text-ink font-mono tracking-tight">
              {monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-2">
              {departments.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setDepartment(dept)}
                  className={`min-h-10 px-4 rounded-pill text-xs font-semibold border transition-colors ${
                    department === dept
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-canvas text-ink border-hairline hover:border-primary-light hover:bg-primary-surface'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            <label className="sr-only">Filter by employee</label>
            <select
              aria-label="Filter by employee"
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="input-field min-h-10 py-2 w-full sm:w-56"
            >
              <option value="All">All employees</option>
              {filteredEmployees.map((emp) => (
                <option key={emp.name} value={emp.name}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {view === 'month' ? (
        <div className="card p-0 overflow-hidden">
          <div className="grid grid-cols-7 text-xs font-semibold uppercase tracking-wider text-muted border-b border-hairline bg-surface-soft">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="px-3 py-3 text-center">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {getMonthGrid(monthDate).map(({ date, currentMonth }, idx) => {
              const key = dateKey(date);
              const dayEvents = eventsByDate[key] || [];
              const isToday = sameDay(date, new Date());
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDayClick(date)}
                  className={`relative flex flex-col items-start gap-2 border-b border-r border-hairline-soft p-3 text-left transition-colors hover:bg-primary-surface/30 min-h-[110px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    !currentMonth ? 'bg-canvas opacity-40' : 'bg-canvas'
                  }`}
                  aria-label={`Open details for ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                      isToday ? 'bg-primary text-on-primary ring-2 ring-primary-light ring-offset-2' : 'text-ink font-mono'
                    }`}
                  >
                    {date.getDate()}
                  </span>

                  <div className="flex flex-col gap-1 w-full">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <span key={ev.id} className={`truncate rounded-pill px-2 py-1 text-[10px] font-semibold text-white ${typeColor[ev.type]}`}>
                        {ev.employee}
                      </span>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[10px] font-semibold text-muted">+{dayEvents.length - 2} more</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="grid grid-cols-8 text-xs font-semibold uppercase tracking-wider text-muted border-b border-hairline bg-surface-soft">
            <div className="px-3 py-3">Employee</div>
            {getWeekGrid(monthDate).map((d, i) => {
              const isToday = sameDay(d, new Date());
              return (
                <div key={i} className="px-3 py-3 text-center">
                  <span className="block text-muted">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  <span className={`mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold font-mono ${isToday ? 'bg-primary text-on-primary' : 'text-ink'}`}>
                    {d.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="divide-y divide-hairline-soft">
            {filteredEmployees.map((emp) => {
              const weekDays = getWeekGrid(monthDate);
              return (
                <div key={emp.name} className="grid grid-cols-8 items-center">
                  <div className="px-3 py-3 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{emp.name}</p>
                    <p className="text-xs text-muted truncate">{emp.department}</p>
                  </div>
                  {weekDays.map((d, di) => {
                    const key = dateKey(d);
                    const onLeave = (eventsByDate[key] || []).some((ev) => ev.employee === emp.name);
                    const status: DayRecord['status'] =
                      onLeave
                        ? 'absent'
                        : d.getDay() === 0 || d.getDay() === 6
                        ? 'absent'
                        : emp.name.includes('Rina') || emp.name.includes('Farhan')
                        ? 'wfh'
                        : emp.name.includes('Dewi')
                        ? 'late'
                        : 'present';
                    const meta = attendanceStatusMeta[status];
                    return (
                      <div key={di} className="px-2 py-3 flex justify-center">
                        <span className={`badge text-[10px] px-2.5 py-1 ${meta.color}`}>{meta.label}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-5">
        <span className="text-xs font-semibold text-muted">Legend</span>
        {Object.entries(typeColor).map(([type, color]) => (
          <span key={type} className="inline-flex items-center gap-2 text-xs text-ink">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />
            {type}
          </span>
        ))}
        <span className="inline-flex items-center gap-2 text-xs text-ink">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-primary-light ring-offset-1" />
          Today
        </span>
      </div>

      {selectedDay && (
        <DayDetailModal
          date={selectedDay}
          events={eventsByDate[dateKey(selectedDay)] || []}
          attendance={dayAttendance(selectedDay)}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}