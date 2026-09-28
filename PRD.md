# Product Requirements Document (PRD)
## HRIS — Human Resource Information System

**Versi dokumen:** 2.0
**Tanggal:** 2026-09-28
**Status:** Target-state requirements; baseline kondisi implementasi dirujuk ke `FEATURE_AUDIT.md` (27 Sep 2026).
**Sumber acuan:** repository saat ini—kode `frontend/`, migrasi `supabase/migrations/`, pengujian, CI, `README.md`, `FEATURE_AUDIT.md`, dan `docs/RECOVERY.md`. Dokumen ini bukan pernyataan bahwa seluruh target telah tersedia.

> **Cara membaca status:** **Tersedia** berarti fungsi teridentifikasi di kode dan/atau pengujian yang dirujuk audit; bukan jaminan telah memenuhi seluruh acceptance criteria target. **Parsial** berarti ada fondasi/fungsi terbatas dengan gap yang disebutkan. **Target** berarti persyaratan produk yang belum boleh dianggap sudah diimplementasikan. Baseline rinci berubah seiring implementasi; `FEATURE_AUDIT.md` adalah inventaris status teknis terkini.

---

## 1. Executive Summary

### Problem Statement

HRIS menyediakan fondasi terpadu untuk data karyawan, proses HR, payroll, dan self-service dalam satu aplikasi tenant-aware. Implementasi saat ini sudah mencakup banyak modul dan kontrol dasar, tetapi tingkat penyelesaian tidak merata: beberapa tampilan masih dummy/parsial, integrasi pengiriman belum aktif, dan aturan payroll serta kebijakan HR masih memerlukan konfigurasi dan validasi bisnis/legal.

### Proposed Solution

Kembangkan aplikasi web HRIS yang saat ini dibangun dengan Next.js dan Supabase menjadi sistem operasional multi-organisasi dengan data tersimpan, akses berbasis izin, alur persetujuan yang dapat diaudit, dan pengalaman konsisten dari employee lifecycle sampai laporan. Tutup gap berdasarkan prioritas, tanpa mengklaim integrasi, kepatuhan, ataupun otomasi sebelum diuji dan disetujui pemilik bisnis.

### Success Criteria

Target numerik belum ditentukan pemilik bisnis. KPI berikut menjadi kontrak pengukuran; nilai target, periode, baseline, dan pemilik masing-masing **TBD**. Jangan mengganti TBD dengan angka asumsi.

| KPI | Definisi pengukuran | Target |
|---|---|---|
| Akurasi dan rekonsiliasi payroll | Proporsi payroll period yang lolos rekonsiliasi input, hasil hitung, approval, dan total pembayaran; definisi error disepakati Finance/HR | TBD |
| Keberhasilan penyelesaian tugas HR | Proporsi workflow leave, onboarding/offboarding, expense, dan document request yang selesai tanpa koreksi manual; ukur per workflow | TBD |
| Adopsi employee self-service | Pengguna karyawan aktif bulanan dibanding karyawan eligible; event/definisi aktif ditetapkan | TBD |
| Kualitas dan keamanan data | Jumlah insiden akses lintas tenant/role, perubahan tanpa audit, dan data invalid yang lolos validasi | TBD; insiden kritis ditargetkan 0 setelah definisi severity dan periode disepakati |
| Ketersediaan dan performa | Availability serta p95 latency endpoint kritis, dilaporkan terpisah per lingkungan | TBD |

**Keputusan yang dibutuhkan:** target KPI, ukuran organisasi/paket pelanggan, wilayah dan aturan ketenagakerjaan yang didukung, pemilik proses HR/Payroll, provider email/penyimpanan, serta target ketersediaan dan pemulihan.

## 2. User Experience & Functionality

### 2.1 Prinsip produk dan lingkup

- Satu aplikasi untuk HR, manager, Finance, recruiter, dan karyawan; navigasi serta aksi mengikuti role, permission, dan organisasi aktif.
- Data bisnis harus bersumber dari API/database. Tidak boleh ada fixture/hardcoded success path yang menyamar sebagai data operasional.
- Setiap halaman memuat state loading, kosong, berhasil, dan error yang dapat dipahami; aksi tulis memberi konfirmasi dan hasil yang dapat diverifikasi setelah refresh.
- Semua tanggal, mata uang, periode, status, dan kebijakan mengikuti konfigurasi organisasi yang disepakati. Zona waktu, locale, dan kalender kerja default masih **TBD**.
- Akses ditolak secara default. Pembatasan UI bukan pengganti pemeriksaan otorisasi server.

### 2.2 User Personas

1. **HR administrator / HR officer** — mengelola data karyawan, dokumen, absensi, cuti, onboarding/offboarding, dan komunikasi operasional. Perlu validasi, bulk action terkontrol, serta jejak audit.
2. **HR manager / HR director** — mengawasi organisasi, menyetujui alur, memantau laporan, dan mengatur kebijakan. Perlu cakupan organisasi, kontrol akses, status workflow, dan audit yang jelas.
3. **Line manager** — melihat anggota tim sesuai cakupan yang diizinkan, mengelola/menyetujui permintaan tim, serta melihat kalender dan struktur pelaporan. Tidak boleh melihat data sensitif di luar izin.
4. **Karyawan** — mengakses profil/payslip milik sendiri dan mengajukan atau menindaklanjuti proses yang tersedia. Tidak boleh melihat data karyawan lain atau mengubah data payroll terproteksi.
5. **Finance / payroll operator** — menyiapkan, memeriksa, memproses, dan mengunci payroll serta expense sesuai pemisahan tugas. Peran dan alur approval final perlu disepakati.
6. **Recruiter** — mengelola vacancy dan kandidat, interview, dan catatan yang dibatasi akses. Retensi dan klasifikasi data kandidat perlu ditentukan.
7. **Organization owner / system operator** — menyiapkan tenant, pengguna, konfigurasi, backup, pemantauan, dan dukungan operasional tanpa mencampur data tenant.

### 2.3 User Stories & Acceptance Criteria

Status baseline di setiap area mengacu ke audit kode per 27 Sep 2026, bukan bukti bahwa semua kriteria target di bawah telah lulus.

#### A. Tenant, akun, role, dan organisasi

