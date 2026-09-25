# Feature Audit HRIS

Sumber spesifikasi: `PRD.md`, `DESIGN.md`, dan plan `/Users/imambas/.claude/plans/glimmering-wandering-dusk.md`.

**Status**
- `done` — UI + API + persistence berjalan, tidak bergantung pada mock sebagai source of truth.
- `partial` — sebagian flow nyata, tetapi ada bagian dummy, endpoint belum lengkap, atau aturan bisnis belum production-grade.
- `dummy` — UI/action masih hardcoded, local state, `setTimeout`, toast-only, atau placeholder.
- `missing` — belum ada implementasi backend/UI.

**Catatan arsitektur**
Ada dua backend:
1. **Next.js API routes** (`frontend/src/app/api/**`) → Supabase PostgreSQL. Ini yang dipakai frontend production (`NEXT_PUBLIC_API_URL=/api`).
2. **FastAPI legacy** (`backend/app`) → SQLAlchemy. Hanya expose `auth` dan `employees`. Tidak dipakai frontend production, tapi `docker-compose.yml` mengarahkan frontend ke `http://localhost:8000/api/v1`, sehingga sebagian besar flow akan `404` di Docker.

---

## Ringkasan status

| Status | Jumlah area |
|---|---|
| done | 6 |
| partial | 13 |
| dummy | 8 |
| missing | 12 |

---

## 1. Auth & Identity

| Fitur | Modul | Status | Referensi file | Catatan gap vs PRD |
|---|---|---|---|---|
| Login + access/refresh token | backend, frontend | partial | `backend/app/api/v1/auth.py`, `frontend/src/app/api/auth/login/route.ts`, `.../refresh/route.ts` | PRD 4.6: token OK. Refresh belum reuse-detection/rotation revocation. |
| `/auth/me` identity check | frontend | done | `frontend/src/app/api/auth/me/route.ts` | Sudah memakai `requireUser()` (JWT signature verified). Sebelumnya decode payload mentah. |
| Role-based access control (RBAC) | backend, frontend | partial | `backend/app/dependencies.py`, `frontend/src/lib/server/auth.ts` | PRD 12.1: role matrix 9 role + custom role belum ada; hanya allowlist 4-5 role. `requirePermission()` ada tapi belum dipakai route. |
| Data-level access (manager dept / employee own) | frontend | partial | `frontend/src/app/api/{leave,expenses,attendance,documents}/*` | PRD 12.2: employee-own sudah ada untuk leave/expenses/attendance/documents. Scope manager per-departemen belum ada. |
| Tenant/organization isolation | frontend | partial | `supabase/migrations/20260924100000_tenant_rbac_foundation.sql` | PRD 2.3 menetapkan multi-tenant = v2.0; tetap dibangun lebih awal. Banyak route read/update/delete belum `.eq('organization_id')`, RLS belum ada. |
| MFA / SSO SAML-OIDC / SCIM / session revocation | backend, frontend | missing | — | PRD 4.7 security: belum ada. |
| Password policy, lockout, rate limit, CSRF | backend, frontend | missing | — | PRD 4.7: belum ada. |
| Demo role accounts (5 role) | frontend | done | `supabase/migrations/20260924110000_seed_role_users.sql`, `frontend/src/app/login/page.tsx` | Demo only; harus dirotasi sebelum production. Ada risiko hash seed tidak match dengan kredensial UI. |

---

## 2. Employee Master Data (PRD Module 1)

