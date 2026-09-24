'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen, CheckCircle2, Shield, Users, Workflow, AlertTriangle } from 'lucide-react';
import ModuleHeader from '@/components/ui/ModuleHeader';

const roles = [
  { name: 'Super Admin', account: 'admin@hris.local', access: 'Akses administrasi organisasi demo dan seluruh workflow HR.', limits: 'Tidak mewakili separation of duties enterprise; akun demo memiliki akses sangat luas.' },
  { name: 'HR Director', account: 'director.demo@hris.local', access: 'Melihat dan mengelola workflow HR, approval, employee, payroll, recruitment, dan audit.', limits: 'Belum memiliki delegation matrix, maker-checker payroll, atau scope legal entity yang lengkap.' },
  { name: 'HR Manager', account: 'manager.demo@hris.local', access: 'Operasional HR harian, employee, attendance, leave, documents, onboarding, dan recruitment sesuai grants demo.', limits: 'Akses masih mengikuti permission demo; policy manager per department belum lengkap.' },
  { name: 'HR Officer', account: 'officer.demo@hris.local', access: 'Mendukung administrasi employee, attendance, leave, documents, onboarding, dan notifikasi.', limits: 'Tidak dimaksudkan untuk akses payroll/statutory penuh atau konfigurasi organisasi.' },
  { name: 'Employee', account: 'employee.demo@hris.local', access: 'Self-service: profile, attendance, leave, dan dokumen milik sendiri.', limits: 'Tidak dapat melihat employee lain, payroll administration, approval HR, recruitment, atau audit log.' },
];

const modules = [
  ['Dashboard', 'Ringkasan jumlah employee, employee aktif, pending leave, department headcount, tren workforce, dan quick actions.'],
  ['Self Service', 'Workspace employee untuk melihat profile, mengubah contact fields, mengajukan leave, melihat attendance sendiri, dan mengelola workflow pribadi.'],
  ['Employees', 'Daftar, search, filter, tambah, lihat detail, edit, dan menonaktifkan employee. Data identity dan compensation harus dibatasi sesuai role.'],
  ['Directory', 'Directory employee untuk pencarian dan navigasi organisasi. Pada demo, sebagian tampilan masih memerlukan backend directory penuh.'],
  ['Departments', 'Mengelola department, code, cost center, dan relasi organisasi.'],
  ['Org Chart', 'Tampilan struktur manager dan department. Persistence reporting hierarchy enterprise masih perlu disempurnakan.'],
  ['Attendance', 'Clock-in/out employee, manual entry HR, filter tanggal, status, search, dan perhitungan jam kerja dasar.'],
  ['Calendar', 'Rencana agregasi leave, attendance, interview, onboarding, dan event perusahaan. Sebagian tampilan masih demo.'],
  ['Leave', 'Employee mengajukan cuti; HR melihat, approve, reject, cancel, dan menghapus request rejected. Leave balance/policy engine belum lengkap.'],
  ['Payroll', 'HR membuat period, process, review entry, dan lock period. Formula saat ini belum memenuhi payroll statutory Indonesia enterprise.'],
  ['Expenses', 'Employee membuat claim; HR/admin melihat, mengedit pending, approve, reject dengan alasan, dan menghapus claim milik sendiri yang pending.'],
  ['Recruitment', 'Candidate pipeline, stage, notes, interview scheduling, reject, dan vacancy. Integrasi ATS, email, e-sign, dan conversion ke employee belum lengkap.'],
  ['Onboarding', 'Membuat onboarding record, checklist task, toggle task, dan complete setelah semua task selesai.'],
  ['Documents', 'Upload file PDF/PNG/JPG/WebP sampai 10 MB, preview, download signed URL, delete, expiry reminder, dan renewal request.'],
  ['Notifications', 'Daftar notification per user, search/filter, mark read, mark all read, delete, dan clear all. Delivery email/SMS/push belum tersedia.'],
  ['Reports', 'Area insight dan export. Sebagian report masih berupa demo/mock dan perlu query backend nyata.'],
  ['Audit Log', 'HR/admin melihat aktivitas tercatat, filter, detail, dan export. Cakupan audit immutable enterprise belum lengkap.'],
  ['Settings', 'Area konfigurasi organisasi. Persistence settings enterprise masih perlu dilengkapi.'],
];