**Status baseline:** fondasi organisasi, membership, permission, pemeriksaan server, scope `organization_id`, dan RLS deny akses client langsung tersedia. Login/logout/me/refresh dan pencatatan sesi ada. MFA, SSO, SCIM, rate limiting, serta sejumlah kontrol session enterprise belum lengkap; audit mencatat token pada client memakai localStorage.

**Story A1 —** Sebagai pengguna, saya ingin login dan hanya mengakses organisasi serta tindakan yang menjadi hak saya, agar data HR terlindungi.

**Acceptance criteria**
- Setiap endpoint privat menolak tanpa token valid; token/session kedaluwarsa, revoked, atau user/membership nonaktif tidak dapat dipakai.
- Backend mendapatkan user, organisasi, role, dan permission dari identitas tervalidasi; tidak menerima organization/role dari input klien sebagai sumber otoritatif.
- Seluruh query baca/tulis tenant membatasi organisasi, termasuk relasi, pencarian, export, bulk action, dan error path. ID lintas tenant tidak membocorkan keberadaan atau isi record.
- Permission diperiksa pada setiap endpoint dan aksi sensitif; denial mengembalikan status yang sesuai dan tercatat tanpa menulis perubahan parsial.
- Perubahan role, membership, status akun, dan konfigurasi tenant diaudit dengan aktor, waktu, organisasi, objek, dan hasil; rahasia tidak masuk log.
- RLS dan privilege database tetap deny akses langsung bagi role client; secret service-role hanya berada di server.
- Tambahkan regression test untuk unauthenticated, forged/stale/revoked session, permission deny, IDOR, lintas tenant read/write, ekspor, dan bulk workflow.
- Evaluasi migrasi dari localStorage ke cookie HttpOnly/Secure/SameSite dan mitigasi CSRF/XSS sebelum dinyatakan selesai; target autentikasi enterprise (MFA/SSO/SCIM) **TBD**.

#### B. Employee master, directory, departments, positions, org chart

**Status baseline:** employee/departments/positions API serta positions CRUD ada; pembuatan ID bisnis atomic; employee import CSV/XLSX dengan preview, validasi batch dan batas 1.000 baris tercatat ada. Audit menyebut Directory masih hardcoded dan detail employee masih placeholder; org chart parsial dan belum punya interaksi hierarki penuh. Jangan menganggap halaman employee sudah terhubung penuh hanya karena API tersedia.

**Story B1 —** Sebagai HR, saya ingin mencari dan memelihara profil karyawan serta struktur organisasi dari data tersimpan.

**Acceptance criteria**
- Directory, detail, create/edit, departemen, posisi, manager/reporting line, status kerja, dan data profil menggunakan API yang tenant-scoped; tidak menampilkan fixture sebagai record nyata.
- Field wajib, format, uniqueness dalam organisasi, referential integrity department/position/manager, tanggal efektif, dan perubahan status divalidasi server-side.
- Field sensitif (mis. kompensasi, identitas, rekening, informasi privat) disaring sesuai permission dan kebutuhan; matrix field-level access perlu persetujuan pemilik data.
- Import CSV/XLSX menyediakan template/kolom yang didukung, preview hasil mapping, validasi per baris, ringkasan duplikat/error, konfirmasi sebelum commit, dan hasil batch yang dapat diunduh. Batas 1.000 saat ini adalah batas baseline, bukan target skala; kebutuhan volume dan job async TBD.
- Kegagalan validasi/penyimpanan tidak boleh menghasilkan setengah batch tanpa laporan eksplisit; operasi final bersifat atomic sesuai kontrak import.
- Org chart menampilkan hierarchy dari manager relation, empty/error state, serta zoom/pan/collapse dan batas kedalaman yang ditetapkan melalui usability test; aturan siklus/manager invalid ditolak.
- Perubahan data tercatat audit dan tersaji setelah refresh.

#### C. Attendance dan calendar

**Status baseline:** attendance API dan unique constraint `(employee_id,date)` tersedia. Calendar membaca sebagian data leave/employee/attendance; event types lengkap, query rentang, hari libur/perusahaan, dan export belum tersedia.

**Story C1 —** Sebagai HR/manager, saya ingin memeriksa kehadiran dan kalender kerja sesuai hak akses.

**Acceptance criteria**
- Attendance dapat dicatat/dilihat/diperbaiki sesuai role; duplikat tanggal/karyawan ditolak deterministik, termasuk request bersamaan.
- Kebijakan sumber attendance (manual/import/perangkat), shift, timezone, koreksi, geolocation, dan approval ditetapkan sebelum implementasi fitur terkait; semuanya **TBD**.
- Calendar mengambil event dari sumber persisten dan membatasi rentang tanggal, organisasi, serta visibility per karyawan/team.
- Tipe event, hari libur, cuti, jadwal, hari perusahaan, locale/timezone, dan ekspor hanya ditampilkan setelah kontrak dan sumber data ditetapkan.
- Koreksi dan perubahan status ter-audit; tidak ada nilai acak atau event dummy.

#### D. Leave dan saldo cuti

**Status baseline:** request/approve/reject/cancel dan endpoint pembacaan saldo ada; atomic workflow/RPC tersedia menurut audit. Kebijakan accrual, saldo accounting lengkap, approval delegation/escalation, dan konfigurasi belum lengkap.

**Story D1 —** Sebagai karyawan, saya ingin mengajukan cuti dan mengetahui saldo/status; sebagai approver, saya ingin memutuskan permintaan dengan perhitungan yang konsisten.

**Acceptance criteria**
- Pengajuan memvalidasi pemohon, tanggal, jenis cuti, hari kerja, overlap, saldo sesuai kebijakan aktif, dan lampiran jika diwajibkan.
- Status transisi valid dan idempotent; hanya approver berizin yang dapat memutuskan; permintaan tidak dapat disetujui sendiri bila kebijakan melarang.
- Approval/rejection/cancel dan pembaruan saldo berlangsung atomic; race condition tidak menyebabkan saldo negatif/duplikasi transaksi.
- Saldo memiliki ledger/audit yang dapat direkonsiliasi dengan accrual, carry-over, adjustment, dan pemakaian; aturan tiap kategori, batas, kalender, dan effective date **TBD** dan perlu sign-off HR/legal.
- Karyawan hanya melihat saldo dan permintaannya sendiri; manager melihat cakupan tim yang diizinkan.
- Notifikasi/status aktual tidak diklaim terkirim sampai provider delivery terkonfigurasi dan ada bukti hasil.