| Fitur | Modul | Status | Referensi file | Catatan gap vs PRD |
|---|---|---|---|---|
| Create employee (NIK/NPWP/kontak/rekening) | backend, frontend | partial | `frontend/src/app/api/employees/route.ts`, `backend/app/api/v1/employees.py` | PRD 1.1: NIK 16 digit + NPWP format divalidasi. Pendidikan & riwayat kerja tidak ada. Employee ID `EMP-YYYYMMDD-XXX` buatan read-then-insert, race-prone. |
| Employee ID auto-generate | backend, frontend | partial | `frontend/src/app/api/employees/route.ts:69-75`, `backend/app/utils/validators.py` | PRD 1.1 format benar, tetapi tidak atomic. |
| Unique NIK/NPWP duplication check | frontend | done | `frontend/src/app/api/employees/route.ts` (DB unique + 409) | Sesuai PRD 1.1. |
| Audit trail create | frontend, backend | done | `audit_logs` insert di employees/departments/leave/payroll/etc | PRD 1.1: sebagian besar mutation sudah mencatat; coverage belum 100% dan belum immutable. |
| Redirect ke profile detail setelah create | frontend | partial | `frontend/src/app/(dashboard)/employees/new/page.tsx` | Halaman detail masih dummy, jadi redirect membawa user ke data hardcoded. |
| Bulk import CSV/Excel (1000 rows, preview, validation report) | backend, frontend | missing | — | PRD 1.2: belum ada sama sekali. |
| ESS own-profile edit (alamat, kontak, rekening, HP) | frontend | partial | `frontend/src/app/(dashboard)/self-service/page.tsx` | PRD 1.3: alamat/HP/emergency lewat `PUT /employees/[id]`, tapi route itu `requireAdmin`, jadi employee biasa kena 403. Rekening bank belum bisa diedit sendiri. |
| Approval untuk field sensitif (NIK/NPWP/nama) | backend | missing | — | PRD 1.3: belum ada. |
| Employment history timeline | frontend, backend | missing | — | PRD 1.4 tab Profile/Employment/Documents/Attendance/Leave/Payroll belum ada sebagai endpoint history. |
| Employee detail page (tab) | frontend | dummy | `frontend/src/app/(dashboard)/employees/[id]/page.tsx` | Semua data hardcoded, tidak baca route ID, edit hanya toast, tombol Preview/Download dokumen tanpa handler. |
| Export employee report PDF | frontend | missing | — | PRD 1.4: belum ada. |

---

## 3. Organizational Structure (PRD Module 2)

| Fitur | Modul | Status | Referensi file | Catatan gap vs PRD |
|---|---|---|---|---|
| CRUD department (name, code, parent, head, cost center) | backend, frontend | done | `frontend/src/app/api/departments/{route.ts,[id]/route.ts}` | Sesuai PRD 2.2; guard delete jika masih ada employee. |
| CRUD position (title, level, grade, dept, salary range) | backend | missing | `backend/app/models/department.py` (model Position ada, tidak ada router) | PRD 2.2: model saja, tidak ada endpoint/UI positions. |
| Hierarchical department tree | frontend | partial | `frontend/src/app/(dashboard)/departments/page.tsx` | parent tersimpan, tree view terbatas. |
| Interactive org chart (zoom/pan/collapse, 8 level) | frontend | dummy | `frontend/src/app/(dashboard)/org-chart/page.tsx` | Teams hardcoded, add-member hanya toast; PRD 2.1 penuh tidak terpenuhi. |
| Auto-update org chart saat hierarchy berubah | frontend | missing | — | PRD 2.1. |

---

## 4. Attendance Management (PRD Module 3)

| Fitur | Modul | Status | Referensi file | Catatan gap vs PRD |
|---|---|---|---|---|
| Web check-in / check-out employee sendiri | frontend | done | `frontend/src/app/api/attendance/{route.ts,[id]/route.ts}`, `(dashboard)/attendance/page.tsx` | PRD 3.1: clock-in/out scoped ke `user.employee_id`, clock-out server timestamp. |
| GPS coordinates saat check-in | frontend | missing | — | PRD 3.1: belum ada. |
| Late detection grace period (default 10 mnt) | frontend | partial | `attendance/route.ts` `lateMinutes` dihitung dari jam 09:00 hardcode | PRD 3.1/3.4: grace period tidak configurable. |
| Early-leave detection | frontend | missing | — | PRD 3.1: belum ada. |
| Double check-in / checkout sebelum check-in ditolak | frontend | done | duplicate pre-check + `.is('check_out', null)` | Sebagian sesuai; unique constraint DB belum dijamin. |
| Manual entry oleh HR + flag Manual | frontend | done | `attendance/route.ts` `source='manual'` + `requireAdmin` | PRD 3.2 meminta approval HR Manager terpisah — belum ada. |
| Team attendance grid (employee × date), warna, export | frontend | partial | `(dashboard)/attendance/page.tsx` (tabel terfilter) | PRD 3.3: grid dan export Excel belum ada; auto-refresh 30 dtk tidak ada. |
| Configure attendance rules & work schedule/shift | frontend | missing | — | PRD 3.4: sepenuhnya belum ada. |
| Attendance export Excel | frontend | missing | — | PRD 3.3. |

