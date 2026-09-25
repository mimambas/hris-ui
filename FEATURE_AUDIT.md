# Feature Audit HRIS

Audit ini memetakan fitur berdasarkan implementasi kode saat ini, bukan hanya tampilan UI.

## Status

- **done** — UI, API, persistence, dan mutation utama sudah tersedia serta tidak bergantung pada mock sebagai source of truth.
- **partial** — sebagian flow sudah nyata, tetapi masih ada data dummy, endpoint yang belum lengkap, atau aturan bisnis yang belum production-grade.
- **dummy** — UI atau mutation masih memakai hardcoded/local state/setTimeout/placeholder.
- **missing** — belum ada implementasi backend atau flow yang dapat digunakan.

## Ringkasan prioritas

| Prioritas | Area | Status | Dampak |
|---|---|---|---|
| P0 | Tenant isolation seluruh route | partial | Banyak route masih perlu predicate `organization_id` dan RLS defense-in-depth. |
| P0 | Auth/RBAC enterprise | partial | `requirePermission()` tersedia, tetapi banyak route masih memakai `requireAdmin()` coarse-grained; MFA/SSO/SCIM belum ada. |
| P0 | Payroll statutory Indonesia | partial | Workflow ada, tetapi formula masih demo dan belum mencakup PPh 21 TER/PTKP, BPJS cap, THR, overtime, prorata, rekonsiliasi. |
| P1 | Settings persistence | dummy | Save hanya local state/toast dan hilang setelah refresh. |
| P1 | Reports | dummy | Data, KPI, chart, generation, dan export masih mock. |
| P1 | Calendar, Directory, Org Chart | dummy | Data masih hardcoded dan belum load dari API. |
| P1 | Employee detail dan Payroll detail | dummy | Detail masih object hardcoded dan tidak membaca route ID. |
| P1 | Leave balance/policy | partial | Request workflow nyata, tetapi balance/accrual/policy belum nyata. |
| P1 | Test/CI/observability | missing | Tidak ada test suite bermakna, CI workflow, SLO, tracing, atau load/security tests. |

## Audit per modul

### Authentication dan authorization — partial

**Sudah ada:**

- Login, refresh token, dan logout client.
- JWT access token dan refresh token.
- Active user serta active organization membership divalidasi oleh `requireUser()`.
- Role dan permission tables sudah dibuat.
- Demo role login shortcuts tersedia di halaman login.

**Belum selesai:**

- Banyak API masih memakai `requireAdmin()` berdasarkan allowlist role, bukan `requirePermission()`.
- Semua read/write route belum terbukti tenant-scoped secara konsisten.
- Supabase RLS policy belum lengkap.
- MFA, SSO SAML/OIDC, SCIM, session revocation, device management, rate limiting, lockout, dan CSRF protection belum ada.
- Token masih disimpan di `localStorage`.
- Demo credentials masih ditampilkan di UI dan hanya boleh dipakai untuk demo.

**File utama:** `frontend/src/lib/server/auth.ts`, `frontend/src/app/api/auth/*`, `frontend/src/components/ui/AuthGuard.tsx`.

### Dashboard — partial

**Sudah ada:**

- Memuat jumlah employee, employee aktif, pending leave, department headcount, dan headcount trend dari API dashboard.
- Quick actions tersedia.

**Belum selesai:**

- Beberapa metrik masih terbatas oleh data yang tersedia.
- Dashboard belum memiliki row/field-level reporting policy enterprise.
- Trend historis dan turnover memerlukan histori effective-dated.

### Employees — partial

**Sudah ada:**

- List, search, filter, pagination, create, update, soft delete.
- Employee list sudah memakai `organization_id`.
- Employee detail API tersedia dan mutation admin dilindungi.

**Belum selesai:**

- Halaman `employees/[id]` masih hardcoded, tidak membaca route ID, dan edit hanya toast/local state.
- Field sensitif salary, bank, NIK, NPWP belum memiliki field-level authorization enterprise.
- Employee ID generation masih read-latest lalu insert, sehingga collision perlu atomic sequence.
- Belum ada effective-dated assignment, history, termination/rehire, dependents, legal entity, branch, dan import bulk tervalidasi.
- Bulk email hanya toast; belum ada provider, outbox, atau delivery status.

### Departments — partial

**Sudah ada:**

- List, search, create, update, delete dengan guard employee.
- Tenant scope mulai diterapkan.

**Belum selesai:**

- Hierarchy/head relationship belum memiliki seluruh composite tenant FK/policy.
- Department history/effective-dated organization belum ada.

### Directory — dummy

- Data directory masih hardcoded.
- Tidak ada API/fetch dari employee records.
- Search/filter hanya memproses fixture lokal.

**Rencana:** gunakan employee API dengan DTO directory yang tidak membocorkan field sensitif.

### Org Chart — dummy

- Teams, member roster, lead, dan counts masih hardcoded.
- Add-member hanya validasi/local state/toast.
- Relasi `reporting_to` belum menjadi sumber chart yang konsisten.

