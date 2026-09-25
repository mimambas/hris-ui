# Changelog

## 2026-09-25

### API review

- Added a non-interactive Next.js ESLint configuration (`frontend/.eslintrc.json`) so lint runs in CI/terminal without opening a setup prompt.
- Fixed the JSX entity lint error in the employee creation page.
- Fixed a missing `employees` dependency in the Calendar `useMemo` hook.
- Confirmed `npm run test:smoke`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, and backend `pytest` pass.
- Backend test environment required Python 3.11 dependency installation from `backend/requirements.txt`; `pytest` now passes 2 tests.
- API review found raw user input interpolated into PostgREST `.or()` filters in Employees, Departments, Expenses, Documents, Recruitment, and Audit Log. These remain a follow-up hardening item: add shared escaping or switch to safe independent filters before declaring API security complete.
- API review found pages without API wiring: Org Chart, Reports, and standalone Onboarding Checklist. These remain documented gaps in `FEATURE_AUDIT.md`.