---

## 5. Leave Management (PRD Module 4)

| Fitur | Modul | Status | Referensi file | Catatan gap vs PRD |
|---|---|---|---|---|
| Submit leave request | frontend | done | `frontend/src/app/api/leave/route.ts` | PRD 4.1: bekerja & persisted. |
| Leave types lengkap (AL/SL/PL/ML/PT/BL/MR/HJ/UL/CB) | frontend | partial | `leave/route.ts` `LEAVE_TYPES` hanya 5 type | PRD 4.1 meminta 10 type. |
| Validasi overlap tanggal | frontend | partial | `leave/route.ts` read-before-insert | PRD 4.1: race-prone, belum DB exclusion constraint. |
| Balance sebelum submit (sisa hari per type) | frontend | missing | `leave_balances` table ada, tidak ada API | PRD 4.1/4.3: belum ada. |
| Sick leave > 2 hari butuh dokumen | backend | missing | — | PRD 4.1. |
| Notifikasi ke direct manager saat submit | backend | missing | — | PRD 4.1: notifications table ada, tetapi tidak ada trigger. |
| Approval queue untuk manager | frontend | partial | `(dashboard)/leave/page.tsx` admin view | PRD 4.2: manager scope (hanya team sendiri) belum ada. |
| Approve → auto-update balance & calendar | frontend | partial | `leave/[id]/approve/route.ts` (status saja) | PRD 4.2: `used_days` tidak dikurangi; attendance calendar tidak terupdate. |
| Reject wajib reason | frontend | done | `leave/[id]/reject/route.ts` | Sesuai PRD 4.2. |
| Approval HR Director untuk cuti > 3 hari | backend | missing | — | PRD 4.2 multi-level approval belum ada. |
| Delegation approval | backend | missing | — | PRD 4.2. |
| Leave balance widget/history/calendar | frontend | dummy | `(dashboard)/leave/page.tsx` balance hardcoded | PRD 4.3: belum terhubung. |
| Accrual tahunan, reset 1 Jan, pro-rata join date | backend | missing | — | PRD 4.3. |

---

## 6. Payroll (PRD Module 5)

| Fitur | Modul | Status | Referensi file | Catatan gap vs PRD |
|---|---|---|---|---|
| Payroll period create/list/process/lock | frontend | done | `frontend/src/app/api/payroll/{route.ts,periods/route.ts,[id]/process/route.ts,[id]/lock/route.ts}` | Workflow persisten. |
| Auto-sync attendance (kerja, late, absen, overtime) | backend | missing | `payroll/[id]/process/route.ts` | PRD 5.1: tidak ada sync attendance. |
| Component calculation (basic, allowance, overtime 1.5x/2x/3x) | frontend | partial | `payroll/[id]/process/route.ts` | Allowance = 10% hardcode, overtime = 0. PRD 5.1 tidak terpenuhi. |
| PPh 21 progressive / TER + PTKP | backend | missing | — | PRD 5.1 & Appendix A: formula fixed 5% — tidak compliant. |
| BPJS Kesehatan/JHT/JP dengan cap | backend | missing | — | PRD 5.1 & Appendix B: fixed 4%/3% tanpa cap. |
| Manual adjustment (bonus, komisi, deduction) | backend | missing | — | PRD 5.1. |
| Draft preview sebelum submit | frontend | partial | period `draft` status | Preview entry ada, tapi perhitungan belum benar. |
| Two-step approval (HR Officer → HR Manager) | backend | missing | — | PRD 5.2: hanya process+lock tanpa maker-checker. |
| Approved payroll immutable + adjustment record | backend | partial | `lock` status | Belum ada adjustment record. |
| ESS payslip (breakdown PPh21/BPJS, PDF, history) | frontend | dummy | `(dashboard)/self-service/page.tsx` `serverPayslips=[]` | PRD 5.3: endpoint employee-scoped belum ada. |
| Bank transfer file (BCA/Mandiri/BRI/BNI) | backend | missing | — | PRD 5.4. |
| THR auto-calculation PP 78/2015 | backend | missing | — | PRD 5.5. |
| Payroll detail page | frontend | dummy | `(dashboard)/payroll/[id]/page.tsx` | Object hardcoded, tidak baca ID; "Download PDF" membuat CSV. |

---

## 7. Expense / Reimbursement (PRD Module 6)