#### E. Payroll dan self-service payslip

**Status baseline:** periods, entries, process/lock, self-service scope, dan engine PPh 21/progressive serta BPJS caps dengan golden tests tercatat. Aturan belum versioned; UAT legal, statutory export, THR/adjustment konfigurabel, audit preview, serta PDF payslip binary belum selesai.

**Story E1 —** Sebagai payroll operator, saya ingin memproses periode dengan input dan aturan yang dapat ditinjau sebelum finalisasi.

**Acceptance criteria**
- Payroll period memiliki lifecycle dan transisi eksplisit: draft/preview, review/approval, processed, locked (nama/status final disepakati). Record terkunci tidak dapat dimutasi tanpa prosedur koreksi berizin.
- Hasil tiap karyawan dapat ditelusuri ke input, komponen earnings/deductions, versi aturan, pembulatan, dan kalkulasi; preview tidak mengubah payroll final.
- Proses batch atomic atau dapat dipulihkan dengan status eksplisit; idempotency mencegah double processing/payment/export.
- Engine memiliki golden test untuk kasus batas dan tahun/periode pajak, regression test, rekonsiliasi jumlah; hasil UAT ditandatangani pemilik payroll dan penasihat legal/pajak sebelum produksi.
- Peraturan, tarif, cap, PTKP, BPJS, THR, prorata, koreksi, effective-date, dan versi perhitungan dikonfigurasi/ditinjau sebagai data versioned, bukan klaim angka hardcoded selalu berlaku. Nilai final **TBD**; rujuk peraturan resmi yang berlaku pada tanggal efektif.
- Pemisahan tugas dan approval payroll/lock, akses field kompensasi, proses pembayaran bank, dan format statutory export ditetapkan dengan Finance; pembayaran aktual bukan bagian tersedia sampai integrasi disetujui.
- Karyawan hanya dapat membaca payslip dirinya; PDF/CSV export tidak membocorkan record lain, dan file memiliki kontrol akses/audit.
- Setiap proses, approval, lock, koreksi, dan export tercatat; audit trail tidak menyimpan data rahasia yang tidak diperlukan.

#### F. Expenses / reimbursement

**Status baseline:** expense API dan approve/reject routes, atomic sequence untuk nomor klaim tercatat; cakupan kebijakan dan integrasi payout perlu diverifikasi/ditetapkan.

**Story F1 —** Sebagai karyawan, saya ingin mengajukan klaim dan melihat keputusan; sebagai approver, saya ingin meninjaunya sesuai kebijakan.

**Acceptance criteria**
- Submit memvalidasi kategori, tanggal, jumlah, mata uang, deskripsi, bukti, dan duplikasi sesuai aturan organisasi.
- Status/approval hanya dapat diubah oleh aktor berizin; keputusan, komentar, dan perubahan tercatat; akses bukti dibatasi.
- Kebijakan limit, chain approver, pajak, reimbursement, mata uang, integrasi pembayaran, retention bukti, dan SLA **TBD**.
- Export dan laporan menghormati tenant/permission; payout tidak diklaim otomatis sebelum integrasi tersedia.

#### G. Recruitment

**Status baseline:** vacancy, candidate, interview, notes API dan permission tercatat tersedia; keseluruhan alur/retensi perlu disepakati.

**Story G1 —** Sebagai recruiter, saya ingin mengelola vacancy dan tahapan kandidat tanpa membuka data kandidat ke pihak yang tidak berwenang.

**Acceptance criteria**
- Vacancy/candidate/interview/note tersimpan, tervalidasi, tenant-scoped, dan berubah melalui status transition yang sah.
- Candidate PII dibatasi ke izin recruitment; audit mencatat akses/perubahan yang relevan.
- Pipeline/tahap, sumber kandidat, consent, retention/deletion, portal kandidat, komunikasi, dan integrasi job board **TBD**; jangan menyatakan sistem merekrut/pengiriman email otomatis tanpa implementasi.

#### H. Onboarding, documents, notification dan email

**Status baseline:** onboarding records/tasks dan atomic create/task transitions; checklist template API; document/request/template dasar; notification in-app dan durable delivery queue/provider-neutral worker boundary; bulk email outbox/queue tersedia. Audit menyatakan hubungan checklist dengan employee belum lengkap, storage-backed document versioning belum, dan provider/worker dispatch belum dikonfigurasi; pesan email/SMS masih pending.

**Story H1 —** Sebagai HR, saya ingin membuat onboarding dan meminta dokumen dengan checklist yang terhubung ke karyawan.

**Acceptance criteria**
- Onboarding record terhubung ke employee, memiliki template versi tertentu, task owner/due date/status, dan lifecycle; task completion/overall completion atomic serta idempotent.
- Document request memiliki pemohon, karyawan, jenis dokumen, due date, status, dan audit; status transisi hanya aktor berizin.
- Upload, download, ukuran/tipe file, malware scanning, encryption, retensi, versioning, storage provider, signed URL, dan permission perlu ditentukan sebelum storage production; file sensitif tak boleh disimpan sebagai URL publik.
- Template checklist/dokumen dapat dikelola, diarsipkan, dan dipakai untuk workflow baru tanpa mengubah histori yang telah dibuat.
- Reminder/notifikasi hanya menyatakan queued/sent/delivered sesuai state aktual; retry idempotent, lease/claim mencegah double send, kegagalan dan dead-letter dapat dipantau.
- Integrasi email/SMS/push **TBD**; delivery provider, consent, sender/domain, bounce/complaint handling, retry policy, dan observability disetujui sebelum mengaktifkan worker.

#### I. Offboarding

**Status baseline:** record, clearance tasks, atomic completion RPC, UI operasional, serta settlement estimate tersedia parsial; statutory settlement, PDF report, dan archived history belum lengkap.

**Story I1 —** Sebagai HR, saya ingin mengelola proses keluar karyawan dengan tugas clearance dan rekonsiliasi yang dapat diaudit.