export default function GuidePage() {
  return <div className="min-h-screen bg-surface-soft">
    <header className="sticky top-0 z-30 border-b border-hairline bg-canvas/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4 lg:px-8">
        <Link href="/login" className="flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary"><ArrowLeft size={16} /> Kembali ke login</Link>
        <div className="flex items-center gap-2 text-sm font-bold text-ink"><BookOpen size={18} className="text-primary" /> HRIS Demo Guide</div>
        <Link href="/" className="btn-primary min-h-10 px-4 text-xs">Buka aplikasi</Link>
      </div>
    </header>
    <main className="mx-auto max-w-6xl space-y-8 px-5 py-8 lg:px-8 lg:py-12">
      <section className="card border-primary/20 bg-primary-surface/50">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Demo documentation</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Panduan lengkap penggunaan HRIS</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-body">Gunakan halaman ini untuk memahami role, batasan akses, workflow tiap modul, dan perbedaan antara fitur yang sudah persisten dengan fitur demo yang masih dalam pengembangan.</p>
        <div className="mt-5 flex flex-wrap gap-3 text-xs text-muted"><span className="badge bg-canvas text-body">Production demo</span><span className="badge bg-canvas text-body">Next.js + Supabase</span><span className="badge bg-canvas text-body">Updated 24 Sep 2026</span></div>
      </section>

      <section id="quick-start" className="grid gap-5 lg:grid-cols-3">
        <div className="card lg:col-span-2"><div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-surface"><Workflow size={18} className="text-primary" /></div><div><h2 className="text-base font-bold text-ink">Quick start</h2><p className="text-xs text-muted">Cara mencoba demo dalam beberapa langkah.</p></div></div><ol className="space-y-3 text-sm text-body"><li><b className="text-ink">1.</b> Pilih salah satu akun demo di halaman login.</li><li><b className="text-ink">2.</b> Gunakan tombol Login sesuai role yang ingin diuji.</li><li><b className="text-ink">3.</b> Buka menu di sidebar dan coba workflow sesuai role.</li><li><b className="text-ink">4.</b> Setelah mutation, refresh halaman untuk memastikan data tersimpan.</li></ol></div>
        <div className="card"><div className="mb-4 flex items-center gap-3"><Shield size={18} className="text-primary" /><h2 className="text-base font-bold text-ink">Keamanan demo</h2></div><p className="text-sm leading-6 text-body">Password di halaman login hanya untuk lingkungan demo publik. Jangan memasukkan data employee nyata, rekening, NIK, NPWP, atau dokumen pribadi.</p></div>
      </section>

      <section id="roles" className="card"><div className="mb-5 flex items-center gap-3"><Users size={18} className="text-primary" /><div><h2 className="text-base font-bold text-ink">Role dan batasan akses</h2><p className="text-xs text-muted">Apa yang dapat diuji oleh setiap akun.</p></div></div><div className="grid gap-3 lg:grid-cols-2">{roles.map((role) => <article key={role.name} className="rounded-xl border border-hairline-soft bg-surface-soft p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold text-ink">{role.name}</h3><code className="text-[11px] text-muted">{role.account}</code></div><p className="mt-2 text-xs leading-5 text-body"><b className="text-ink">Akses:</b> {role.access}</p><p className="mt-2 text-xs leading-5 text-muted"><b className="text-ink">Batasan:</b> {role.limits}</p></article>)}</div></section>

      <section id="modules" className="card"><div className="mb-5"><h2 className="text-base font-bold text-ink">Penjelasan seluruh fitur</h2><p className="mt-1 text-xs text-muted">Gunakan daftar ini sebagai indeks penggunaan sidebar.</p></div><div className="grid gap-3 md:grid-cols-2">{modules.map(([name, description], index) => <article key={name} className="rounded-xl border border-hairline-soft p-4"><div className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-surface text-xs font-bold text-primary">{index + 1}</span><div><h3 className="text-sm font-bold text-ink">{name}</h3><p className="mt-1 text-xs leading-5 text-body">{description}</p></div></div></article>)}</div></section>

      <section id="workflows" className="grid gap-5 lg:grid-cols-2"><div className="card"><h2 className="text-base font-bold text-ink">Workflow approval</h2><div className="mt-4 space-y-3 text-xs leading-5 text-body"><p><CheckCircle2 size={14} className="mr-2 inline text-cta" /><b className="text-ink">Leave:</b> employee submit → HR review → approve/reject → status tersimpan.</p><p><CheckCircle2 size={14} className="mr-2 inline text-cta" /><b className="text-ink">Expenses:</b> employee submit → HR approve/reject → claim tidak dapat diubah setelah final.</p><p><CheckCircle2 size={14} className="mr-2 inline text-cta" /><b className="text-ink">Onboarding:</b> buat record → checklist task → semua task selesai → complete.</p><p><CheckCircle2 size={14} className="mr-2 inline text-cta" /><b className="text-ink">Payroll:</b> buat period → process → review → lock.</p></div></div><div className="card"><h2 className="text-base font-bold text-ink">Status persistence</h2><p className="mt-3 text-sm leading-6 text-body">Data pada Employees, Departments, Attendance, Leave, Expenses, Documents, Notifications, Onboarding, Recruitment, Audit Log, dan sebagian Payroll disimpan melalui API Supabase. Jika data hilang setelah refresh, cek role, filter, dan migration database.</p></div></section>

      <section id="limitations" className="card border-amber-200 bg-amber-50/50"><div className="flex items-start gap-3"><AlertTriangle size={19} className="mt-0.5 shrink-0 text-accent-yellow" /><div><h2 className="text-base font-bold text-ink">Limitasi demo dan enterprise</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-xs leading-5 text-body"><li>Payroll belum dapat dianggap payroll statutory Indonesia: PPh 21 TER, PTKP, BPJS cap, THR, overtime, prorata, dan statutory export belum lengkap.</li><li>SSO, MFA, SCIM, session governance, rate limiting, dan integrasi bank/BPJS/pajak belum tersedia penuh.</li><li>Calendar, Directory, Org Chart, Reports, Settings, dan beberapa detail page masih memerlukan backend-driven implementation lebih lanjut.</li><li>RBAC dan tenant isolation sudah memiliki fondasi, tetapi seluruh endpoint masih perlu regression test lintas tenant dan permission.</li><li>Gunakan data sintetis saja. Demo credentials harus dihapus atau dirotasi sebelum production perusahaan nyata.</li></ul></div></div></section>
    </main>
  </div>;
}