**Rencana:** load employees/departments dari API dan persist reporting relationship dengan validasi tenant.

### Attendance — partial

**Sudah ada:**

- Clock-in/out employee login.
- Manual entry HR.
- List, filter date/status/search, pagination dasar.
- Ownership employee dan tenant scope utama sudah diperbaiki.
- Invalid timestamp dan duplicate response ditangani.

**Belum selesai:**

- Belum ada shift, roster, overnight shift, timezone policy, holiday calendar, break/grace/rounding, geofence, device integration, approval overtime, atau correction workflow.
- Unique `employee_id + date` harus dipastikan oleh database, bukan hanya pre-check.
- Seed attendance harus deterministik dan migration harus idempotent.

### Calendar — dummy

- Department, employee, event, leave, dan attendance display masih hardcoded/synthetic.
- Tidak ada API call.
- Belum ada event aggregation dari leave, attendance, interview, onboarding, holiday, dan company event.

### Leave — partial

**Sudah ada:**

- Employee submit request.
- HR list/filter/detail/approve/reject/cancel.
- Ownership dan tenant predicate mulai diterapkan.
- Overlap basic check.

**Belum selesai:**

- Leave balance UI dan endpoint belum terhubung penuh.
- `used_days` belum otomatis berkurang/bertambah saat approval/cancellation.
- Belum ada accrual, carryover, proration, encashment, workday/holiday calculation, negative balance policy, delegation, attachment, dan approval matrix.
- Overlap check masih read-before-insert dan race-prone.

### Payroll list dan processing — partial

**Sudah ada:**

- Payroll period create/list.
- Process dan lock workflow.
- Payroll entries tersimpan.
- Admin-only workflow dasar.

**Belum selesai:**

- Formula allowance, PPh21, BPJS, dan overtime masih placeholder.
- Belum ada PPh21 TER/PTKP/annual reconciliation, BPJS wage cap, THR, bonus, rapel, pinjaman, prorata, pesangon, UMK/UMP, multi-entity/currency, statutory export, payment file, accounting journal, reconciliation, dan maker-checker.
- Process delete/insert/status update belum atomic transaction/RPC.
- `payroll/[id]` masih hardcoded dan tombol Download PDF sebenarnya CSV lokal.
- Self-service payslip masih selalu kosong karena endpoint employee-scoped belum tersedia.

### Expenses — partial

**Sudah ada:**

- Create/list/detail/delete pending.
- Employee ownership.
- Admin approve/reject/edit.
- Rejection reason dan audit event.
- Tenant scope mulai diterapkan.

**Belum selesai:**

- Receipt bytes/metadata governance belum lengkap.
- Claim number generation read-latest race-prone; collision harus menjadi response terkontrol.
- Approval scope department/finance belum menjadi policy engine.
- Reimbursement payment/accounting integration belum ada.

### Documents — partial

**Sudah ada:**

- Upload ke Supabase Storage dan metadata database.
- Signed download URL.
- Ownership scope employee/admin.
- Delete, reminder, renewal request.
- File type dan 10 MB limit.

**Belum selesai:**

- Document request batch masih `setTimeout`/toast-only dan belum memiliki `document_requests` table/API.
- Policy templates masih download placeholder text.
- Storage object RLS, versioning, e-signature, retention, legal hold, access review, malware scanning, dan immutable download audit belum lengkap.
- Statistic total masih menambahkan `+1278`; storage `2.8 GB/1.2 GB` hardcoded; employee selector masih fixture.

### Notifications — partial

**Sudah ada:**

- User-scoped list.
- Mark read, mark all read, delete, clear all.
- Database persistence.

**Belum selesai:**

- Notification provider/context masih memiliki fixture stale.
- Tidak ada email/SMS/push delivery, template, queue, retry, DLQ, delivery status, atau preference center.
- Admin target user belum memiliki seluruh validation/policy enterprise.

### Recruitment — partial

**Sudah ada:**

- Candidate list/create/delete/update stage.
- Notes dan interview scheduling.
- Vacancy create/list.
- HR/admin access dan audit events.

**Belum selesai:**

- Page masih mempunyai initial candidate fixture/dead fallback.
- Belum ada requisition approval, offer management, candidate-to-employee conversion, background check, consent/retention, e-sign, email/calendar integration, atau structured interview kit.
- Rating finite validation, interview conflict/past date, dan transition policy perlu diperketat.

### Onboarding — partial

**Sudah ada:**

- Onboarding record create/list.
- Checklist task persistence dan toggle.
- Completion guard untuk task incomplete.
- Audit events.

**Belum selesai:**

- `onboarding/checklist` adalah halaman terpisah yang sepenuhnya local-only dengan schema task berbeda.
- Record create dan task insert belum atomic transaction.
- Onboarding record masih bisa free-text dan belum selalu linked ke employee FK.
- Buddy, due date policy, notification, document request, account provisioning, dan integration belum ada.

### Reports — dummy