| Fitur | Modul | Status | Referensi file | Catatan gap vs PRD |
|---|---|---|---|---|
| Submit claim (category, amount, date, description) | frontend | done | `frontend/src/app/api/expenses/route.ts` | PRD 6.1. |
| Upload receipt ≤10MB | frontend | partial | `receipt_attached` flag | PRD 6.1: field boolean saja, file receipt tidak benar-benar diupload. |
| Claim categories sesuai PRD (Transport, Meal, Accommodation...) | frontend | partial | `expenses/route.ts` `CATEGORIES` 6 opsi berbeda | PRD 6.1 list type berbeda. |
| Auto-route ke direct manager | backend | missing | — | PRD 6.1: approve langsung `requireAdmin`, tanpa routing. |
| Manager approval/reject dengan reason | frontend | done | `expenses/[id]/{approve,reject}/route.ts` | PRD 6.2: approve/reject ada. |
| Approval ladder > Rp 5.000.000 → HR Director | backend | missing | — | PRD 6.2. |
| Bulk approve | frontend | missing | — | PRD 6.2. |
| Claim → payroll inclusion | backend | missing | — | PRD 6.2. |
| Claim number race-safe | frontend | partial | `expenses/route.ts` latest+1 | PRD 6.1: race-prone (DB unique menang, tetapi error mapping generic). |

---

## 8. Recruitment (PRD Module 7)

| Fitur | Modul | Status | Referensi file | Catatan gap vs PRD |
|---|---|---|---|---|
| Job posting create (title, dept, type, openings, desc) | frontend | done | `frontend/src/app/api/recruitment/vacancies/route.ts` | PRD 7.1 sebagian; lokasi, salary range, template, approval publish belum ada. |
| Job posting status Draft → Pending → Published → Closed | backend | missing | — | PRD 7.1. |
| Candidate pipeline kanban + drag & drop | frontend | done | `(dashboard)/recruitment/page.tsx` + `recruitment/[id]/route.ts` | PRD 7.2: stage workflow ada. |
| Configurable stages & bulk reject | frontend | partial | STAGES hardcode 6 stage | PRD 7.2 meminta config + bulk update. |
| Source tracking | frontend | partial | `source` field tersimpan | PRD 7.2. |
| Schedule interview (date, time, interviewer) | frontend | done | `recruitment/[id]/interview/route.ts` | PRD 7.3: type interview, conflict check, auto-notify, scoring form belum ada. |
| Candidate notes/score | frontend | done | `recruitment/[id]/notes/route.ts` | PRD 7.2. |
| Candidate-to-employee conversion | backend | missing | — | PRD 7.2 flow hire→onboarding belum ada. |

---

## 9. Onboarding (PRD Module 8)

| Fitur | Modul | Status | Referensi file | Catatan gap vs PRD |
|---|---|---|---|---|
| Create onboarding record + checklist | frontend | done | `frontend/src/app/api/onboarding/route.ts` | PRD 8.1. |
| Task toggle & progress % | frontend | done | `onboarding/[id]/tasks/[taskId]/route.ts` | PRD 8.1. |
| Complete hanya setelah semua task | frontend | done | `onboarding/[id]/complete/route.ts` | Idempotent guard. |
| Configurable template per dept/posisi | frontend | partial | template 12 task fixed di route | PRD 8.1: tidak configurable. |
| Auto-trigger saat hire confirmed | backend | missing | — | PRD 8.1. |
| Reminder overdue task | backend | missing | — | PRD 8.1. |
| Pre-boarding/Day1/Week1/Month1 phase | frontend | missing | — | PRD 8.1. |
| New hire document submission portal | frontend | partial | Documents module terpisah | PRD 8.2: submission checklist + verify/return status belum ada. |
| Onboarding checklist page (standalone) | frontend | dummy | `(dashboard)/onboarding/checklist/page.tsx` | Sepenuhnya local-state, schema beda dari API, semua mutation hilang saat reload. |
| Atomic create record+tasks | backend | partial | `onboarding/route.ts` insert terpisah | Tidak transactional. |

---

## 10. Offboarding (PRD Module 9)

