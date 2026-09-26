# Changelog

## 2026-09-25

### API review

- Added a non-interactive Next.js ESLint configuration (`frontend/.eslintrc.json`) so lint runs in CI/terminal without opening a setup prompt.
- Fixed the JSX entity lint error in the employee creation page.
- Fixed a missing `employees` dependency in the Calendar `useMemo` hook.
- Confirmed `npm run test:smoke`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, and backend `pytest` pass.
- Backend test environment required Python 3.11 dependency installation from `backend/requirements.txt`; `pytest` now passes 2 tests.
- API review found raw user input interpolated into PostgREST `.or()` filters in Employees, Departments, Expenses, Documents, Recruitment, and Audit Log. Fixed in the "API query hardening" entry below.
- API review found pages without API wiring: Org Chart, Reports, and standalone Onboarding Checklist. These remain documented gaps in `FEATURE_AUDIT.md`.

### 2026-09-25 — API query hardening

- Added `frontend/src/lib/server/query.ts` to escape PostgREST search values, including `%`, `_`, backslash, commas, and parentheses.
- Applied the helper to Employees, Departments, Expenses, Documents, Recruitment, and Audit Log search filters.
- Added `frontend/scripts/test-query.mjs` covering wildcard and filter-injection cases.
- Verified query tests, production smoke tests, TypeScript, and ESLint.

### 2026-09-25 — Reports live data

- Added `/api/reports` aggregating headcount, attendance, leave, and payroll from Supabase, including 6-month payroll and attendance trends.
- Reports page now loads KPI and chart series from the API instead of hardcoded fixtures.
- Preview modal receives live series; removed mock target bars and dead recent-report fixtures.
- Added `reports aggregation` and `reports trends present` smoke assertions; all smoke tests pass after deploy.

### 2026-09-25 — Reports history and export

- Added `report_generations` persistence and `/api/reports/generations` GET/POST.
- Reports generation now records real report metadata and Recent/All Reports load persisted history.
- CSV and JSON export use live report rows; mock export text was removed.
- Added production smoke coverage for report aggregation and trend data.

### 2026-09-25 — Standalone checklist persistence

- Added `checklist_templates` schema and tenant-scoped checklist API.
- Connected standalone Onboarding Checklist load/add/status/delete actions to API.
- Removed hardcoded task fixture source of truth; verified TypeScript, lint, build, and production smoke tests.

### 2026-09-25 — Document request persistence

- Added tenant-scoped `document_requests` schema and GET/POST API.
- Document request modal now loads active employees and persists batch requests instead of using a fake timeout.
- Typecheck, lint, build, and production smoke tests pass.

### 2026-09-25 — Dark mode reliability

- Added a blocking pre-paint theme bootstrap script to preserve the saved theme before hydration.
- Aligned `ThemeProvider` state with the preloaded `<html data-theme>` attribute.
- Added unlayered dark overrides for all hardcoded light utility colors used by the app.
- Verified production HTML contains the bootstrap script before application markup; typecheck, lint, build, smoke, and backend tests pass.

### 2026-09-25 — Audit UI cleanup

- Removed stale random audit fixtures and hardcoded KPI values.
- API audit rows now map category to icon/color and refetch when search/category changes.
- Verified production smoke test, TypeScript, lint, build, and backend tests.

### 2026-09-26 — Org chart add member persistence

- Org Chart "Add team member" now POSTs a real employee with reporting_to and department_id resolved from API data.
- Added required start date field, since employee creation requires join_date.
- Removed the toast-only success path; errors surface from the API.
- Typecheck, lint, build, and production smoke tests pass.

### 2026-09-26 — Attendance uniqueness

- Added a unique `(employee_id, date)` index on attendance with a dedupe step so repeated migrations stay idempotent.
- Added production smoke assertions for attendance create and duplicate rejection (409).
- Fixed Org Chart add-member to persist via `POST /api/employees` with `reporting_to` and department id; start date field added.
- Typecheck, lint, build, and smoke tests pass.

### 2026-09-26 — Org chart hierarchy data

- Org chart now exposes live employee reporting metadata and uses live member counts.
- Added production smoke assertion that employee hierarchy DTOs include `reporting_to`.
- Typecheck, lint, build, and smoke tests pass.

### 2026-09-26 — CI pipeline

- Added `.github/workflows/ci.yml` running frontend typecheck/lint/build, backend pytest, and production smoke tests.
- Added `npm run typecheck` script.
- Org chart now exposes live reporting metadata with a smoke assertion.
- Verified all CI commands locally.

