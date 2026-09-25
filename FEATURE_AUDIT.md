# HRIS Feature Audit — Implementation Goal

Target: semua feature berstatus `done`, tidak ada dummy/placeholder, dan setiap feature memiliki test yang lulus.

## Status saat ini

Fondasi sudah ditingkatkan: tenant/RBAC migration, ownership hardening, settings persistence, audit log, self-service dasar, dan demo documentation sudah tersedia. Namun audit masih memiliki banyak `partial`, `dummy`, dan `missing`; status `done` tidak boleh diklaim sebelum acceptance test yang relevan lulus.

## Slice terbaru

| Fitur | Modul | Status | Referensi | Test |
|---|---|---|---|---|
| Organization settings persistence | backend/frontend/database | partial | `frontend/src/app/api/settings/route.ts`, `frontend/src/app/(dashboard)/settings/page.tsx`, `supabase/migrations/20260925100000_organization_settings.sql` | API GET production `200`; PATCH persistence test belum dibuat |
| Tenant organization foundation | database/backend | partial | `supabase/migrations/20260924100000_tenant_rbac_foundation.sql`, `frontend/src/lib/server/auth.ts` | Cross-tenant regression tests belum ada |
| Audit organization scoping | frontend | partial | `frontend/src/app/api/audit-log/route.ts`, audit inserts | Typecheck/build pass; complete route matrix test belum ada |
| User guide page | frontend | done | `frontend/src/app/guide/page.tsx` | Build pass; manual browser test diperlukan |
| Dynamic topbar identity | frontend | done | `frontend/src/components/layout/Topbar.tsx` | Typecheck/build pass |

## Remaining dummy/placeholder inventory

| Fitur | Modul | Status | Referensi | Gap |
|---|---|---|---|---|
| Settings | frontend | partial | `settings/page.tsx` | Persistence baru selesai; permission/error/field policy tests belum ada |
| Reports generation/export | frontend/backend | dummy | `reports/page.tsx`, `reports/[id]/preview/page.tsx` | Hardcoded chart/KPI, fake setTimeout, placeholder CSV, Share/PDF tanpa handler; tidak ada reports API |
| Calendar | frontend/backend | dummy | `calendar/page.tsx` | Hardcoded employees/events; tidak ada calendar API |
| Directory | frontend/backend | dummy | `directory/page.tsx` | Hardcoded roster; tidak ada directory API/DTO |
| Org chart | frontend/backend | dummy | `org-chart/page.tsx` | Hardcoded teams; add member toast-only; reporting hierarchy belum wired |
| Employee detail | frontend | dummy | `employees/[id]/page.tsx` | Route ID/API tidak dipakai; profile/docs/payroll/leave hardcoded; edit/preview/download inert |
| Payroll detail | frontend/backend | dummy | `payroll/[id]/page.tsx` | Hardcoded payslip; download PDF sebenarnya CSV; employee-scoped payslip API missing |
| Onboarding checklist standalone | frontend/backend | dummy | `onboarding/checklist/page.tsx` | Local-only schema berbeda dari onboarding API |
| Self-service payslip | frontend/backend | dummy | `self-service/page.tsx` | `serverPayslips=[]`; payroll self-service endpoint missing |
| Leave balance | frontend/backend | dummy/missing | `leave/page.tsx`, `leave_balances` table | Balance hardcoded; GET balance API dan approval accounting missing |
| Document requests | frontend/backend | dummy | `documents/page.tsx` RequestDocsModal | setTimeout/toast only; no `document_requests` table/API |
| Document policy templates | frontend | dummy | `documents/page.tsx` PolicyTemplatesModal | Placeholder text download |
| Employee bulk email | frontend/backend | dummy | `employees/page.tsx` | Toast-only; no provider/outbox/email API |
| Audit UI dead fixtures/KPI | frontend | partial | `audit-log/page.tsx` | Random mock fixtures and hardcoded KPI remain; API mapping/filter fixes needed |
| Notification delivery | backend | missing | `notifications` API/table | No email/SMS/push, queue, retry, DLQ |
| Offboarding | backend/frontend | missing | No route/table/page | PRD Module 9 not started |
| Positions CRUD | backend/frontend | missing | Position model only | PRD Module 2.2 expects position management |
| Bulk employee import | backend/frontend | missing | No route | PRD Module 1.2 |

## Remaining security and data-integrity gaps

| Area | Status | Reference | Gap |
|---|---|---|---|
| Tenant read/write scope | partial | `frontend/src/app/api/**`, `organization_id` migration | Some detail/mutation routes remain to audit; RLS missing |
| Permission enforcement | partial | `frontend/src/lib/server/auth.ts` | `requirePermission()` exists but route adoption incomplete; coarse `requireAdmin()` remains |
| Auth/session enterprise | partial | `auth/*`, `lib/api.ts` | MFA/SSO/SCIM/revocation/rate limiting; tokens use localStorage |
| Payroll compliance | partial | payroll process route | Placeholder formulas; no PPh21 TER/PTKP, BPJS caps, THR, overtime, statutory exports |
| Atomic transactions | missing | leave/onboarding/payroll routes | Multi-write operations not transactional/RPC |
| Unique attendance constraint | missing | attendance migration/API | Read-before-insert race remains |
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
9. Implement offboarding, positions, bulk import, notification delivery, and integrations.
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
