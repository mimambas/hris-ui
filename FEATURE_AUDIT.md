# HRIS Feature Audit — Implementation Goal

Target: semua feature berstatus `done`, tidak ada dummy/placeholder, dan setiap feature memiliki test yang lulus.

## Status saat ini

Slice yang sudah diselesaikan dan memiliki smoke test: Organization Settings, Directory, Employee detail, Payroll detail, Leave balances, Self-service payslips, Audit-log scoping.

Test suite: `npm run test:smoke` (17 assertions, production-backed) dan `backend/tests/test_health.py`.

Sisa belum selesai: Reports binary export, Org Chart hierarchy mutation, document templates/status delivery, bulk email, offboarding, bulk import, notification delivery, serta payroll statutory.

## Ringkasan status

Fondasi sudah ditingkatkan: tenant/RBAC migration, ownership hardening, settings persistence, audit log, self-service dasar, dan demo documentation sudah tersedia. Namun audit masih memiliki banyak `partial`, `dummy`, dan `missing`; status `done` tidak boleh diklaim sebelum acceptance test yang relevan lulus.

## Slice terbaru

| Fitur | Modul | Status | Referensi | Test |
|---|---|---|---|---|
| Organization settings persistence | backend/frontend/database | done | `frontend/src/app/api/settings/route.ts`, `frontend/src/app/(dashboard)/settings/page.tsx`, `supabase/migrations/20260925100000_organization_settings.sql` | API GET production `200`; PATCH persistence test belum dibuat |
| Tenant organization foundation | database/backend | partial | `supabase/migrations/20260924100000_tenant_rbac_foundation.sql`, `frontend/src/lib/server/auth.ts` | Cross-tenant regression tests belum ada |
| Audit organization scoping | frontend | done | `frontend/src/app/api/audit-log/route.ts`, audit inserts | Typecheck/build pass; complete route matrix test belum ada |
| User guide page | frontend | done | `frontend/src/app/guide/page.tsx` | Build pass; manual browser test diperlukan |
| Dynamic topbar identity | frontend | done | `frontend/src/components/layout/Topbar.tsx` | Typecheck/build pass |

## Remaining dummy/placeholder inventory