**Acceptance criteria**
- Offboarding terhubung ke employee dan menyimpan alasan/tanggal efektif/owner/status sesuai field access policy.
- Clearance task ditetapkan ke pemilik, memiliki status/bukti/riwayat; penyelesaian keseluruhan atomic dan menolak prasyarat yang belum terpenuhi bila kebijakan mengharuskan.
- Settlement merupakan estimasi sampai seluruh input, aturan versi, approval, dan rekonsiliasi legal/payroll diverifikasi; UI wajib memberi label estimasi.
- Menjaga histori read-only sesuai retention; akses record setelah termination dibatasi sesuai kebijakan, tanpa menghilangkan kewajiban audit.
- PDF/export dan statutory settlement belum dinyatakan tersedia sampai implementasi dan test selesai.

#### J. Reports, dashboard, audit, settings

**Status baseline:** dashboard/report aggregation dan report generation/history/export CSV/JSON/PDF/XLSX tercatat di audit sebagai teruji pada subset smoke; settings persistence dan audit-log scoping tersedia. Audit coverage lengkap lintas route dan permission tetap perlu diuji.

**Story J1 —** Sebagai manager/HR/Finance, saya ingin membuat laporan dari data yang berhak saya lihat dan mengetahui sumber/periodenya.

**Acceptance criteria**
- Laporan menampilkan definisi metrik, periode, timezone, waktu pembuatan, filter, dan sumber data; agregat konsisten dengan data sumber.
- Filter, preview, history, dan setiap format export menerapkan tenant, permission, dan field-level rules yang sama seperti UI/API.
- File export memiliki masa berlaku/akses sesuai kebijakan, tidak dapat diakses publik, dan dicatat; format yang didukung diuji validitas MIME/content, bukan hanya response status.
- Data report sensitif tidak boleh bocor melalui cache, error, nama file, atau share link. Share link tidak aktif kecuali autentikasi/expiry/revocation disepakati.
- Audit log mencatat aksi sensitif dengan filter server-side; hanya viewer berizin dapat mencari. Retensi dan tamper-resistance **TBD**.
- Settings GET/PATCH memvalidasi schema/size, permission, tenant, dan persistence; perubahan setting yang memengaruhi payroll/workflow perlu effective date/version dan audit.

### 2.4 Kebutuhan lintas fitur

- **API contract:** respons validasi konsisten, pagination/filter/sort dibatasi, status code jelas, correlation ID, dan schema diuji. Versioning/backward-compatibility policy **TBD**.
- **Workflow:** setiap mutasi menolak transisi ilegal, mendukung retry aman/idempotency bila sesuai, dan menyimpan aktor/waktu/hasil.
- **Bulk actions:** preview, authorization per record, validasi batas, laporan sukses/gagal, serta batas waktu/ukuran yang terdokumentasi.
- **Accessibility & usability:** keyboard access, label/focus/error semantics, kontras WCAG AA sebagai target verifikasi, serta responsive layout; audit/usability baseline belum ditetapkan.
- **Localization:** Bahasa Indonesia sebagai bahasa dokumen/produk awal yang tampak di UI; dukungan bahasa lain, locale format dan timezone per organisasi **TBD**.
- **Observability:** structured logs, correlation ID, health endpoint dan recovery procedure sudah teridentifikasi; alerting, dashboard SLO, privacy-safe metrics dan incident runbook diperluas sebagai target.

### 2.5 Non-Goals

- Bukan payroll bank/payment processor atau pengganti persetujuan bank, kecuali proyek integrasi terpisah disetujui.
- Tidak memberikan nasihat hukum/pajak dan tidak menjamin kepatuhan hanya karena aplikasi menghitung nilai; validasi aturan oleh pemilik bisnis dan penasihat kompeten wajib.
- Bukan ATS publik/portal kandidat, LMS, performance management, workforce scheduling, biometric attendance, atau ERP lengkap kecuali diprioritaskan sebagai scope baru.
- Tidak mengirim email/SMS/push, mengunggah dokumen ke penyimpanan eksternal, atau mengintegrasikan SSO/SCIM sebelum provider dan kebijakan disetujui.
- Tidak membangun fitur generative AI/automated decisions pada tahap ini.
- Tidak mengasumsikan multi-country, multi-currency, kapasitas tenant, SLA, atau target performa tertentu tanpa keputusan stakeholder.

## 3. AI System Requirements

**Tidak berlaku untuk target produk saat ini.** Repository yang ditinjau tidak menunjukkan fitur AI sebagai kapabilitas produk yang harus digunakan untuk mengelola data HR. Tidak ada model, prompt, tool-use, atau evaluasi model yang menjadi dependensi requirement.

Jika AI diajukan kelak, itu memerlukan PRD/change approval tersendiri, tujuan dan human oversight, dasar pemrosesan data karyawan/kandidat, provider/data residency, opt-out, retention, threat model, evaluasi bias/akurasi, sumber/citation, audit, serta larangan keputusan otomatis berdampak tinggi sebelum legal/HR menyetujuinya.

## 4. Technical Specifications

### 4.1 Arsitektur: kondisi saat ini dan target

**Kondisi kode saat ini (baseline, perlu dijaga tetap akurat):**

- UI dan server API: Next.js 14, React 18, TypeScript, Tailwind CSS; route handlers berada di `frontend/src/app/api/**`.
- Data persistence utama: Supabase Postgres, client `@supabase/supabase-js`; migrasi SQL berada di `supabase/migrations/`.
- API server memvalidasi bearer JWT dengan `jose`, membaca user/membership/permissions, lalu menggunakan Supabase service-role dari server. Akses memakai permission checks dan predicate `organization_id`; RLS defense-in-depth menolak akses langsung client pada tabel tenant.
- Terdapat backend FastAPI/Python legacy, Docker Compose, Redis/Celery, serta deployment manifests Render/Railway di repository. Keberadaan konfigurasi tersebut **bukan** bukti bahwa semua traffic/fitur produksi saat ini menggunakannya. README dan beberapa manifest belum selaras dengan arsitektur Next.js/Supabase aktual; sumber kebenaran runtime/deployment dan rencana konsolidasi **TBD**.
- Vercel config menjalankan build frontend Next.js; CI menjalankan frontend typecheck/lint/build, backend pytest, dan smoke test produksi. Backend FastAPI dirawat/diaktifkan atau dipensiunkan perlu keputusan eksplisit.

**Target arsitektur:**