### 2026-09-26 — Offboarding workflow foundation

- Added tenant-scoped offboarding records and clearance tasks.
- Added create/list and task/update/complete APIs.
- Completion requires all clearance tasks and then deactivates the employee with audit trail.
- Added production smoke coverage for offboarding list; full smoke suite passes.

### 2026-09-26 — Complete tenant scoping

- Scoped every remaining API route that queries a table with `organization_id`: dashboard, leave approve/reject, payroll lock/process, notifications GET/PATCH/DELETE/read-all/clear-all.
- Fixed payroll process so entries include `organization_id` (required by the tenant migration) and delete-then-insert stays within the same organization.
- Verified with typecheck, lint, build, and the full production smoke suite.

### 2026-09-26 — RLS defense-in-depth

- Enabled RLS on 26 public tenant/RBAC tables.
- Added idempotent deny policies for direct anon/authenticated table access; server service-role routes remain the app boundary.
- Storage object RLS was not changed because the migration role is not owner of `storage.objects`; document access remains enforced by signed-URL server routes.
- Verified production smoke tests after RLS migration.

### 2026-09-26 — RLS and atomic workflow foundation

- Enabled RLS defense-in-depth on 26 tenant/RBAC tables with direct client deny policies.
- Added atomic payroll process and offboarding completion PostgreSQL functions.
- Payroll process route now calls the atomic RPC, preventing partial delete/insert/status updates.
- RLS migration intentionally does not alter `storage.objects` because the migration role is not its owner; server signed URLs remain the document boundary.

### 2026-09-26 — RBAC schema integrity

- Added a migration making `roles.organization_id` NOT NULL and indexed, preventing memberships from silently losing their role during auth joins.
- Verified no null organization roles exist and production smoke tests pass.

### 2026-09-26 — Offboarding UI

- Added the Offboarding dashboard page with create workflow, employee selector, reason/last-day fields, progress, clearance task toggles, and guarded completion.
- Added Sidebar navigation entry and verified typecheck, lint, build, and production smoke tests.

### 2026-09-26 — Offboarding settlement estimate

- Added tenant-scoped settlement estimate endpoint and UI modal.
- Calculates prorated salary estimate from employee base salary and last working date.
- Clearly labels result as an estimate requiring policy/legal validation; unused leave and deductions remain explicit zero inputs until those ledgers exist.
- Typecheck, lint, build, and production smoke tests pass.

### 2026-09-26 — Atomic leave approval

- Added `leave_approve_atomic` RPC with row lock, status transition, and leave balance increment in one transaction.
- Leave approve route now uses the RPC and rejects requests without a configured balance.
- Verified typecheck, lint, build, and production smoke tests.

### 2026-09-26 — Atomic onboarding create

- Added `onboarding_create_atomic` RPC for record + all template tasks in one transaction.
- Onboarding POST now uses the RPC and cannot leave an orphan record when task insertion fails.
- Typecheck, lint, build, and smoke tests pass.

### 2026-09-26 — Atomic onboarding task transition

- Added `onboarding_task_toggle_atomic` RPC with parent-record row lock and task/parent status update in one transaction.
- Onboarding task route now uses the RPC and rejects changes to completed records.
- Typecheck, lint, build, and smoke tests pass.

### 2026-09-26 — Batch employee import

- Added tenant-scoped `POST /api/employees/import` with 1–1000 row validation and per-row error reporting.
- Added CSV preview/import flow to Employees page using one batch request instead of N sequential writes.
- Added CSV export endpoint and server-owned uniqueness validation.
- Typecheck, lint, build, and production smoke tests pass.

### 2026-09-26 — Settings permission tests

- Added production smoke assertions for settings read/write, persistence, invalid payload, oversized payload, and employee write denial.
- Settings now has a verified organization permission boundary.

### 2026-09-26 — Authorization regression suite

- Added an authorization matrix over audit-log, onboarding, offboarding, recruitment, report generations, checklist, and import endpoints: employee role receives 401/403.
- Added assertions for unauthenticated, forged-token, and empty-authorization rejection.
- Document requests verified by own-employee scoping rather than a blanket 403 (employees may legitimately read their own).
- Marked Tenant organization foundation and Tenant read/write scope as done in the feature audit.

### 2026-09-26 — Recruitment permission slice

- Replaced coarse `requireAdmin()` with `requirePermission(employee:read/write)` across candidate, vacancy, note, and interview routes.
- Existing role/tenant authorization smoke matrix and production smoke tests pass.

### 2026-09-26 — Reports PDF and recruitment permission hardening

