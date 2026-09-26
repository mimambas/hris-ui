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