1. Browser mengirim request ke Next.js API boundary; server memvalidasi identitas/session, status membership, permission, dan organisasi.
2. Service/domain layer memvalidasi input dan business state; operasi kritis memakai constraint/RPC/transaksi database untuk atomicity dan idempotency.
3. Server mengakses Supabase Postgres dengan kredensial server-only dan organisasi wajib sebagai predicate; RLS tetap sebagai pertahanan tambahan, bukan satu-satunya policy jika service role bypass RLS.
4. Integrasi eksternal, bila disetujui, melewati adapter/queue durabel dengan secret management, retry yang aman, observability, serta status delivery nyata. Provider belum diasumsikan.
5. File/dokumen menggunakan object storage private dan URL temporer setelah provider, scanning, retention, encryption dan authorization ditetapkan.
6. Deployment, database migration, secret, backup/restore, dan rollback mengikuti satu jalur yang didukung; pilihan hosting dan ownership operasional **TBD**.

### 4.2 Domain dan data

Migrasi saat ini menunjukkan kelompok entitas inti berikut (daftar bukan skema lengkap):

- Tenant/access: `organizations`, `users`, `organization_memberships`, `roles`, `permissions`, `role_permissions`, `user_sessions`.
- Workforce: `employees`, `departments`, `positions`, `attendance_records`, `leave_requests`, `leave_balances`.
- Lifecycle: `onboarding_records`, `onboarding_tasks`, `checklist_templates`, `offboarding_records`, `offboarding_tasks`, `documents`, `document_requests`.
- Payroll/finance: `payroll_periods`, `payroll_entries`, `expense_claims`, `organization_counters`.
- Recruitment: `recruitment_vacancies`, `recruitment_candidates`.
- Operasional/audit: `notifications`, `notification_deliveries`, `email_outbox`, `audit_logs`, `report_generations`, `organization_settings`.

Target data requirements:
- Setiap data organisasi memiliki hubungan tenant yang enforceable; relasi antar record wajib menolak referensi lintas tenant.
- Gunakan database constraints untuk uniqueness, status, foreign key, dan invariants yang berlaku lintas request; nomor bisnis dihasilkan atomically per organisasi.
- Catat waktu simpan sebagai timestamp konsisten dan tanggal bisnis sesuai timezone/policy yang ditetapkan; perlakuan effective-date perlu eksplisit.
- Definisikan klasifikasi field (PII, payroll, candidate, dokumen), field-level permission, retention/deletion, legal hold, backup, dan akses support sebelum produksi luas.
- Skema migration dapat diulang/ditinjau, punya strategi deploy/backfill/rollback yang diuji; data migration antarsistem sumber **TBD**.

### 4.3 API dan integrasi

API route families terdeteksi di kode meliputi auth, attendance, audit-log, dashboard, departments, checklist, documents/requests/templates, employees/import/bulk-email, expenses, leave/balances, notifications/deliveries, offboarding/settlement, onboarding/tasks, payroll/periods/self-service, positions, recruitment, reports/export/generations, settings, dan health. Daftar route aktual dapat berubah; lihat `frontend/src/app/api/`.

Persyaratan integrasi:
- **Supabase:** koneksi server-only; least privilege, RLS/policies, migrations, backup/PITR sesuai plan dan restore drill; konfigurasi secret melalui environment secret manager.
- **Identity/auth:** skema JWT/session yang dipelihara server, revocation, expiry/rotation, proteksi brute-force/rate limiting, recovery, MFA/SSO/SCIM sebagai keputusan roadmap. Jangan mencatat bearer token atau credential.
- **Notification/email:** provider dan worker belum dianggap aktif. Tentukan provider, consent, template, retry, deduplication, bounce, DLQ, observability, dan status kontrak sebelum enable.
- **Document storage:** belum teridentifikasi sebagai storage production. Pilih provider, enkripsi, upload validation, malware scan, signed access, lifecycle/retention, dan biaya sebelum digunakan.
- **Payroll/bank/tax:** format statutory, bank payout, tax reporting, dan konektor pemerintah belum dianggap ada. Tentukan counterpart, sertifikasi/otorisasi, reconciliation, dan UAT terpisah.
- **Legacy Python stack:** keputusan integrasi atau sunset; hindari dua backend yang memiliki business truth/ownership migrasi tumpang tindih.

### 4.4 Security, Privacy & Compliance

- **Authentication/authorization:** deny-by-default; server-side permission di tiap route dan object-level check. Pastikan session revocation benar-benar enforced untuk semua token, termasuk token lama selama masa migrasi.
- **Tenant isolation:** scoping pada semua operasi dan ekspor, validasi tenant pada relasi, regression tests lintas tenant; RLS deny client access menjadi defense-in-depth. Service-role key tidak pernah tersedia ke browser.
- **Browser/session:** pindahkan token dari localStorage bila memungkinkan ke mekanisme cookie HttpOnly/Secure/SameSite dengan mitigasi CSRF; dokumentasikan threat model, expiry, refresh, logout, XSS controls, rate limit dan account recovery.
- **Sensitive data:** minimisasi data, TLS in transit, encryption at rest sesuai provider, redaksi logs, secrets management, backup/restore access controls, retention/deletion schedule, breach response, dan audit akses. Durasi/standar teknis **TBD**.
- **Auditability:** event log untuk perubahan payroll, izin, employee record sensitif, workflow, export, serta admin actions; tidak merekam password/token/isi dokumen sensitif. Hak baca audit dan retention harus didefinisikan.
- **Compliance:** perlakukan aturan Indonesia (ketenagakerjaan, perpajakan, jaminan sosial, privasi/data pribadi) sebagai requirement yang perlu legal review untuk cakupan bisnis dan effective date. Dokumen ini bukan nasihat hukum dan tidak mengunci angka tarif/ambang. Data residency, DPIA/assessment, dasar pemrosesan, retention dan mekanisme hak subjek data perlu disetujui pihak berwenang.
- **Security verification:** dependency scanning, secret scanning, migration review, authorization/IDOR tests, threat modeling, backup restore drill, incident response exercise, dan penetration test sesuai risk/contract; jadwal/cakupan TBD.

### 4.5 Reliability, performance, accessibility dan test strategy

SLO numerik belum disepakati, maka availability, latency, throughput, batch size selain batas yang sudah ada, RPO/RTO dan recovery window target **TBD**. `docs/RECOVERY.md` memuat prosedur/target operasional saat ini; stakeholder harus menyetujui target sebelum menjadikannya kontrak produk.

