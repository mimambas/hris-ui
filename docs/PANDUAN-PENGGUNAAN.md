# Panduan Penggunaan HRIS

Panduan ini menjelaskan cara menggunakan demo HRIS di production, hak akses tiap role, alur kerja utama, dan batasan yang masih berlaku.

## 1. Akses aplikasi

URL production:

```text
https://hrisui.vercel.app
```

Halaman login menyediakan tombol **Login** untuk setiap akun demo. Kamu juga dapat mengisi email dan password secara manual.

### Akun demo

| Role | Email | Password | Employee demo |
|---|---|---|---|
| Super Admin | `admin@hris.local` | `Admin123!` | EMP-DEMO-001 |
| HR Director | `director.demo@hris.local` | `HRDirector123!` | EMP-DEMO-001 |
| HR Manager | `manager.demo@hris.local` | `HRManager123!` | EMP-DEMO-002 |
| HR Officer | `officer.demo@hris.local` | `HROfficer123!` | EMP-DEMO-005 |
| Employee | `employee.demo@hris.local` | `Employee123!` | EMP-DEMO-003 |

Akun tersebut hanya untuk demonstrasi. Jangan gunakan password demo untuk perusahaan nyata.

## 2. Perbedaan hak akses

### Super Admin

- Mengakses seluruh modul administrasi demo.
- Mengelola employee, department, attendance manual, leave approval, payroll, expenses, documents, onboarding, recruitment, dan audit log.
- Memiliki akses lintas employee dalam organisasi demo.

### HR Director

- Mengelola workflow HR dan data organisasi demo.
- Mengakses fungsi HR yang membutuhkan role elevated.
- Dapat melihat dan meninjau data lintas employee sesuai permission demo.

### HR Manager

- Mengelola data HR, attendance, leave, documents, onboarding, recruitment, dan proses terkait sesuai permission demo.
- Digunakan untuk menguji alur manager dan approval.

### HR Officer

- Mengelola operasi HR harian dan membaca data yang diberikan permission demo.
- Digunakan untuk menguji alur HR officer.

### Employee

- Melihat data yang terkait employee login.
- Menggunakan self-service: profile, attendance, leave, dan dokumen pribadi.
- Tidak boleh mengakses payroll administration, audit log, atau data employee lain.

> Permission dan filtering sedang diperluas bertahap. Untuk production perusahaan nyata, seluruh endpoint harus melewati authorization regression test sebelum rollout.

## 3. Alur login

1. Buka `https://hrisui.vercel.app`.
2. Pilih akun demo pada panel **Demo accounts**, atau masukkan kredensial manual.
3. Klik **Login**.
4. Setelah berhasil, aplikasi mengarahkan ke dashboard.
5. Gunakan menu profil/logout untuk mengakhiri sesi.

Jika login gagal:

- Pastikan email dan password sama persis.
- Hapus token lama dari browser dengan logout lalu login kembali.
- Pastikan production dapat diakses.
- Jika semua akun gagal, periksa status deployment dan environment variables Vercel.

## 4. Alur kerja modul utama

### Dashboard

Dashboard menampilkan ringkasan employee dan metrik organisasi yang tersedia. Gunakan dashboard untuk masuk cepat ke modul terkait.

### Employees

1. Buka **Employees**.
2. Gunakan search, filter status, department, dan pagination.
3. Klik **Add employee** untuk membuat employee baru.
4. Isi minimal nama dan tanggal bergabung.
5. Simpan dan refresh halaman untuk memastikan data tetap tersimpan.
6. Buka detail employee untuk melihat informasi lebih lengkap.

Data sensitif seperti gaji, rekening, NIK, dan NPWP harus dibatasi untuk role yang berwenang.

### Departments

1. Buka **Departments**.
2. Klik **Add department**.
3. Isi nama, kode, cost center, dan informasi terkait.
4. Simpan.
5. Gunakan menu edit/delete sesuai role.

### Attendance

Untuk employee:

1. Buka **Attendance** atau **Self-service**.
2. Klik **Clock in** saat mulai bekerja.
3. Klik **Clock out** saat selesai bekerja.
4. Record attendance terkait employee login dan tersimpan di server.

Untuk HR:

1. Pilih tanggal dan employee.
2. Gunakan **Manual entry** jika perlu memperbaiki atau memasukkan record.
3. Isi check-in, check-out, status, dan alasan.
4. Simpan lalu refresh untuk memverifikasi persistence.

### Leave

Untuk employee:

1. Buka **Leave** atau **Self-service**.
2. Klik **Request leave**.
3. Pilih tipe cuti, tanggal mulai, tanggal selesai, dan alasan.
4. Kirim request.
5. Pantau status `pending`, `approved`, atau `rejected`.

Untuk HR:

1. Filter request berdasarkan status.
2. Buka request yang masih pending.
3. Approve atau reject.
4. Saat reject, isi alasan penolakan.

### Payroll

Untuk HR/admin:

1. Buka **Payroll**.
2. Pilih atau buat payroll period.
3. Jalankan proses payroll.
4. Review entry dan hasil per employee.
5. Lock period setelah review selesai.