| Fitur | Modul | Status | Referensi file | Catatan gap vs PRD |
|---|---|---|---|---|
| Offboarding clearance workflow | backend, frontend | missing | — | PRD 9.1 seluruhnya belum ada (no table/API/UI). |
| Final settlement calculation & PDF | backend | missing | — | PRD 9.1. |
| Status inactive setelah offboarding | frontend | partial | `employees/[id]/route.ts` DELETE = soft delete | Hanya tombol matikan, bukan workflow clearance. |

---

## 11. Document Management (PRD Module 10)

| Fitur | Modul | Status | Referensi file | Catatan gap vs PRD |
|---|---|---|---|---|
| Upload & simpan document (metadata + file) | frontend | done | `frontend/src/app/api/documents/route.ts`, Supabase Storage | PRD 10.1. |
| Akses: HR all / employee own | frontend | done | `documents/route.ts` GET scope | PRD 10.1 sesuai. |
| Expiry status + reminder + renewal | frontend | done | `documents/[id]/{remind,renew}/route.ts` | PRD 10.1 auto-notify 30 hari: flag ada, notifikasi otomatis tidak. |
| Search by name/type/date | frontend | partial | `documents/route.ts` search + type | Date range belum ada. |
| Kategori Personal/Employment/Company | frontend | partial | TYPES: Contract/Identity/Tax/Benefits/Legal/Medical | Berbeda dari PRD 10.1. |
| DOCX support | frontend | missing | `TYPES` PDF/PNG/JPG/WebP saja | PRD 10.1. |
| Version control / upload version history | backend | missing | — | PRD 10.1. |
| Batch document request | frontend | dummy | `(dashboard)/documents/page.tsx` `RequestDocsModal` `setTimeout` | Belum ada `document_requests` table/API. |
| Policy templates download | frontend | dummy | `PolicyTemplatesModal` text placeholder | Placeholder text, bukan file nyata. |
| Statistik storage/total | frontend | dummy | StatCard `+1278`, `2.8 GB/1.2 GB` hardcoded | — |

---

## 12. Reporting & Analytics (PRD Module 11)

| Fitur | Modul | Status | Referensi file | Catatan gap vs PRD |
|---|---|---|---|---|
| Dashboard KPI + headcount trend | frontend | done | `frontend/src/app/api/dashboard/route.ts` | PRD 11.1 sebagian: headcount/dept trend dari data nyata. |
| Turnover rate, payroll total, attendance rate KPI | frontend | partial | `(dashboard)/page.tsx` | PRD 11.1: turnover masih N/A / placeholder. |
| Charts: turnover trend, payroll by dept, leave by type, age/gender | frontend | missing | — | PRD 11.1 belum ada. |
| Alerts panel (contract expiring, probation, birthdays) | frontend | missing | — | PRD 11.1. |
| Reports standard (Headcount, Turnover, Attendance, Leave, Overtime, Payroll, PPh21, BPJS...) | frontend | dummy | `(dashboard)/reports/page.tsx` | Data + KPI + chart hardcoded; tidak ada `/api/reports`. |
| Generate report | frontend | dummy | `generateReport` `setTimeout` + toast | Tidak memanggil API. |
| Export PDF/Excel/CSV | frontend | dummy | `downloadReport` selalu CSV berisi *"UI preview export generated from mock data."* | PRD 11.2. |
| Report preview + Share/Export PDF | frontend | dummy | `reports/[id]/preview/page.tsx` | Share & Export PDF tanpa `onClick`. |
| Date range filter semua report | frontend | missing | — | PRD 11.2. |

---

## 13. Audit Log & Compliance

| Fitur | Modul | Status | Referensi file | Catatan gap vs PRD |
|---|---|---|---|---|
| Audit viewer API (admin) | frontend | done | `frontend/src/app/api/audit-log/route.ts` | Role scoped + tenant scope. |
| Audit write di mutation utama | frontend | done | `audit_logs` inserts (semua kini membawa `organization_id`) | Coverage belum 100%. |
| Audit UI data nyata | frontend | partial | `(dashboard)/audit-log/page.tsx` | Masih ada 45 fixture `Math.random` sebagai dead code; KPI `2,847/486/12` hardcoded; icon/color mapping API→view belum ada; search tidak refetch. |
| Immutable audit / hash-chain / WORM | backend | missing | — | PRD 4.7. |
| Retention, legal hold, export governance, anomaly alert | backend | missing | — | PRD 4.7. |

---

## 14. Settings & Configuration