Target pengujian sebelum fitur dinyatakan selesai:
- **Unit/domain:** schema validation, permission decisions, state transitions, payroll calculations, date/rounding, atomic sequence, parsers/import mapping.
- **Integration/database:** migrasi bersih dan upgrade, constraints/RPC atomicity, RLS, tenant scoping, rollback/failure/retry.
- **API/security:** unauth/forged/revoked, role & field access, IDOR, cross-tenant reads/writes, pagination/export and bulk operations.
- **E2E:** user journey utama per persona, state loading/error/empty, refresh persistence, unauthorized action, screen reader/keyboard basics.
- **Payroll acceptance:** versioned golden cases dan rekonsiliasi; business/legal sign-off per rule version before use.
- **Operational:** health, logs/correlation, alert delivery, queue stuck/DLQ, backup restore, deployment/migration rollback.
- CI baseline currently includes frontend checks/build, backend pytest, and production smoke. Extend CI to deterministic database-backed integration/E2E without mutating production; clarify ownership and test environment.

### 4.6 Constraints & Open Decisions

| Keputusan | Status |
|---|---|
| KPI target dan baseline bisnis | TBD |
| Target segmen/ukuran organisasi serta tenancy packaging | TBD |
| Jurisdiksi, peraturan yang dicakup, dan legal/payroll sign-off owner | TBD |
| Source of truth deployment (Vercel/Supabase vs legacy Render/Railway/FastAPI) | TBD |
| Pertahankan atau sunset backend Python, Redis/Celery | TBD |
| Penyedia email/SMS, worker, file/object storage, SSO/IdP, bank/payroll connector | TBD |
| MFA, cookie/session design, token migration window | TBD |
| Role matrix final, separation of duties, field-level visibility | TBD |
| Policy leave, attendance, expenses, recruitment retention, onboarding/offboarding | TBD |
| Timezone, locale, currency, calendar, language | TBD |
| SLO availability/latency, load envelope, RPO/RTO | TBD |
| Data retention, privacy notice, deletion/legal hold, residency | TBD |
| Mobile-native app, candidate portal, integrations tambahan | Out of scope sampai diprioritaskan |

## 5. Risks & Roadmap

### 5.1 Risks and mitigations

| Risiko | Dampak | Mitigasi / exit criterion |
|---|---|---|
| Dokumen lama dan manifest mengklaim stack berbeda dari kode aktif | Keputusan teknis/deployment salah | Tetapkan arsitektur runtime owner, perbarui README/deploy pipeline terpisah, uji jalur deploy dan recovery sebelum rollout |
| Service role dapat bypass RLS | Kesalahan satu query dapat melintasi tenant | Default scope helper, repository/service boundary, tenant regression matrix, negative tests untuk tiap route, review ekspor/bulk |
| Token tersimpan di localStorage dan belum semua session legacy revocable | XSS/session persistence dapat membuka data | Threat model, secure cookie migration, revocation/expiry compatibility, rate limit dan tests sebelum production readiness |
| Aturan payroll berubah dan target compliance belum sign-off | Salah bayar, penalti, hilangnya kepercayaan | Rule versioning/effective date, legal/payroll review, golden cases, preview diff, approval dan rekonsiliasi; jangan aktifkan klaim aturan tanpa sign-off |
| Halaman/API tidak setara; dummy/placeholder | Pengguna membuat keputusan dari data salah | Source-of-truth API, acceptance test per route/page, hapus fixtures dan inert controls, smoke/E2E evidence |
| Provider notification/storage belum dipilih | Status palsu atau data sensitif tidak aman | Disable delivery/upload sampai adapter, secret, retry, scanning, privacy dan observability selesai |
| Backend legacy paralel menambah duplikasi | Perbedaan data, deployment dan patch keamanan | Putuskan boundary atau sunset; satu owner untuk schema, migrations, business logic dan release |
| Bulk import/export atau report membebani sistem | Timeout, kebocoran, atau partial writes | Batas tervalidasi, streaming/async bila perlu, atomicity/idempotency, load test dan access checks |
| Migrasi schema/data dan backup tidak teruji | Downtime/data loss | Staging rehearsal, backup/PITR dan restore drill, rollback/forward-fix plan, monitoring pascadeploy |
| Belum ada target SLO dan capacity envelope | Sulit menentukan kesiapan produksi | Baseline telemetry, workload model, tetapkan p95/availability/RPO/RTO dengan owner sebelum scale commitment |

### 5.2 Phased Rollout

Urutan berikut adalah gerbang capability, bukan janji tanggal atau klaim status. Pemilik, estimasi, release date dan nilai target **TBD**. Jangan meluncurkan area payroll/legal atau provider yang belum disetujui.

#### Phase 0 — Stabilkan sumber kebenaran dan keamanan fondasi

- Inventaris deployment/runtime, migrasi, secret, env, service-role usage, dan tanggung jawab backend legacy; pilih arsitektur yang didukung.
- Lengkapi auth/session migration plan, rate limiting, role/permission & field-access matrix; test tenant/IDOR untuk semua route dan export.
- Tetapkan test database/environment, migration/rollback practice, observability/incident owner, backup restore drill dan SLO baseline.
- **Exit gate:** architecture/runtime owner ditetapkan; seluruh endpoint privat masuk permission + tenant matrix; critical cross-tenant regression lulus; no production secret exposure; restore drill tercatat.

#### Phase 1 — Core employee lifecycle operasional

- Hubungkan directory/detail/profile, manager hierarchy, departments/positions ke API persisten; tuntaskan import preview/atomic reporting.
- Tuntaskan leave balance ledger/policy, request/approval, onboarding checklist-to-employee, document request lifecycle, dan offboarding task/history.
- Tuntaskan dashboard/calendar dari data aktual; loading/empty/error/permission states dan accessible flows.
- **Exit gate:** persona E2E berfungsi, data bertahan setelah refresh, authorization regression lulus, tidak ada fixture pada flow operasional yang dirilis.

#### Phase 2 — Payroll dan finance dengan sign-off