> Payroll saat ini adalah workflow demo. Formula statutory Indonesia seperti PPh 21 TER, PTKP, BPJS cap, THR, overtime, prorata, dan rekonsiliasi belum lengkap untuk penggunaan legal production.

### Expenses

1. Buka **Expenses**.
2. Klik **New claim**.
3. Isi category, amount, date, description, dan receipt jika tersedia.
4. Simpan.
5. Employee hanya dapat mengelola claim miliknya.
6. HR/admin dapat approve atau reject claim.
7. Reject wajib menyertakan alasan.

### Documents

Untuk HR/admin:

1. Buka **Documents**.
2. Klik **Upload Document**.
3. Pilih employee, tipe dokumen, dan file.
4. Format yang didukung: PDF, PNG, JPG, WebP.
5. Ukuran maksimum: 10 MB.
6. Gunakan preview/download/delete sesuai permission.
7. Gunakan expiry alert untuk reminder dan renewal request.

Untuk employee, daftar dokumen dibatasi ke dokumen milik sendiri.

### Onboarding

1. Buka **Onboarding**.
2. Klik **Start Onboarding**.
3. Isi nama, role, department, dan start date.
4. Buka checklist employee.
5. Toggle task setelah pekerjaan selesai.
6. Status hanya dapat menjadi `Completed` setelah seluruh task selesai.

### Notifications

1. Buka **Notifications**.
2. Klik item untuk menandai read.
3. Gunakan **Mark all as read** untuk semua notifikasi.
4. Gunakan category filter dan search.
5. Hapus satu notifikasi atau gunakan **Clear all**.

Notifikasi saat ini persisten di database, tetapi belum terhubung ke delivery email, SMS, push notification, retry queue, atau dead-letter queue.

### Recruitment

1. Buka **Recruitment**.
2. Gunakan view **Hiring pipeline** atau **All candidates**.
3. Drag candidate ke stage yang sesuai.
4. Buka candidate untuk menambahkan note.
5. Jadwalkan atau reschedule interview.
6. Buat vacancy melalui **Add Vacancy**.
7. Reject candidate melalui confirmation dialog.

### Audit Log

1. Buka **Audit Log** sebagai HR/admin.
2. Gunakan search, category, actor, action, dan date filter.
3. Klik event untuk melihat detail.
4. Gunakan **Export log** untuk CSV/JSON.

Audit log membaca event yang sudah dicatat oleh API. Cakupan audit belum lengkap untuk seluruh mutation dan belum menggunakan immutable hash-chain/WORM storage.

### Self-service

1. Buka **Self-service** sebagai employee.
2. Tab **Profile** menampilkan profile employee login.
3. Edit phone, address, dan emergency contact.
4. Tab **Leave** menampilkan request milik sendiri dan menyediakan form request.
5. Tab **Attendance** menampilkan record milik sendiri dan status clock-in/out.
6. Tab **Payslips** akan menampilkan payslip jika employee-scoped payroll endpoint sudah tersedia.

## 5. Konfirmasi persistence

Setelah mutation apa pun:

1. Tunggu toast sukses.
2. Refresh browser.
3. Buka kembali modul.
4. Pastikan record atau status tetap berubah.

Jika perubahan hilang setelah refresh, jangan menganggap mutation berhasil. Catat endpoint, role, timestamp, dan pesan error untuk debugging.

## 6. Troubleshooting umum

### `401 Not authenticated`

- Sesi token sudah expired.
- Login ulang.
- Pastikan browser tidak memblokir local storage.

### `403 Insufficient permissions`

- Role demo tidak memiliki permission untuk aksi tersebut.
- Gunakan akun HR/admin untuk workflow administrasi.
- Jangan mengatasi error dengan memakai service-role key di browser.

### `404` atau data kosong

- Record memang belum ada di organization demo.
- Filter employee/status/date terlalu sempit.
- Migration atau seed belum diterapkan.

### Build berhasil tetapi deployment bermasalah

Periksa:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET_KEY`
- Vercel deployment status
- Supabase migration status

Service-role key hanya boleh berada di environment server.

## 7. Arsitektur singkat

```text
Browser
  → Next.js frontend di Vercel
  → Next.js API routes
  → Supabase PostgreSQL dan Supabase Storage
```

Untuk deployment production saat ini, Next.js API routes adalah boundary utama. Backend FastAPI legacy tidak menjadi boundary utama workflow HRIS production.

## 8. Batasan sebelum enterprise rollout

Aplikasi belum boleh dianggap siap untuk perusahaan besar sebelum tersedia dan diuji:

- Tenant isolation pada seluruh endpoint.
- RBAC/ABAC dan field-level security yang konsisten.
- MFA, SSO, SCIM, session revocation, dan rate limiting.
- Payroll Indonesia production-grade.
- Leave accrual dan attendance policy engine.
- Transaction, idempotency, queue, retry, dan reconciliation.
- Backup, restore drill, RPO/RTO, monitoring, dan incident runbook.
- Automated authorization, integration, E2E, payroll golden-case, load, dan security tests.
- Privacy, retention, DSAR, encryption, dan immutable audit.

Dokumentasi ini berlaku untuk demo environment dan harus diperbarui setiap kali kontrak API, role, migration, atau workflow berubah.