- Chart, KPI, recent reports, dan report metadata hardcoded.
- Generate report menggunakan `setTimeout`/toast.
- Export mencetak placeholder mock data ke CSV, termasuk format PDF/XLSX yang tetap menjadi CSV.
- Export Center tidak menghasilkan file nyata.
- Report preview statis; Share dan Export PDF belum memiliki handler.
- Tidak ada reports API/aggregation/query layer.

### Audit Log — partial

**Sudah ada:**

- API GET audit log dengan role restriction, filters dasar, dan pagination.
- Banyak mutation sudah menulis audit event.
- UI sudah mencoba load API.

**Belum selesai:**

- UI masih menyimpan 45 fixture random sebagai dead/misleading code.
- API-to-view model belum konsisten untuk icon/color.
- Search effect/dependency dan server-side filter/pagination perlu diperbaiki.
- KPI masih hardcoded.
- Audit belum immutable/hash-chain/WORM, belum ada retention/legal hold, export governance, anomaly alert, dan complete mutation coverage.

### Settings — dummy

- Defaults seluruhnya local state.
- Save hanya delay 700 ms + toast.
- Reset hanya local state.
- Tidak ada settings table/API atau baseline server setelah save.

**Rencana:** organization settings JSONB/normalized table, GET/PATCH tenant-scoped, permission `organization:read/write`, audit changes.

### Self-service — partial

**Sudah ada:**

- Profile API loading dan limited contact update.
- Leave submit/history milik sendiri.
- Attendance loading dan clock state.
- Document request loading.

**Belum selesai:**

- Payslips selalu `[]` karena payroll employee endpoint belum ada.
- Profile/payslip/leave/attendance masih memiliki fallback constants.
- Documents di-load tetapi belum seluruhnya dirender.
- Leave balance, payslip download, expense self-service, notifications preference, dan profile field policy belum lengkap.

### Settings, Reports, Calendar, Directory, Org Chart — missing backend

Belum tersedia route/API yang cukup untuk membuat kelima area tersebut menjadi sumber data production. UI saat ini harus diberi label demo sampai query, mutation, permission, empty/loading/error state, dan persistence dibuat.

## API dan keamanan lintas fitur

### Done/partial

- JWT signature verification tersedia di `requireUser()`.
- Organization dan membership/role/permission tables sudah dibuat.
- Employee route utama dan sebagian route domain sudah memakai `organization_id`.
- Audit insert utama sudah mulai membawa `organization_id`.

### Masih berisiko

- Tidak semua route read/update/delete ter-tenant-scope.
- `requirePermission()` tersedia tetapi belum dipakai konsisten; banyak route masih memakai `requireAdmin()`.
- RLS Supabase belum lengkap.
- Composite FK belum memastikan referenced rows berada dalam tenant yang sama.
- Audit migration/seed yang berubah di branch harus diverifikasi ulang agar kredensial demo tetap match UI.
- Tidak ada authorization regression tests untuk tenant A/B, role, ownership, dan field-level access.

## Database dan operasi

**Missing:**

- Transaction/RPC untuk payroll/onboarding/leave overlap.
- Idempotency key dan optimistic concurrency.
- Atomic business sequences.
- Queue/outbox/retry/DLQ.
- Structured logging, correlation ID, metrics, tracing, health/readiness.
- Backup/PITR, restore drill, RPO/RTO, disaster recovery.
- CI workflow dan test framework.
- Unit, integration, E2E, contract, security/IDOR, load, dan payroll golden-case tests.

## Tombol atau aksi yang masih palsu/tidak lengkap

- Settings Save/Reset.
- Reports Generate/Export Center/Download format.
- Report preview Share/Export PDF.
- Employee detail Edit/Document Preview/Download/More actions.
- Payroll detail Download PDF.
- Org Chart Add member.
- Documents Request documents dan policy template downloads.
- Employees bulk email.
- Toolbar generic Filter/Export jika dipakai.
- Onboarding checklist add/advance/delete masih local-only.

## Rekomendasi urutan berikutnya

1. **P0 security:** tenant-scope semua route, semua insert/audit, RLS, `requirePermission()`, auth regression tests.
2. **P1 data correctness:** settings persistence, leave balance API/approval accounting, employee detail API, payroll employee payslip API.
3. **P1 remove dummy:** delete dead fixtures, fix audit mapping, disable/relabel fake email/PDF/report/template actions.
4. **P1 backend-driven UI:** Directory, Org Chart, Calendar, Reports.
5. **P1 workflow integrity:** transactions, idempotency, atomic sequence, queue/outbox, retry.
6. **P2 enterprise:** statutory payroll, benefits, performance, LMS, succession, integrations, analytics warehouse.

## Launch gate

Jangan klaim production-ready sebelum:

- Tidak ada cross-tenant read/write/delete yang lolos test.
- Tidak ada auth token forgery atau unverified identity endpoint.
- Semua insert domain menyertakan tenant context.
- Dummy action dihapus atau diberi label unsupported.
- Payroll UAT dan golden-case Indonesia lulus.
- Backup/restore dan security test lulus.
