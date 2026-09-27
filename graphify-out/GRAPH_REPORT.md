# Graph Report - HRIS  (2026-09-23)

## Corpus Check
- 202 files · ~115,541 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 5, .ini 1, .example 1)

## Summary
- 730 nodes · 1711 edges · 47 communities (35 shown, 12 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 46

## God Nodes (most connected - your core abstractions)
1. `getSupabaseAdmin()` - 96 edges
2. `requireUser()` - 96 edges
3. `apiError()` - 95 edges
4. `requireAdmin()` - 63 edges
5. `next` - 51 edges
6. `useToast()` - 47 edges
7. `react` - 35 edges
8. `lucide-react` - 34 edges
9. `ModuleHeader()` - 20 edges
10. `Base` - 18 edges

## Surprising Connections (you probably didn't know these)
- `login()` --uses--> `User`  [INFERRED]
  backend/app/api/v1/auth.py → backend/app/models/user.py
- `refresh_token()` --uses--> `User`  [INFERRED]
  backend/app/api/v1/auth.py → backend/app/models/user.py
- `_get_employee_or_404()` --uses--> `Employee`  [INFERRED]
  backend/app/api/v1/employees.py → backend/app/models/employee.py
- `list_employees()` --uses--> `Employee`  [INFERRED]
  backend/app/api/v1/employees.py → backend/app/models/employee.py
- `list_employees()` --uses--> `PaginatedResponse`  [INFERRED]
  backend/app/api/v1/employees.py → backend/app/schemas/common.py

## Import Cycles
- None detected.

## Communities (47 total, 12 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (100): DELETE(), GET(), normalize(), parseBody(), PUT(), STATUSES, GET(), normalize() (+92 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (40): auditEntries, AuditEntry, AuditLogPage(), categories, daysAgo(), ExportModal(), inRange(), L (+32 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (32): frontend_src_app_globals, metadata, Navigation(), NavItem, NavSection, sections, Sidebar(), SearchItem (+24 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (34): create_employee(), deactivate_employee(), get_employee(), _get_employee_or_404(), list_employees(), AsyncSession, CurrentUser, Depends (+26 more)

### Community 4 - "Community 4"
Cohesion: 0.22
Nodes (22): alembic, Base, AttendanceRecord, LeaveBalance, LeaveRequest, AuditLog, Department, Position (+14 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (15): NewEmployeePage(), steps, categoryLabels, groupLabels, initialNotifications, Notification, NotificationsPage(), defaults (+7 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (17): asyncio, get_settings(), Settings, health_check(), lifespan(), get, readiness_check(), hash_password() (+9 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (15): DashboardData, DashboardPage(), Drilldown, EMPTY_DATA, Kpi, Range, tooltipStyle, LoginPage() (+7 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (12): downloadPayslip(), leaveHistory, LeaveStatus, PayslipBreakdown(), PayslipModal(), payslips, PayslipsTab(), profile (+4 more)

### Community 9 - "Community 9"
Cohesion: 0.22
Nodes (17): login(), me(), AsyncSession, CurrentUser, Depends, get, post, refresh_token() (+9 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 11 - "Community 11"
Cohesion: 0.14
Nodes (15): get_current_user(), AsyncSession, Depends, Return an Annotated type that enforces role-based access., require_roles(), ErrorResponse, MessageResponse, PaginatedResponse (+7 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (16): name, private, version, autoprefixer, axios, date-fns, eslint, eslint-config-next (+8 more)

### Community 13 - "Community 13"
Cohesion: 0.17
Nodes (15): attendanceStatusMeta, CalendarPage(), currentMonthEvents(), dateKey(), DayRecord, departments, employees, getMonthGrid() (+7 more)

### Community 14 - "Community 14"
Cohesion: 0.13
Nodes (13): categories, employees, formatDueDate(), initialTasks, isOverdue(), OnboardingChecklistPage(), priorities, Priority (+5 more)

### Community 15 - "Community 15"
Cohesion: 0.12
Nodes (16): dependencies, axios, bcryptjs, clsx, date-fns, jose, lucide-react, next (+8 more)

### Community 16 - "Community 16"
Cohesion: 0.23
Nodes (13): categories, Doc, DocPreviewModal(), DocumentsPage(), downloadTextFile(), employees, ExpiryAlertModal(), initialDocs (+5 more)

### Community 17 - "Community 17"
Cohesion: 0.16
Nodes (9): directory, DirectoryPage(), Person, DEPARTMENTS, OrgChartPage(), Team, TeamMember, teams (+1 more)

### Community 18 - "Community 18"
Cohesion: 0.15
Nodes (7): documents, emp, EmployeeDetailPage(), leave, payroll, rupiah(), Tab

### Community 19 - "Community 19"
Cohesion: 0.17
Nodes (10): attendanceTrendData, headcountData, leaveTypeData, payrollTrendData, recentReports, ReportData, ReportsPage(), ReportType (+2 more)

### Community 20 - "Community 20"
Cohesion: 0.21
Nodes (10): categories, ClaimDetailModal(), ExpenseApprovalStep, ExpenseRecord, ExpensesPage(), ExpenseStatus, formatRupiah(), getExpenseApprovalChain() (+2 more)

### Community 21 - "Community 21"
Cohesion: 0.17
Nodes (8): ApprovalStep, balances, initialRequests, LeavePage(), LeaveRequest, leaveTypes, NewRequestModal(), statusMeta

### Community 22 - "Community 22"
Cohesion: 0.20
Nodes (6): payroll, priorityMeta, recommendations, reportMeta, sections, ModuleHeader()

### Community 23 - "Community 23"
Cohesion: 0.24
Nodes (6): POST(), secret(), supabase(), bcryptjs, jose, @supabase/supabase-js

### Community 24 - "Community 24"
Cohesion: 0.18
Nodes (7): Candidate, initialCandidates, RecruitmentPage(), Stage, stageColor, stageDot, stageOrder

### Community 25 - "Community 25"
Cohesion: 0.20
Nodes (10): devDependencies, autoprefixer, eslint, eslint-config-next, postcss, tailwindcss, @types/node, @types/react (+2 more)

### Community 26 - "Community 26"
Cohesion: 0.22
Nodes (8): createTasks(), initialPeople, NewOnboardingModal(), OnboardingPage(), Person, statusMeta, Task, taskTemplates

### Community 27 - "Community 27"
Cohesion: 0.28
Nodes (8): allDepartments, Department, DepartmentFormModal(), DepartmentsPage(), DetailModal(), formatRp(), Member, SubTeam

### Community 28 - "Community 28"
Cohesion: 0.36
Nodes (7): AttendancePage(), AttendanceRecord, AttendanceStatus, dateKey(), Employee, generateWeekDates(), statusMeta

### Community 29 - "Community 29"
Cohesion: 0.32
Nodes (7): formatRupiah(), PayrollPage(), PayrollRecord, PayrollStatus, Payslip(), Period, statusMeta

### Community 30 - "Community 30"
Cohesion: 0.29
Nodes (6): colors, icons, Toast, ToastContext, ToastContextValue, ToastType

### Community 31 - "Community 31"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 32 - "Community 32"
Cohesion: 0.40
Nodes (3): Config, config, tailwindcss

### Community 33 - "Community 33"
Cohesion: 0.40
Nodes (4): buildCommand, framework, installCommand, outputDirectory

### Community 34 - "Community 34"
Cohesion: 0.40
Nodes (4): buildCommand, framework, installCommand, outputDirectory

## Knowledge Gaps
- **234 isolated node(s):** `hris-backend`, `nextConfig`, `name`, `version`, `private` (+229 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 347 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Community 0` to `Community 1`, `Community 2`, `Community 5`, `Community 7`, `Community 12`, `Community 18`, `Community 22`, `Community 23`?**
  _High betweenness centrality (0.237) - this node is a cross-community bridge._
- **Why does `react` connect `Community 5` to `Community 1`, `Community 2`, `Community 7`, `Community 8`, `Community 12`, `Community 13`, `Community 14`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 24`, `Community 26`, `Community 27`, `Community 28`, `Community 29`, `Community 30`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `Community 5` to `Community 1`, `Community 2`, `Community 7`, `Community 8`, `Community 12`, `Community 13`, `Community 14`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 24`, `Community 26`, `Community 27`, `Community 28`, `Community 29`, `Community 30`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **What connects `hris-backend`, `nextConfig`, `name` to the rest of the system?**
  _234 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05978960927436668 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05551020408163265 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.0563265306122449 - nodes in this community are weakly interconnected._