| Fitur | Modul | Status | Referensi file | Catatan gap vs PRD |
|---|---|---|---|---|
| Simpan konfigurasi organisasi | frontend | dummy | `(dashboard)/settings/page.tsx:157-162` | `setTimeout(700)` + toast; tidak ada tabel/API. Data hilang setelah reload. |
| Reset settings | frontend | dummy | `handleReset` local state only | — |
| Role/permission management UI | frontend | missing | — | PRD 12.1 custom role, matrix, assignment. |
| Attendance/leave rule configuration | frontend | missing | — | PRD 3.4 / 4.x. |

---

## 15. Calendar, Directory, Org Chart, Self-service

| Fitur | Modul | Status | Referensi file | Catatan gap vs PRD |
|---|---|---|---|---|
| Calendar events (leave/attendance/interview/onboarding) | frontend | dummy | `(dashboard)/calendar/page.tsx` | Department, employee, event, attendance semuanya hardcoded; tanpa API. |
| Directory employee | frontend | dummy | `(dashboard)/directory/page.tsx` | 8 record hardcoded. |
| Org chart | frontend | dummy | `(dashboard)/org-chart/page.tsx` | Teams hardcoded. |
| ESS profile/leave/attendance | frontend | partial | `(dashboard)/self-service/page.tsx` | API dipakai untuk profile/leave/attendance; fallback static masih ada. |
| ESS payslip | frontend | dummy | `self-service` `serverPayslips=[]` | Tidak ada endpoint employee payroll. |
| ESS expense & document requests | frontend | partial | Documents API dipakai untuk read | Form claim expense terpisah di Expenses. |

---

## 16. Platform, Data & Operations

| Fitur | Modul | Status | Referensi file | Catatan gap vs PRD |
|---|---|---|---|---|
| Supabase migration & seed | database | done | `supabase/migrations/*.sql` | PRD 4.6. |
| Tenant columns `organization_id` | database | done | `20260924100000_tenant_rbac_foundation.sql` | Not NULL di 17 tabel; INSERT sudah dilengkapi. |
| RLS policy | database | missing | — | Service-role bypass; isolation hanya di query aplikasi. |
| Composite FK same-tenant | database | missing | — | UUID FK tidak menjamin tenant sama. |
| Unique `attendance(employee_id,date)` | database | missing | hanya pre-check aplikasi | Race-prone. |
| Atomic sequence (employee id, claim no) | backend | partial | read-then-insert | PRD 1.1 race. |
| Transaction / RPC (payroll, onboarding, leave overlap) | backend | missing | — | Insert terpisah tanpa rollback. |
| Idempotency + optimistic concurrency | backend | missing | — | PRD 4.8. |
| Queue/outbox/retry/DLQ | backend | missing | `backend/app/tasks/__init__.py` kosong | Notification delivery butuh ini. |
| Email/SMS/push provider | backend | missing | `backend/app/services/__init__.py` kosong | Bulk email & reminder hanya toast. |
| Integration (bank, BPJS, pajak, attendance device, accounting, e-sign) | backend | missing | PRD 4.4 | — |
| Testing strategy | backend, frontend | missing | `backend/tests` hanya `__init__.py`; tidak ada test script frontend | PRD 5.3. |
| CI workflow | ops | missing | tidak ada `.github/workflows` | PRD 5.4. |
| Structured logs, metrics, tracing, health | backend | partial | FastAPI `/health`, `/ready` saja | Next API hanya `console.error`. |
| Backup/PITR, restore drill, RPO/RTO | ops | missing | — | PRD 4.8/5.4. |
| Docker production-ready | ops | partial | `docker-compose.yml` `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1` | Dev server + frontend menunjuk FastAPI legacy → banyak flow `404`. |
| Non-atomic seed demo (current_date) | database | partial | `20260923090001_seed_attendance.sql` | Tanggal berganti tiap hari; non-deterministic. |
| Migration replay idempotency | database | partial | `20260922120001_hris_initial.sql:79` ALTER tanpa guard | Replay gagal `duplicate constraint`. |

---

## 17. Design system compliance (`DESIGN.md`)

