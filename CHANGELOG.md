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