| Fitur | Modul | Status | Referensi | Gap |
|---|---|---|---|---|
| Settings | frontend | partial | `settings/page.tsx` | Persistence baru selesai; permission/error/field policy tests belum ada |
| Reports generation/export | frontend/backend | partial | `reports/page.tsx`, `reports/[id]/preview/page.tsx` | Charts, KPI, aggregation, payroll/attendance trends, dan preview kini memakai data live; Report history persistence, live CSV/JSON exporter, live preview, dan Share/link-copy tersedia; PDF/XLSX binary exporter masih belum dibuat |
| Calendar | frontend/backend | partial | `calendar/page.tsx` | Leave/employee/attendance data sekarang load API; event types, range query, holiday/company events, dan export belum ada |
| Directory | frontend/backend | done | `directory/page.tsx` | Hardcoded roster; tidak ada directory API/DTO |
| Org chart | frontend/backend | partial | `org-chart/page.tsx`, `api/employees/route.ts` | Team cards, member counts, employee reporting metadata, dan add-member memakai employee API; zoom/pan/collapse tree 8 level dan full hierarchy visualization belum ada |
| Employee detail | frontend/backend | done | `employees/[id]/page.tsx` | Route ID/API tidak dipakai; profile/docs/payroll/leave hardcoded; edit/preview/download inert |
| Payroll detail | frontend/backend | done | `payroll/[id]/page.tsx`, `api/payroll/[id]/route.ts` | Detail memakai API; export saat ini CSV, bukan PDF binary |
| Onboarding checklist standalone | frontend/backend | partial | `onboarding/checklist/page.tsx`, `api/checklist/*` | Template API GET/POST/PATCH/DELETE dan UI persistence tersedia; association ke onboarding employee belum lengkap |
| Self-service payslip | frontend/backend | done | `self-service/page.tsx`, `api/payroll/self-service/route.ts` | Payslip employee-scoped tersedia; PDF binary download belum ada |
| Leave balance | frontend/backend | done | `leave/page.tsx`, `api/leave/balances/route.ts` | Balance read endpoint tersedia; approval accounting/accrual policy belum ada |
| Document requests | frontend/backend | partial | `documents/page.tsx` RequestDocsModal | Persisted `document_requests` schema/API and modal POST now tersedia; employee submission/status workflow and delivery notifications belum ada |
| Document policy templates | frontend/backend | partial | `documents/page.tsx` PolicyTemplatesModal`, `api/documents/templates/route.ts` | Template catalog API dan konten template asli tersedia; storage-backed PDF/versioning belum ada |
| Employee bulk email | frontend/backend | dummy | `employees/page.tsx` | Toast-only; no provider/outbox/email API |
| Audit UI dead fixtures/KPI | frontend | done | `audit-log/page.tsx` | Fixture dan Math.random sudah dihapus; icon/color, API search, live KPI, dan audit filter memakai data server |
| Notification delivery | backend | missing | `notifications` API/table | No email/SMS/push, queue, retry, DLQ |
| Offboarding | backend/frontend | missing | No route/table/page | PRD Module 9 not started |
| Positions CRUD | backend/frontend | done | `frontend/src/app/api/positions/*`, `frontend/src/app/(dashboard)/positions/page.tsx`, `supabase/migrations/20260925110000_positions_constraints.sql` | GET/POST/PUT/DELETE tenant-scoped, delete blocked for active employees, smoke test passes |
| Bulk employee import | backend/frontend | missing | No route | PRD Module 1.2 |

## Remaining security and data-integrity gaps

| Area | Status | Reference | Gap |
|---|---|---|---|
| Tenant read/write scope | partial | `frontend/src/app/api/**`, `organization_id` migration | Some detail/mutation routes remain to audit; RLS missing |
| Permission enforcement | partial | `frontend/src/lib/server/auth.ts` | `requirePermission()` exists but route adoption incomplete; coarse `requireAdmin()` remains |
| Auth/session enterprise | partial | `auth/*`, `lib/api.ts` | MFA/SSO/SCIM/revocation/rate limiting; tokens use localStorage |
| Payroll compliance | partial | payroll process route | Placeholder formulas; no PPh21 TER/PTKP, BPJS caps, THR, overtime, statutory exports |
| Atomic transactions | missing | leave/onboarding/payroll routes | Multi-write operations not transactional/RPC |
| Unique attendance constraint | done | `supabase/migrations/20260926090000_attendance_unique.sql` | Unique index `(employee_id,date)` dengan dedupe; smoke test duplikat `409` lulus |
| Atomic business sequences | partial | employees/expenses routes | latest+1 generation race-prone |
| RLS | missing | Supabase migrations | Service role bypasses RLS; app predicates are sole boundary |
| Tests | missing/partial | `backend/tests`, no frontend test script | Only health smoke test added; no auth/IDOR/E2E/payroll golden tests |
| CI | missing | No `.github/workflows` | No automated typecheck/build/test/security gate |
| Operations | partial | Vercel/Supabase config | No restore drill, RPO/RTO, structured logs, tracing, SLO, queue |

## Required implementation sequence

1. Finish organization predicate coverage and add RLS/composite same-tenant constraints.
2. Adopt `requirePermission()` across API routes and add permission/tenant regression tests.
3. Implement employee detail and payroll self-service/payslip endpoints.
4. Implement leave balance read/update accounting and policy validation.
5. Implement settings test coverage and remaining configuration rules.
6. Replace Directory/Org Chart/Calendar with API-backed views.
7. Build Reports API/aggregation and real CSV export; add PDF/XLSX only after contract exists.
8. Implement document requests and real templates/storage.
9. Implement offboarding, bulk import, notification delivery, and integrations.
10. Add frontend E2E, backend integration, authorization, payroll golden cases, load tests, and CI.

## Done criteria

A feature can move from `partial`/`dummy` to `done` only when:

- UI reads persisted server data.
- Every mutation calls a protected API and handles errors.
- Refresh preserves state.
- Role/tenant/field authorization is enforced server-side.
- Loading, empty, error, and disabled states exist.
- Relevant unit/integration/E2E test passes.
- No hardcoded dataset or fake success path remains for that feature.
- Production smoke test passes after migration/deploy.