- Versioning/effective-date payroll rules, audit preview, maker-checker/approval, correction/lock, payroll reconciliation, payslip file access, dan export sesuai spesifikasi.
- Validasi leave/attendance inputs dan expense policy/alur approval dengan owner HR/Finance.
- Lakukan golden tests, staging payroll comparison, UAT dan legal/tax review; siapkan statutory/bank integration hanya bila disetujui.
- **Exit gate:** payroll owner dan reviewer menyetujui rule version serta hasil rekonsiliasi; pemisahan tugas, audit, rollback/correction dan access checks lulus; integrasi pembayaran tidak tersirat bila belum ada.

#### Phase 3 — Integrasi, kontrol operasional dan scale

- Pilih serta implementasikan email/SMS dan storage melalui provider adapters; aktifkan worker bertahap setelah idempotency, retry/DLQ, consent, scan, access dan observability teruji.
- Lengkapi laporan, export, share policy, recruitment retention, audit retention, queue operations, performance/load dan accessibility review.
- Tetapkan scale envelope, SLO, capacity/cost monitoring, support process, tenant onboarding/offboarding dan incident response.
- **Exit gate:** KPI/SLO memiliki owner dan target disetujui; load/security/recovery test lulus; provider failure/retry diuji; rollout dapat dihentikan/di-rollback dengan aman.

### 5.3 Release governance

Setiap fitur berstatus “done” hanya setelah: acceptance criteria spesifiknya lulus; seluruh data operasional persisten; permission/tenant/field access diuji server-side; loading/empty/error states tersedia; perubahan ter-audit; refresh menunjukkan state konsisten; migrasi teruji; CI dan smoke/E2E terkait lulus; dan tidak ada klaim integrasi/kompliance tanpa bukti. Status implementasi harus diperbarui di `FEATURE_AUDIT.md` atau artefak status yang disepakati.

### 5.4 Rollout, data migration dan operasi

- Deployment bertahap: local/test → staging dengan schema setara → pilot organisasi/data sintetis atau terotorisasi → production rollout bertahap dengan rollback/forward-fix plan. Jadwal dan pilot cohort TBD.
- Sebelum import data nyata: mapping, deduplication, validation, dry run, backup, access restriction, consent/legal basis, reconciliation totals, exception report, sign-off dan rollback plan.
- Migrasi tidak boleh mengasumsikan data backend FastAPI dan Supabase identik. Tentukan source of truth, ownership serta rekonsiliasi sebelum cutover.
- Operasi mencakup health/ready checks, structured logs/correlation, error/queue alerts, access review, backup/PITR, restore drill, incident response, dan audit trail. Jangan log data payroll/PII yang tidak dibutuhkan.

## Appendix A — Glossary & Requirement Conventions

| Istilah | Definisi |
|---|---|
| Tenant / organization | Batas organisasi pelanggan; akses record dibatasi ke `organization_id` yang tervalidasi. |
| RBAC / permission | Hak role untuk tindakan tertentu; role membership harus aktif dan berlaku untuk organisasi terkait. |
| RLS | PostgreSQL Row Level Security; lapisan pertahanan database. Service-role access tetap memerlukan predicate/authorization aplikasi. |
| ESS | Employee self-service; akses mandiri karyawan atas fungsi/data miliknya sesuai kebijakan. |
| Atomic | Satu operasi workflow berhasil seluruhnya atau gagal tanpa state parsial yang tidak terdefinisi. |
| Status tersedia/parsial/target | Label baseline yang dijelaskan di pembuka dokumen; target bukan klaim implementasi. |
| TBD | Keputusan/baseline belum diberikan; tidak boleh diisi dengan asumsi. |

## Appendix B — Baseline repository dan bukti

- API routes: `frontend/src/app/api/**`; halaman UI: `frontend/src/app/(dashboard)/**`.
- Auth, permission, tenant scope: `frontend/src/lib/server/auth.ts` dan `frontend/src/lib/server/authorization.ts`.
- Database changes: `supabase/migrations/`; CI: `.github/workflows/ci.yml`.
- Status modul dan gap serta smoke evidence: `FEATURE_AUDIT.md`.
- Current frontend scripts mencakup typecheck, lint, build, smoke, payroll test, dan authz test; Python backend memiliki pytest config/tests. Lulusnya satu subset test tidak berarti seluruh target PRD sudah dipenuhi.
- Recovery/operational notes: `docs/RECOVERY.md`.


## Appendix C — Implementation Gap Register

Matriks berikut merangkum status yang dilaporkan dalam `FEATURE_AUDIT.md` dan koreksi arsitektur/role/schema dari pemeriksaan repository per 28 Sep 2026. “Tersedia” tidak menghapus kebutuhan acceptance test lintas role/tenant yang disebut pada Bagian 2 dan 4. Status harus diperbarui ketika bukti implementasi berubah.

