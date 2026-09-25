'use client';

import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import api from '@/lib/api';
import {
  Users, ChevronDown, GitBranch, UserRound, ZoomIn, ZoomOut,
  Maximize2, Search, X, UserPlus
} from 'lucide-react';
import ModuleHeader from '@/components/ui/ModuleHeader';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TeamMember = { name: string; role: string };

type Team = {
  name: string;
  lead: string;
  initials: string;
  count: number;
  color: string;
  department: string;
  department_id?: string;
  children?: string[];
  description: string;
  members: TeamMember[];
};

/* ------------------------------------------------------------------ */
/*  Department list & pill definitions                                 */
/* ------------------------------------------------------------------ */

const DEPARTMENTS = ['All'] as const;

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function OrgChartPage() {
  const [expanded, setExpanded] = useState<string[]>(['Engineering']);
  const [zoom, setZoom] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [activeDepartment, setActiveDepartment] = useState<string>('All');
  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();
  useEffect(() => {
    Promise.all([api.get('/employees', { params: { per_page: 100 } }), api.get('/departments')]).then(([employeeResponse, departmentResponse]) => { setServerEmployees(employeeResponse.data.items ?? []); const map: Record<string, string> = {}; for (const department of departmentResponse.data.items ?? []) map[department.name] = department.id; setDepartmentIds(map); }).catch(() => toast('Unable to load organization chart data.', 'error')).finally(() => setLoading(false));
  }, [toast]);

  // Add member modal state
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: '', department: '', reportsTo: '', joinDate: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serverEmployees, setServerEmployees] = useState<any[]>([]);
  const [departmentIds, setDepartmentIds] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const teams = useMemo<Team[]>(() => {
    const groups = new Map<string, any[]>();
    for (const employee of serverEmployees) {
      const department = employee.department ?? 'Unassigned';
      groups.set(department, [...(groups.get(department) ?? []), employee]);
    }
    return Array.from(groups.entries()).map(([department, members], index) => {
      const lead = members.find((member) => !member.reporting_to) ?? members[0];
      return { name: department, lead: lead?.full_name ?? 'Unassigned', initials: (lead?.full_name ?? 'U').split(/\s+/).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase(), count: members.length, color: ['bg-primary-surface text-primary', 'bg-cta-surface text-cta-hover', 'bg-violet-50 text-violet-600', 'bg-amber-50 text-accent-yellow'][index % 4], department, description: `${department} organization`, members: members.map((member) => ({ name: member.full_name, role: member.position ?? '—' })) };
    });
  }, [serverEmployees]);

  /* ---- Filtering logic ---- */
  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return teams.filter((team) => {
      // Department filter
      if (activeDepartment !== 'All' && team.department !== activeDepartment) return false;
      // Search filter: match team name, lead, or member names
      if (!query) return true;
      const nameMatch = `${team.name} ${team.lead}`.toLowerCase().includes(query);
      const memberMatch = team.members.some((m) => m.name.toLowerCase().includes(query));
      return nameMatch || memberMatch;
    });
  }, [search, activeDepartment]);

  /* ---- Which teams have an employee match ---- */
  const employeeMatchTeams = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return new Set<string>();
    const matches = new Set<string>();
    for (const team of teams) {
      if (team.members.some((m) => m.name.toLowerCase().includes(query))) {
        matches.add(team.name);
      }
    }
    return matches;
  }, [search]);

  /* ---- Search matches any employee name (across all teams) ---- */
  const searchMatchesEmployee = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return false;
    return teams.some((team) =>
      team.members.some((m) => m.name.toLowerCase().includes(query))
    );
  }, [search]);

  /* ---- Which team name did the employee match come from ---- */
  const matchedTeamNames = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return [];
    return teams
      .filter((t) => t.members.some((m) => m.name.toLowerCase().includes(query)))
      .map((t) => t.name);
  }, [search]);

  /* ---- Hover profile preview (150ms delay) ---- */
  const handleHoverEnter = useCallback((teamName: string) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => setHoveredTeam(teamName), 150);
  }, []);

  const handleHoverLeave = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => setHoveredTeam(null), 100);
  }, []);

  /* ---- Zoom controls ---- */
  const expandAll = () => {
    setExpanded(teams.filter((t) => t.children).map((t) => t.name));
    toast('All nested teams expanded.', 'info');
  };
  const collapseAll = () => {
    setExpanded([]);
    toast('Nested teams collapsed.', 'info');
  };
  const toggle = (name: string) =>
    setExpanded((cur) =>
      cur.includes(name) ? cur.filter((n) => n !== name) : [...cur, name]
    );

  /* ---- Add member form helpers ---- */
  const departmentOptions = Array.from(new Set(teams.map((team) => team.department)));
  const reportsToOptions = teams.map((t) => t.lead);

  const resetForm = () => {
    setNewMember({ name: '', role: '', department: '', reportsTo: '', joinDate: '' });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!newMember.name.trim()) errors.name = 'Name is required';
    if (!newMember.role.trim()) errors.role = 'Role is required';
    if (!newMember.department) errors.department = 'Department is required';
    if (!newMember.reportsTo) errors.reportsTo = 'Reports-to is required';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newMember.joinDate)) errors.joinDate = 'Start date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitMember = async () => {
    if (!validateForm()) return;
    const reporting = serverEmployees.find((employee) => employee.full_name === newMember.reportsTo);
    const department = newMember.department;
    const departmentId = departmentIds[department];
    if (!reporting || !departmentId) { toast('Could not resolve the reporting or department selection.', 'error'); return; }
    try {
      await api.post('/employees', {
        full_name: newMember.name.trim(),
        join_date: newMember.joinDate,
        department_id: departmentId,
        position_id: null,
        reporting_to: reporting.id,
        employment_type: 'full-time',
        employment_status: 'contract',
      });
      const response = await api.get('/employees', { params: { per_page: 100 } });
      setServerEmployees(response.data.items ?? []);
      toast(`Team member "${newMember.name}" added successfully.`, 'success');
      setShowAddMember(false);
      resetForm();
    } catch (error: any) { toast(error.response?.data?.detail || 'Unable to add team member.', 'error'); }
  };

  /* ---- Profile tooltip for a team ---- */
  function ProfilePreview({ team }: { team: Team }) {
    const matchedTeam = teams.find((t) => t.name === team.name);
    if (!matchedTeam) return null;
    return (
      <div
        className="absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full z-[70] w-56 rounded-xl border border-hairline bg-canvas shadow-lg p-3 pointer-events-none animate-in fade-in zoom-in-95"
        onMouseEnter={() => {
          if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
          setHoveredTeam(team.name);
        }}
        onMouseLeave={handleHoverLeave}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${matchedTeam.color}`}>
            <span className="text-xs font-bold">{matchedTeam.initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink truncate">{matchedTeam.lead}</p>
            <p className="text-[11px] text-muted truncate">{matchedTeam.name}</p>
          </div>
        </div>
        <div className="mt-2.5 pt-2.5 border-t border-hairline-soft space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted">Department head</span>
            <span className="font-semibold text-ink">{matchedTeam.lead}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-muted">Team members</span>
            <span className="font-mono font-semibold text-ink">{matchedTeam.count}</span>
          </div>
        </div>
        {/* Arrow */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45 bg-canvas border-r border-b border-hairline" />
      </div>
    );
  }

  /* ---- Render ---- */
  return (
    <div>{loading && <p className="mb-4 text-sm text-muted">Loading organization data…</p>}
      <ModuleHeader
        eyebrow="Organization"
        title="Organization Chart"
        description="See reporting lines and team structure at a glance"
        action={
          <div className="flex gap-2">
            <button onClick={() => { resetForm(); setShowAddMember(true); }} className="btn-primary gap-2">
              <UserPlus size={15} /> Add team member
            </button>
            <button onClick={expanded.length ? collapseAll : expandAll} className="btn-secondary gap-2">
              <GitBranch size={15} /> {expanded.length ? 'Collapse all' : 'Expand all'}
            </button>
          </div>
        }
      />

      {/* -------- Department filter pills -------- */}
      <div className="mb-4 flex flex-wrap gap-2">
        {['All', ...departmentOptions].map((dept) => (
          <button
            key={dept}
            onClick={() => setActiveDepartment(dept)}
            className={`min-h-10 px-4 rounded-pill text-xs font-semibold transition-colors duration-200
              ${activeDepartment === dept
                ? 'bg-primary text-white'
                : 'bg-surface-strong text-muted hover:bg-primary-surface hover:text-ink'
              }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* -------- Employee search hint -------- */}
      {search && matchedTeamNames.length > 0 && (
        <div className="mb-3 flex items-center gap-2 text-xs text-primary bg-primary-surface rounded-lg px-3 py-2">
          <Users size={14} className="shrink-0" />
          <span>
            Found <strong>{search}</strong> in{' '}
            {matchedTeamNames.length === 1
              ? matchedTeamNames[0]
              : `${matchedTeamNames.length} teams`}
          </span>
        </div>
      )}

      {/* -------- Org chart card -------- */}
      <div className="card mb-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-hairline-soft flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink">Company structure</h2>
            <p className="text-xs text-muted mt-1">Click a team to view details</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-soft" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search organization chart"
                placeholder="Search team, lead, or member..."
                className="w-56 min-h-10 rounded-pill bg-surface-strong pl-8 pr-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 min-h-6 min-w-6 rounded-md hover:bg-surface-strong flex items-center justify-center"
                >
                  <X size={12} className="text-muted" />
                </button>
              )}
            </div>
            <button
              onClick={() => setZoom((v) => Math.max(0.75, Number((v - 0.1).toFixed(1))))}
              aria-label="Zoom out"
              className="min-h-10 min-w-10 rounded-lg bg-surface-strong hover:bg-primary-surface flex items-center justify-center"
            >
              <ZoomOut size={15} className="text-muted" />
            </button>
            <span className="text-xs font-mono text-muted w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((v) => Math.min(1.25, Number((v + 0.1).toFixed(1))))}
              aria-label="Zoom in"
              className="min-h-10 min-w-10 rounded-lg bg-surface-strong hover:bg-primary-surface flex items-center justify-center"
            >
              <ZoomIn size={15} className="text-muted" />
            </button>
            <button
              onClick={() => setZoom(1)}
              aria-label="Reset zoom"
              className="min-h-10 min-w-10 rounded-lg bg-surface-strong hover:bg-primary-surface flex items-center justify-center"
            >
              <Maximize2 size={15} className="text-muted" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div
            className="min-w-[950px] py-8 transition-transform origin-top"
            style={{ transform: `scale(${zoom})`, marginBottom: `${(zoom - 1) * 280}px` }}
          >
            <div className="flex flex-col items-center">
              {/* CEO node */}
              <div className="rounded-xl border-2 border-primary bg-primary-surface px-7 py-4 text-center shadow-card">
                <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white">
                  <UserRound size={20} />
                </div>
                <p className="text-sm font-bold text-ink">Arif Darmawan</p>
                <p className="mt-1 text-xs text-primary">Chief Executive Officer</p>
              </div>

              <div className="h-8 w-px bg-primary-light" />
              <div className="relative h-px w-[850px] bg-primary-light">
                <span className="absolute left-1/2 top-0 h-5 w-px bg-primary-light" />
              </div>

              {filtered.length === 0 ? (
                <div className="pt-8">
                  <EmptyState
                    title="No teams found"
                    description="Try another search or filter."
                  />
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-3 pt-5">
                  {filtered.map((team) => {
                    const isHighlighted = search && employeeMatchTeams.has(team.name);
                    return (
                      <div key={team.name} className="relative flex flex-col items-center">
                        <div className="absolute -top-5 h-5 w-px bg-primary-light" />

                        {/* Profile preview tooltip */}
                        {hoveredTeam === team.name && (
                          <ProfilePreview team={team} />
                        )}

                        <button
                          onClick={() => setSelectedTeam(team)}
                          onMouseEnter={() => handleHoverEnter(team.name)}
                          onMouseLeave={handleHoverLeave}
                          className={`w-[135px] rounded-xl border p-3 text-center transition-all cursor-pointer
                            ${isHighlighted
                              ? 'border-primary bg-primary-surface shadow-card-hover animate-pulse'
                              : 'border-hairline bg-canvas hover:border-primary-light hover:shadow-card-hover'
                            }`}
                        >
                          <div
                            className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full ${team.color}`}
                          >
                            <span className="text-xs font-bold">{team.initials}</span>
                          </div>
                          <p className="truncate text-xs font-bold text-ink">{team.name}</p>
                          <p className="mt-1 truncate text-[10px] text-muted">{team.lead}</p>
                          <div className="mt-2 inline-flex items-center gap-1 rounded-pill bg-surface-strong px-2 py-1 text-[10px] font-semibold text-body">
                            <Users size={10} /> {team.count}
                          </div>
                        </button>

                        {team.children && (
                          <button
                            onClick={() => toggle(team.name)}
                            className="mt-2 inline-flex min-h-8 items-center gap-1 rounded-pill bg-primary-surface px-2.5 text-[10px] font-semibold text-primary hover:bg-primary-light/20"
                          >
                            <ChevronDown
                              size={11}
                              className={`transition-transform ${expanded.includes(team.name) ? '' : '-rotate-90'}`}
                            />
                            {expanded.includes(team.name)
                              ? 'Hide sub-teams'
                              : `${team.children.length} sub-teams`}
                          </button>
                        )}

                        {team.children && expanded.includes(team.name) && (
                          <div className="mt-2 flex flex-col items-center gap-1">
                            {team.children.map((child) => (
                              <div
                                key={child}
                                className="w-[135px] rounded-lg border border-dashed border-hairline px-2 py-2 text-center text-[10px] font-semibold text-muted"
                              >
                                <ChevronDown size={11} className="mx-auto mb-0.5 text-primary" />
                                {child}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* -------- Summary stats -------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card">
          <p className="text-xs font-semibold text-muted">Total headcount</p>
          <p className="mt-2 font-mono text-2xl font-bold text-ink">486</p>
          <p className="mt-1 text-xs text-cta">+12 this month</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-muted">Reporting layers</p>
          <p className="mt-2 font-mono text-2xl font-bold text-ink">4</p>
          <p className="mt-1 text-xs text-muted">From CEO to individual contributor</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-muted">Open positions</p>
          <p className="mt-2 font-mono text-2xl font-bold text-ink">12</p>
          <p className="mt-1 text-xs text-primary">Across 6 departments</p>
        </div>
      </div>

      {/* -------- Team detail modal -------- */}
      {selectedTeam && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setSelectedTeam(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-canvas border border-hairline shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${selectedTeam.color}`}>
                  <span className="text-sm font-bold">{selectedTeam.initials}</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-ink">{selectedTeam.name}</h2>
                  <p className="text-xs text-muted mt-0.5">{selectedTeam.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                aria-label="Close team details"
                className="btn-secondary min-h-10 min-w-10 px-3"
              >
                <X size={15} />
              </button>
            </div>
            <div className="mt-5 space-y-3 border-t border-hairline-soft pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Department head</span>
                <span className="font-semibold text-ink">{selectedTeam.lead}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Team members</span>
                <span className="font-mono font-semibold text-ink">{selectedTeam.count}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Open roles</span>
                <span className="font-mono font-semibold text-primary">
                  {selectedTeam.children?.length || 2}
                </span>
              </div>
            </div>
            <div className="mt-4 border-t border-hairline-soft pt-4">
              <p className="text-xs font-semibold text-muted mb-2">Team members</p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {selectedTeam.members.map((member) => (
                  <div key={member.name} className="flex items-center justify-between text-xs py-1 px-2 rounded-md hover:bg-surface-strong">
                    <span className="text-ink font-medium">{member.name}</span>
                    <span className="text-muted">{member.role}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setSelectedTeam(null)}
              className="btn-cta w-full mt-5 text-sm"
            >
              View department
            </button>
          </div>
        </div>
      )}

      {/* -------- Add member modal -------- */}
      {showAddMember && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => { setShowAddMember(false); resetForm(); }}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-canvas border border-hairline shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-ink">Add team member</h2>
                <p className="text-xs text-muted mt-0.5">Fill in the details below</p>
              </div>
              <button
                onClick={() => { setShowAddMember(false); resetForm(); }}
                aria-label="Close add member form"
                className="min-h-10 min-w-10 rounded-md hover:bg-surface-strong flex items-center justify-center"
              >
                <X size={16} className="text-muted" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitMember();
              }}
              className="space-y-4"
            >
              {/* Name */}
              <div>
                <label htmlFor="member-name" className="block text-xs font-semibold text-ink mb-1.5">
                  Full name <span className="text-semantic-down">*</span>
                </label>
                <input
                  id="member-name"
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Dewi Lestari"
                  className={`input-field ${formErrors.name ? 'border-semantic-down focus:border-semantic-down focus:ring-semantic-down/15' : ''}`}
                />
                {formErrors.name && <p className="text-[11px] text-semantic-down mt-1">{formErrors.name}</p>}
              </div>

              {/* Role / title */}
              <div>
                <label htmlFor="member-role" className="block text-xs font-semibold text-ink mb-1.5">
                  Role / title <span className="text-semantic-down">*</span>
                </label>
                <input
                  id="member-role"
                  type="text"
                  value={newMember.role}
                  onChange={(e) => setNewMember((p) => ({ ...p, role: e.target.value }))}
                  placeholder="e.g. Senior Designer"
                  className={`input-field ${formErrors.role ? 'border-semantic-down focus:border-semantic-down focus:ring-semantic-down/15' : ''}`}
                />
                {formErrors.role && <p className="text-[11px] text-semantic-down mt-1">{formErrors.role}</p>}
              </div>

              {/* Department */}
              <div>
                <label htmlFor="member-dept" className="block text-xs font-semibold text-ink mb-1.5">
                  Department <span className="text-semantic-down">*</span>
                </label>
                <select
                  id="member-dept"
                  value={newMember.department}
                  onChange={(e) => setNewMember((p) => ({ ...p, department: e.target.value }))}
                  className={`input-field appearance-none bg-no-repeat bg-[right_12px_center] ${formErrors.department ? 'border-semantic-down focus:border-semantic-down focus:ring-semantic-down/15' : ''}`}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center' }}
                >
                  <option value="">Select department</option>
                  {departmentOptions.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {formErrors.department && <p className="text-[11px] text-semantic-down mt-1">{formErrors.department}</p>}
              </div>

              {/* Start date */}
              <div>
                <label htmlFor="member-join" className="block text-xs font-semibold text-ink mb-1.5">
                  Start date <span className="text-semantic-down">*</span>
                </label>
                <input
                  id="member-join"
                  type="date"
                  value={newMember.joinDate}
                  onChange={(e) => setNewMember((p) => ({ ...p, joinDate: e.target.value }))}
                  className={`input-field ${formErrors.joinDate ? 'border-semantic-down focus:border-semantic-down focus:ring-semantic-down/15' : ''}`}
                />
                {formErrors.joinDate && <p className="text-[11px] text-semantic-down mt-1">{formErrors.joinDate}</p>}
              </div>

              {/* Reports to */}
              <div>
                <label htmlFor="member-reports" className="block text-xs font-semibold text-ink mb-1.5">
                  Reports to <span className="text-semantic-down">*</span>
                </label>
                <select
                  id="member-reports"
                  value={newMember.reportsTo}
                  onChange={(e) => setNewMember((p) => ({ ...p, reportsTo: e.target.value }))}
                  className={`input-field appearance-none bg-no-repeat bg-[right_12px_center] ${formErrors.reportsTo ? 'border-semantic-down focus:border-semantic-down focus:ring-semantic-down/15' : ''}`}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center' }}
                >
                  <option value="">Select team lead</option>
                  {reportsToOptions.map((lead) => (
                    <option key={lead} value={lead}>{lead}</option>
                  ))}
                </select>
                {formErrors.reportsTo && <p className="text-[11px] text-semantic-down mt-1">{formErrors.reportsTo}</p>}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-hairline-soft">
                <button
                  type="button"
                  onClick={() => { setShowAddMember(false); resetForm(); }}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-sm">
                  <UserPlus size={15} className="mr-1.5" /> Add member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
