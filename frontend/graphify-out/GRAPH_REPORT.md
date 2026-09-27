# Graph Report - frontend  (2026-09-23)

## Corpus Check
- 96 files · ~59,879 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 594 nodes · 1369 edges · 36 communities (32 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs
- Code and APIs

## God Nodes (most connected - your core abstractions)
1. `getSupabaseAdmin()` - 98 edges
2. `requireUser()` - 98 edges
3. `apiError()` - 97 edges
4. `requireAdmin()` - 69 edges
5. `next` - 52 edges
6. `useToast()` - 48 edges
7. `react` - 35 edges
8. `lucide-react` - 34 edges
9. `ModuleHeader()` - 20 edges
10. `api` - 17 edges

## Surprising Connections (you probably didn't know these)
- `DepartmentFormModal()` --calls--> `useToast()`  [EXTRACTED]
  src/app/(dashboard)/departments/page.tsx → src/components/ui/Toast.tsx
- `NewEmployeePage()` --calls--> `useToast()`  [EXTRACTED]
  src/app/(dashboard)/employees/new/page.tsx → src/components/ui/Toast.tsx
- `NotificationsPage()` --calls--> `useToast()`  [EXTRACTED]
  src/app/(dashboard)/notifications/page.tsx → src/components/ui/Toast.tsx
- `OnboardingPage()` --calls--> `useToast()`  [EXTRACTED]
  src/app/(dashboard)/onboarding/page.tsx → src/components/ui/Toast.tsx
- `DashboardPage()` --calls--> `useToast()`  [EXTRACTED]
  src/app/(dashboard)/page.tsx → src/components/ui/Toast.tsx

## Import Cycles
- None detected.

## Communities (36 total, 4 thin omitted)

### Community 0 - "Code and APIs"
Cohesion: 0.06
Nodes (97): next, DELETE(), GET(), normalize(), parseBody(), PUT(), STATUSES, GET() (+89 more)

### Community 1 - "Code and APIs"
Cohesion: 0.06
Nodes (32): clsx, tailwind-merge, src_app_globals, metadata, Navigation(), NavItem, NavSection, sections (+24 more)

### Community 2 - "Code and APIs"
Cohesion: 0.06
Nodes (40): auditEntries, AuditEntry, AuditLogPage(), categories, daysAgo(), ExportModal(), inRange(), L (+32 more)

### Community 3 - "Code and APIs"
Cohesion: 0.12
Nodes (15): lucide-react, directory, Person, categoryLabels, groupLabels, initialNotifications, Notification, NotificationsPage() (+7 more)

### Community 4 - "Code and APIs"
Cohesion: 0.11
Nodes (9): react, NewEmployeePage(), steps, defaults, sections, SettingsData, SettingsPage(), ConfirmDialog() (+1 more)

### Community 5 - "Code and APIs"
Cohesion: 0.11
Nodes (12): downloadPayslip(), leaveHistory, LeaveStatus, PayslipBreakdown(), PayslipModal(), payslips, PayslipsTab(), profile (+4 more)

### Community 6 - "Code and APIs"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 7 - "Code and APIs"
Cohesion: 0.12
Nodes (16): name, private, version, autoprefixer, axios, date-fns, eslint, eslint-config-next (+8 more)

### Community 8 - "Code and APIs"
Cohesion: 0.17
Nodes (15): attendanceStatusMeta, CalendarPage(), currentMonthEvents(), dateKey(), DayRecord, departments, employees, getMonthGrid() (+7 more)

### Community 9 - "Code and APIs"
Cohesion: 0.13
Nodes (13): categories, employees, formatDueDate(), initialTasks, isOverdue(), OnboardingChecklistPage(), priorities, Priority (+5 more)

### Community 10 - "Code and APIs"
Cohesion: 0.12
Nodes (16): dependencies, axios, bcryptjs, clsx, date-fns, jose, lucide-react, next (+8 more)

### Community 11 - "Code and APIs"
Cohesion: 0.14
Nodes (11): DirectoryPage(), ApprovalStep, balances, initialRequests, LeavePage(), LeaveRequest, leaveTypes, NewRequestModal() (+3 more)

### Community 12 - "Code and APIs"
Cohesion: 0.22
Nodes (12): categories, Doc, DocPreviewModal(), DocumentsPage(), downloadTextFile(), employees, ExpiryAlertModal(), initialDocs (+4 more)

### Community 13 - "Code and APIs"
Cohesion: 0.15
Nodes (7): documents, emp, EmployeeDetailPage(), leave, payroll, rupiah(), Tab

### Community 14 - "Code and APIs"
Cohesion: 0.17
Nodes (10): attendanceTrendData, headcountData, leaveTypeData, payrollTrendData, recentReports, ReportData, ReportsPage(), ReportType (+2 more)

### Community 15 - "Code and APIs"
Cohesion: 0.18
Nodes (9): recharts, DashboardData, DashboardPage(), Drilldown, EMPTY_DATA, Kpi, Range, tooltipStyle (+1 more)

### Community 16 - "Code and APIs"
Cohesion: 0.21
Nodes (10): categories, ClaimDetailModal(), ExpenseApprovalStep, ExpenseRecord, ExpensesPage(), ExpenseStatus, formatRupiah(), getExpenseApprovalChain() (+2 more)

### Community 17 - "Code and APIs"
Cohesion: 0.24
Nodes (6): bcryptjs, jose, @supabase/supabase-js, POST(), secret(), supabase()

### Community 18 - "Code and APIs"
Cohesion: 0.18
Nodes (7): Candidate, initialCandidates, RecruitmentPage(), Stage, stageColor, stageDot, stageOrder

### Community 19 - "Code and APIs"
Cohesion: 0.20
Nodes (10): devDependencies, autoprefixer, eslint, eslint-config-next, postcss, tailwindcss, @types/node, @types/react (+2 more)

### Community 20 - "Code and APIs"
Cohesion: 0.22
Nodes (8): createTasks(), initialPeople, NewOnboardingModal(), OnboardingPage(), Person, statusMeta, Task, taskTemplates

### Community 21 - "Code and APIs"
Cohesion: 0.31
Nodes (8): AttendancePage(), AttendanceRecord, AttendanceStatus, CurrentUser, dateKey(), Employee, generateWeekDates(), statusMeta

### Community 22 - "Code and APIs"
Cohesion: 0.28
Nodes (8): allDepartments, Department, DepartmentFormModal(), DepartmentsPage(), DetailModal(), formatRp(), Member, SubTeam

### Community 23 - "Code and APIs"
Cohesion: 0.32
Nodes (7): formatRupiah(), PayrollPage(), PayrollRecord, PayrollStatus, Payslip(), Period, statusMeta

### Community 24 - "Code and APIs"
Cohesion: 0.52
Nodes (6): GET(), normalize(), POST(), statusFor(), TYPES, withUrls()

### Community 25 - "Code and APIs"
Cohesion: 0.43
Nodes (6): daysBetween(), GET(), LEAVE_TYPES, normalize(), POST(), STATUSES

### Community 26 - "Code and APIs"
Cohesion: 0.29
Nodes (6): colors, icons, Toast, ToastContext, ToastContextValue, ToastType

### Community 27 - "Code and APIs"
Cohesion: 0.33
Nodes (4): priorityMeta, recommendations, reportMeta, sections

### Community 28 - "Code and APIs"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 29 - "Code and APIs"
Cohesion: 0.40
Nodes (3): tailwindcss, Config, config

### Community 30 - "Code and APIs"
Cohesion: 0.40
Nodes (4): buildCommand, framework, installCommand, outputDirectory

### Community 31 - "Code and APIs"
Cohesion: 0.50
Nodes (3): zustand, AuthState, User

## Knowledge Gaps
- **233 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+228 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 299 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Code and APIs` to `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`?**
  _High betweenness centrality (0.377) - this node is a cross-community bridge._
- **Why does `react` connect `Code and APIs` to `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`?**
  _High betweenness centrality (0.158) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `Code and APIs` to `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`, `Code and APIs`?**
  _High betweenness centrality (0.140) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _233 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Code and APIs` be split into smaller, more focused modules?**
  _Cohesion score 0.05992260917634052 - nodes in this community are weakly interconnected._
- **Should `Code and APIs` be split into smaller, more focused modules?**
  _Cohesion score 0.0563265306122449 - nodes in this community are weakly interconnected._
- **Should `Code and APIs` be split into smaller, more focused modules?**
  _Cohesion score 0.05551020408163265 - nodes in this community are weakly interconnected._