| Fitur | Modul | Status | Referensi file | Catatan gap |
|---|---|---|---|---|
| Token warna/typography/layout | frontend | done | `frontend/src/app/globals.css`, `tailwind.config.ts` | Sesuai DESIGN.md sections Colors/Typography/Layout. |
| Dark mode | frontend | partial | `ThemeProvider.tsx`, `[data-theme=dark]` | Toggle bekerja untuk token; banyak class hardcoded (`bg-red-50`, `amber-50`, `indigo-100`) tetap terang. Hydration flash saat load. |
| Topbar & responsive behavior | frontend | partial | `components/layout/{Topbar,Sidebar}.tsx` | Sudah dynamic user display; sidebar belum di-filter per role/permission. |
| Known gaps pada DESIGN.md | frontend | partial | `DESIGN.md:564 Known Gaps` | Masih ada gap komponen yang tidak diimplementasikan. |

---

## 18. Tombol / aksi yang masih dummy

| Aksi | Modul | Status | Referensi file | Catatan gap vs PRD |
|---|---|---|---|---|
| Settings Save / Reset | frontend | dummy | `(dashboard)/settings/page.tsx` | Tidak ada persistensi. |
| Report Generate / Export Center / format export | frontend | dummy | `(dashboard)/reports/page.tsx` | Placeholder mock data. |
| Report preview Share / Export PDF | frontend | dummy | `reports/[id]/preview/page.tsx:89` | Tanpa handler. |
| Employee detail Edit / Preview doc / Download doc / More | frontend | dummy | `employees/[id]/page.tsx` | Local state + tanpa handler. |
| Payroll detail Download PDF | frontend | dummy | `payroll/[id]/page.tsx` | Menghasilkan CSV, label PDF. |
| Org Chart Add member | frontend | dummy | `org-chart/page.tsx:262-267` | Toast saja. |
| Documents Request documents / policy templates | frontend | dummy | `documents/page.tsx` | `setTimeout` dan text placeholder. |
| Employees bulk email | frontend | dummy | `employees/page.tsx:439-443` | Toast saja; tidak ada email provider. |
| Onboarding checklist add/advance/delete | frontend | dummy | `onboarding/checklist/page.tsx` | Local-only. |
| Toolbar Filter / Export | frontend | partial | `components/ui/Toolbar.tsx:18-22` | Belum dipakai halaman aktif; tanpa callback. |

---

## 19. Prioritas berikutnya

**P0 — security & integrity**
1. Scope `organization_id` ke seluruh route read/update/delete yang tersisa.
2. Aktifkan RLS + composite same-tenant FK.
3. Ganti `requireAdmin()` coarse dengan `requirePermission()` di semua route.
4. Authorization regression tests (tenant A/B, ownership, field-level).
5. Perbaiki migration replay idempotency + unique attendance constraint.

**P1 — hilangkan dummy & benahi data**
6. Settings persistence (table + GET/PATCH `organization:write`).
7. Employee detail & Payroll detail → API nyata.
8. Leave balance API + accounting saat approve.
9. Employee-scoped payslip API.
10. Hapus dead fixture (audit-log random, leave `initialRequests`, self-service constants, mock stats).
11. Relabel/hapus aksi fake: email, PDF, export, template.
12. Directory, Org Chart, Calendar → API employees/departments/leave/attendance.

**P1 — aturan bisnis PRD yang hilang**
13. Payroll PRD 5.1–5.5: sync attendance, PPh 21/TER/PTKP, BPJS cap, THR, two-step approval, bank file.
14. Attendance PRD 3.3–3.4: grid, export, shift/grace config.
15. Reports PRD 11.1–11.2: aggregation endpoint + export nyata.
16. Recruitment PRD 7.1: job posting approval/status + candidate conversion.
17. Offboarding PRD 9.1 (belum mulai).

**P2 — platform & enterprise**
18. MFA/SSO/SCIM, secure session storage, rate limiting.
19. Queue/outbox notification delivery, integrations, observability.
20. CI + test suite (unit, integration, E2E, security, payroll golden case).
21. Backup/DR, performance & load tests.
22. Pilih satu backend boundary (Next API vs FastAPI) dan samakan konfigurasi Docker.

---

## 20. Launch gate

Jangan klaim production-ready sebelum:

- Tidak ada cross-tenant read/write/delete yang lolos test.
- Semua identity endpoint memverifikasi signature JWT.
- Semua insert domain menyertakan `organization_id`.
- Tidak ada aksi UI dummy yang menampilkan "success" tanpa server response.
- Payroll sesuai UAT Indonesia (PPh 21/TER, PTKP, BPJS, THR).
- Backup/restore dan security test lulus.