- Added a real PDF report export endpoint with organization-scoped employee data and smoke coverage.
- Added dedicated `recruitment:read/write` permissions so employee roles cannot read candidate PII.
- Fixed the authorization regression discovered by smoke tests; full production smoke suite passes.

### 2026-09-26 — Report XLSX export

- Added a real XLSX binary export route using the `xlsx` package.
- Export includes organization-scoped employee rows and correct spreadsheet MIME/content-disposition.
- Added production smoke coverage for both PDF and XLSX exports; all smoke tests pass.

### 2026-09-26 — Document request lifecycle

- Added tenant/employee-scoped PATCH `/api/documents/requests/[id]` for submitted, completed, and cancelled transitions.
- Added invalid-status rejection and audit logging.
- Document request workflow now has create + status transition API contracts.

### 2026-09-26 — Notification delivery outbox

- Added `notification_deliveries` outbox with channel/status/attempts and tenant scoping.
- Added delivery create/list APIs with in-app delivery and invalid-channel validation.
- Added production smoke coverage for notification create, in-app delivery, list, and invalid channel.

### 2026-09-26 — Atomic business sequences

- Added organization-scoped `organization_counters` and `next_business_sequence` RPC.
- Employee IDs and expense claim numbers now use atomic database counters instead of latest-row reads.
- Typecheck, lint, build, and production smoke tests pass.

### 2026-09-26 — Employee bulk email outbox

- Added tenant-scoped `email_outbox` and `/api/employees/bulk-email` queue/list API.
- Bulk email UI now queues messages and explicitly reports that no provider is configured (does not claim delivery).
- Added smoke coverage for admin queue success and employee permission denial.

### 2026-09-26 — XLSX employee import preview

- Employee import modal now accepts CSV, XLSX, and XLS via the existing `xlsx` dependency.
- First worksheet is parsed into the same validation preview before batch API import.
- Typecheck and smoke tests pass.

### 2026-09-26 — Bulk import richer mapping

- Bulk import now resolves tenant-scoped department and position names into UUIDs.
- Imports all rows in one database insert so any database error prevents partial success.
- Validation report includes missing department/position references per row.

### 2026-09-26 — Organization permission slice

- Departments and Positions CRUD routes now use `requirePermission(organization:write)` instead of coarse role allowlists.
- Added production smoke assertions that employees cannot write departments or positions.

### 2026-09-26 — Payroll permission slice

- Payroll read routes now require `payroll:read`; period creation, processing, and locking require `payroll:write`.
- Existing tenant and employee-role smoke tests pass.

### 2026-09-26 — Expense approval permissions

- Expense edit/approve/reject mutations now require `payroll:write` instead of the coarse admin role allowlist.
- Employee ownership remains enforced for employee delete/detail/list paths.

### 2026-09-26 — Authentication organization context

- Login and refresh now reject active users without an organization and include `organization_id` in access-token claims.
- `/auth/me` and `requireUser` continue to re-read the active membership server-side; claims are not authoritative for permissions.
- Typecheck, lint, build, and smoke tests pass.

### 2026-09-26 — Login rate limiting

- Added a bounded in-memory login rate limiter keyed by forwarded IP and email.
- Login returns 429 after 10 attempts per 60-second window; successful auth flow and existing smoke tests remain green.

### 2026-09-26 — Attendance permission slice

- Attendance list/detail reads now require `attendance:read`.
- Manual/self-service attendance writes use `attendance:write` where elevated authorization is required.
- Verified typecheck, lint, build, and production smoke tests.

### 2026-09-26 — Audit and report permissions

- Added `reports:read` permission for HR roles.
- Audit log GET now requires `audit:read`.
- Report aggregation, history, PDF, and XLSX routes now require `reports:read`.
- Verified TypeScript, lint, build, and production smoke tests.

### 2026-09-26 — Employee and leave permission slice

- Leave detail/approval/rejection routes use `leave:read/write`.
- Employee CRUD/import/bulk-email routes use `employee:write`; employee self-service PUT now permits only own contact fields.
- Added smoke assertions for own-profile edit success and cross-employee edit denial.

### 2026-09-26 — Workflow permission matrix

- Added dedicated notification, onboarding, and offboarding read/write permissions.
- Migrated remaining workflow routes from coarse `requireAdmin()` to permission checks, including checklist, notification deliveries, onboarding, offboarding, and notification listing.
- Employee grants are read-only for notifications/onboarding; HR roles receive workflow writes.
- Typecheck, lint, build, and production smoke tests pass.