| Kapabilitas target | Status baseline | Gap / bukti penyelesaian yang masih diperlukan |
|---|---|---|
| Tenant foundation, organization scoping, RLS | Tersedia | Pertahankan pemeriksaan semua route, relasi lintas tenant, bulk/export, dan regression matrix; service-role tetap wajib memakai scope aplikasi. |
| Permission enforcement / role model | Tersedia untuk system role saat ini | Role seed/system: `super_admin`, `hr_director`, `hr_manager`, `hr_officer`, `employee`. `recruiter`, `finance_officer`, `department_manager`, `team_leader` belum seeded; perlakukan sebagai role target, bukan fakta implementasi. Verifikasi field-level dan manager/department row filtering. |
| Login/session | Parsial | Custom JWT `jose`, bcrypt/bcryptjs, localStorage di client, reload user/membership/permissions dan validasi `jti` pada `user_sessions` untuk token yang memilikinya. MFA/SSO/SCIM/rate limiting dan hardening token belum lengkap; kompatibilitas token lama perlu ditinjau. |
| Employee API / create / import | Parsial ke tersedia per endpoint | Import CSV/XLSX dengan preview, validasi server, max 1.000 baris dan rollback failure; background import job belum ada. Pastikan end-to-end/detail dan field access lulus. |
| Employee Directory UI | Parsial | Audit mencatat data roster hardcoded; ganti dengan API/DTO tenant-scoped dan bukti no fixture. |
| Employee detail UI | Parsial | Audit historis menyebut API-backed/detail slices sudah ada, tetapi audit inventory juga menandai detail placeholder/hardcoded; verifikasi file/UI per route sebelum klaim selesai. Profile, docs, payroll, leave, edit, preview/download harus memakai sumber persisten dan akses sesuai role. |
| Departments / positions | Tersedia pada API; UI perlu acceptance coverage | Positions CRUD tenant-scoped dan constraint tercatat; uji relasi employee/manager, permission, refresh, serta failure states. |
| Org chart | Parsial | Team/member API tersedia; hierarchy visualization interaktif (zoom/pan/collapse), validasi siklus dan kedalaman belum lengkap. |
| Attendance | Tersedia fondasi | API dan unique employee/date constraint tersedia. Kebijakan shift/device/geofence, correction/approval dan calendar integration belum dipastikan. |
| Calendar | Parsial | Load data attendance/leave/employee tersedia; event types penuh, range query, holiday/company events dan export belum. |
| Leave requests & balances | Parsial | Read balance serta atomic approval/accounting foundation tersedia; accrual/carry-over/adjustment/ledger policy, effective dating dan legal/HR sign-off belum. |
| Payroll computation | Parsial | Engine `frontend/src/lib/payroll.ts` meliputi PPh 21, BPJS caps/rates, overtime dan THR; golden tests ada. Rule versioning, legal UAT, configurable statutory rules, statutory export dan audit preview belum. Jangan gunakan angka appendix lama sebagai sumber hukum. |
| Payroll UI/detail/self-service | Parsial ke tersedia pada slice | Detail API, period process/lock dan employee-scoped self-service tercatat. PDF binary payroll/payslip belum; CSV availability tidak sama dengan PDF delivery atau pembayaran bank. |
| Expenses | Parsial/terdapat endpoint | API dan approval actions tersedia; verifikasi kebijakan, finance separation-of-duties, attachment security, reconciliation dan payout integration. |
| Recruitment | Parsial | Vacancy/candidate/interview/notes API dan permission tersedia; lifecycle penuh, kandidat-facing portal, email/job-board provider, consent/retention belum. |
| Onboarding/checklists | Parsial | Onboarding/task atomic RPC dan checklist template persistence tersedia; checklist-template association ke employee/lifecycle masih perlu diselesaikan dan diuji. |
| Documents/document requests | Parsial | `documents` menggunakan Supabase Storage bucket yang dibuat migration; request/template dasar dan status transition tersedia. Storage-backed versioning/PDF, upload checklist linkage, delivery notification dan full retention/scanning controls belum. S3 bukan storage terimplementasi saat ini. |
| Notifications / email delivery / bulk email | Parsial | Durable tenant-scoped queue/outbox dan claim/lease boundary tersedia; provider dispatch/worker belum dikonfigurasi. Pending tidak boleh dilaporkan sebagai sent/delivered. AWS SES bukan integrasi saat ini. |
| Offboarding | Parsial | Record, clearance tasks, atomic completion, operational UI, settlement estimate tersedia; statutory settlement, PDF report dan archived history belum. |
| Reports/dashboard/export/history | Sebagian besar tersedia; konfirmasi per kontrak | CSV/JSON/PDF/XLSX, aggregation/trends/preview/history tercatat punya smoke coverage subset. Audit/logging permission, cache isolation, file authorization/expiry dan ketepatan semua format perlu coverage penuh. |
| Organization settings | Tersedia | Persistence ada; validasi, permission, invalid payload dan size validation telah diuji smoke menurut audit. |
| Audit log | Tersedia parsial per cakupan | UI/API scoping dan dynamic data tersedia; route-wide event completeness, field redaction, retention dan tamper-resistance belum terbukti. |
| Data model | Tersedia via migrations | Nama tabel canonical: `organizations`, `users`, `employees`, `departments`, `positions`, `attendance_records`, `leave_requests`, `leave_balances`, `audit_logs`, `payroll_periods`, `payroll_entries`, `expense_claims`, `recruitment_vacancies`, `recruitment_candidates`, `onboarding_records`, `onboarding_tasks`, `checklist_templates`, `documents`, `document_requests`, `offboarding_records`, `offboarding_tasks`, `permissions`, `roles`, `role_permissions`, `organization_memberships`, `user_sessions`, `organization_settings`, `report_generations`, `notifications`, `notification_deliveries`, `email_outbox`, `organization_counters`. |
| API ownership / backend architecture | Current app API: Next.js handlers + Supabase; FastAPI legacy/secondary | FastAPI `backend/app/main.py` saat ini hanya auth + employee routers; bukan API surface utama aplikasi. Tetapkan keputusan maintain/sunset dan pastikan satu source of truth. |
| Deployment / infra integrations | Current evidence: Vercel frontend + Supabase; legacy configs exist | Railway/Render/Docker Compose mengonfigurasi backend legacy. AWS ECS/RDS/S3/CloudFront/Celery, Google SSO, fingerprint devices, bank transfer dan CloudWatch/Sentry/PagerDuty/UptimeRobot tidak boleh ditulis sebagai sudah terintegrasi; semuanya target/aspirasi sampai ada bukti runtime dan acceptance. Supabase Storage bucket `documents` adalah storage yang terdeteksi. |
| Testing / CI | Tersedia dengan cakupan tertentu | `backend` pytest mencakup health dan notification queue/provider; frontend `test:smoke` 17 assertions production-backed, `test:authz`, payroll tests dan query tests tersedia. CI menjalankan frontend typecheck/lint/build, backend pytest dan production smoke. Perlu ekspansi integration/E2E/database/security/load coverage sesuai Bagian 4.5. |
| Operations / recovery | Fondasi tersedia | JSON structured logs, correlation IDs, `/api/health`, CI dan `docs/RECOVERY.md` tersedia. PITR drill dan bucket versioning tercatat masih pending; jangan klaim backup/restore telah diverifikasi sampai drill evidence ada. |
| AI features | Tidak berlaku / tidak ada saat ini | Tidak ada target AI dalam scope baseline. Proposal AI memerlukan review privacy, bias, human oversight, dan PRD terpisah. |

**Catatan nama skema:** nama dari dokumen PRD lama seperti `job_postings`, `applicants`, `payroll_runs`, dan `payroll_items` sudah usang dan bukan nama tabel canonical pada migrations saat ini. Gunakan `recruitment_vacancies`, `recruitment_candidates`, `payroll_periods`, dan `payroll_entries`.
