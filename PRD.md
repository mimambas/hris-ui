# Product Requirements Document (PRD)
## HRIS — Human Resource Information System

**Version:** 1.0.0  
**Date:** 2026-09-21  
**Status:** Final Draft  

---

## 1. Executive Summary

### Problem Statement

Perusahaan dengan 100–2000+ karyawan masih mengandalkan spreadsheet, WhatsApp, dan proses manual untuk mengelola data karyawan, absensi, cuti, penggajian, serta rekrutmen — yang menyebabkan error data, waktu payroll 3–5 hari kerja, ketidakpatuhan terhadap regulasi Ketenagakerjaan RI, dan beban administrasi HR yang berlebihan.

### Proposed Solution

HRIS adalah platform web terpadu yang mengotomasi siklus hidup karyawan — dari rekrutmen, onboarding, manajemen data, absensi, penggajian (termasuk PPh 21 & BPJS), hingga offboarding — dengan self-service portal untuk karyawan dan approval workflow untuk manager.

### Success Criteria

| # | KPI | Target | Measurement |
|---|-----|--------|-------------|
| 1 | Payroll processing time | ≤ 1 hari kerja (dari 3–5 hari) | Waktu dari input absensi hingga slip gaji final tersedia |
| 2 | Employee self-service adoption | ≥ 80% dalam 3 bulan setelah launch | % karyawan aktif使用 portal ESS per bulan |
| 3 | Data accuracy rate | ≥ 99.5% | Error rate dalam data master karyawan (audit quarterly) |
| 4 | System uptime | ≥ 99.5% | Monthly availability monitoring (Sentry + CloudWatch) |
| 5 | HR admin time reduction | ≥ 60% | Jam kerja HR per minggu sebelum vs setelah implementasi |

---

## 2. User Experience & Functionality

### 2.1 User Personas

#### Persona 1: HR Manager — "Rina"

- **Role:** HR Manager di perusahaan manufaktur 500 karyawan
- **Pain Points:** 
  - Butuh 5 hari untuk proses payroll setiap bulan
  - Data karyawan tercecer di 5 spreadsheet berbeda
  - Sulit tracking siapa yang sudah upload dokumen kontrak
- **Goals:** Satu sumber data karyawan, payroll cepat, laporan real-time
- **Tech Savvy:** Medium — pakai laptop Windows, browser Chrome

#### Persona 2: Department Manager — "Budi"

- **Role:** Manager departemen Teknik, 30 orang di bawahnya
- **Pain Points:**
  - Harus cek WhatsApp untuk approve cuti
  - Tidak tahu sisa cuti team tanpa tanya HR
  - Lembur team tidak tercatat dengan baik
- **Goals:** Approve cuti/lembur dari satu tempat, lihat attendance team
- **Tech Savvy:** Medium-High — aktif pakai laptop & handphone

#### Persona 3: Karyawan — "Sari"

- **Role:** Staff Marketing, baru masuk 6 bulan
- **Pain Points:**
  - Tidak tahu sisa cuti
  - Slip gaji dikirim via email tanpa penjelasan potongan
  - Harus chat HR untuk update rekening bank
- **Goals:** Lihat payslip jelas, apply cuti mudah, update profil sendiri
- **Tech Savvy:** High — mobile-first, aktif pakai handphone

#### Persona 4: Finance Officer — "Andi"

- **Role:** Staff Finance yang handle pembayaran gaji
- **Pain Points:**
  - Rekap reimbursement manual dari 20+ email
  - File bank transfer harus buat manual dari Excel
  - PPh 21 dihitung manual pakai rumus Excel
- **Goals:** Export file bank transfer siap pakai, laporan pajak otomatis
- **Tech Savvy:** High — Excel power user, paham sistem

#### Persona 5: Recruiter — "Dewi"

- **Role:** HR Staff yang handle rekrutmen
- **Pain Points:**
  - Lamaran masuk dari berbagai platform (email, LinkedIn, website)
  - Sulit tracking status kandidat per tahap
  - Jadwal interview sering bentrok
- **Goals:** Satu tempat manage semua kandidat, pipeline visual
- **Tech Savvy:** High — multi-platform user

---

### 2.2 User Stories & Acceptance Criteria

#### Module 1: Employee Master Data

**Story 1.1**  
As an **HR Officer**, I want to **create a new employee profile** so that **all employee data is stored in one centralized system**.  
**Acceptance Criteria:**
- Form fields: nama lengkap, NIK, NPWP, tempat/tanggal lahir, jenis kelamin, alamat, kontak darurat, pendidikan, riwayat pekerjaan, rekening bank
- Employee ID auto-generated (format: `EMP-YYYYMMDD-XXX`)
- NIK validated as unique (16 digit, numeric)
- NPWP validated as unique (15 digit format `XX.XXX.XXX.X-XXX.XXX`)
- Duplication check on NIK and NPWP — reject if duplicate
- All create actions logged in audit trail (user, timestamp, field changes)
- Redirect to profile detail page after successful creation

**Story 1.2**  
As an **HR Manager**, I want to **bulk import employees via CSV/Excel** so that **I don't have to manually input 100+ employees during initial setup**.  
**Acceptance Criteria:**
- Upload accepts `.csv`, `.xlsx` (max 5MB, max 1000 rows)
- System validates each row: required fields, data format, uniqueness
- Returns validation report: rows OK, rows with errors (with line number & reason)
- On success, all valid rows imported; error rows shown for correction
- Preview mode: show first 10 rows before final import

**Story 1.3**  
As an **Employee (ESS)**, I want to **view and update my own profile** so that **my personal information stays current without bothering HR**.  
**Acceptance Criteria:**
- Self-edit allowed fields: alamat, kontak darurat, rekening bank, nomor handphone
- Changes to sensitive fields (NIK, NPWP, nama) require HR approval
- Profile shows employment history timeline
- All documents uploaded by employee visible in profile

**Story 1.4**  
As an **HR Manager**, I want to **view an employee's complete history** (position changes, salary changes, leave history) so that **I have full context for decisions**.  
**Acceptance Criteria:**
- Tabbed view: Profile, Employment, Documents, Attendance History, Leave History, Payroll History
- Each tab shows chronological data
- Data changes tracked with before/after values
- Export individual employee report (PDF)

---

#### Module 2: Organizational Structure

**Story 2.1**  
As an **HR Director**, I want to **visualize the company org chart** so that **I can understand and manage the hierarchy**.  
**Acceptance Criteria:**
- Interactive tree visualization (zoom, pan, collapse/expand)
- Nodes show: photo, name, position, department
- Click node → navigate to employee profile
- Support up to 8 hierarchy levels
- Org chart updates automatically when hierarchy changes

**Story 2.2**  
As an **HR Manager**, I want to **create and manage departments and positions** so that **the organizational structure reflects reality**.  
**Acceptance Criteria:**
- CRUD operations for departments (name, code, parent, head, cost center)
- CRUD operations for positions (title, level, grade, department, salary range)
- Validation: department cannot be deleted if has active employees
- Position deletion blocked if occupied by active employee
- Hierarchical department tree with parent-child relationships

---

#### Module 3: Attendance Management

**Story 3.1**  
As an **Employee**, I want to **check in and check out via web** so that **my attendance is recorded without a physical device**.  
**Acceptance Criteria:**
- Check-in button records timestamp + optional GPS coordinates
- Check-out button records timestamp
- Late detection: flag if check-in > configured grace period (default: 10 min)
- Early leave detection: flag if check-out < configured time
- Cannot check in twice per day; cannot check out before check-in
- Dashboard shows today's attendance status in real-time

**Story 3.2**  
As an **HR Officer**, I want to **input attendance manually** for cases where system check-in fails (power outage, device error).  
**Acceptance Criteria:**
- Manual input form: employee, date, check-in, check-out, reason
- Requires HR Officer+ role
- Manual entries flagged as "Manual" in attendance log
- Approval required from HR Manager for manual entries
- Audit trail: who entered, when, what was entered

**Story 3.3**  
As a **Department Manager**, I want to **see my team's daily attendance summary** so that **I know who's present, late, or absent**.  
**Acceptance Criteria:**
- Team attendance dashboard: grid view (employee × date)
- Color-coded: green=present, yellow=late, red=absent, blue=WFH, gray=leave
- Filter by: date range, status
- Export to Excel
- Real-time updates (auto-refresh every 30 seconds)

**Story 3.4**  
As an **HR Manager**, I want to **configure attendance rules** (grace period, overtime thresholds, work schedules) so that **the system matches company policy**.  
**Acceptance Criteria:**
- Configurable: grace period (minutes), overtime min duration, max overtime per day
- Work schedule types: Regular (Mon-Fri), Flexible (window check-in), Shift-based
- Shift scheduling: create weekly/monthly shifts per employee/team
- Configuration changes logged in audit trail
- Changes take effect from configured effective date (not retroactive)

---

#### Module 4: Leave Management

**Story 4.1**  
As an **Employee**, I want to **submit a leave request** with type, dates, and reason so that **I can get approval without email/WhatsApp**.  
**Acceptance Criteria:**
- Leave types: Annual (AL), Sick (SL), Personal (PL), Maternity (ML), Paternity (PT), Bereavement (BL), Marriage (MR), Hajj (HJ), Unpaid (UL), Company Leave (CB)
- Form validates: dates within range, no overlap with existing approved leave
- System shows remaining balance for selected leave type before submission
- Sick leave > 2 days requires document upload
- Submit triggers notification to direct manager

**Story 4.2**  
As a **Department Manager**, I want to **approve or reject leave requests** from my team with a reason so that **I maintain workforce coverage**.  
**Acceptance Criteria:**
- Pending requests appear in approval queue (sorted by urgency)
- Approve: auto-update leave balance, update attendance calendar, notify employee
- Reject: mandatory reason field, notify employee
- Leave > 3 consecutive working days requires additional HR Director approval
- Delegation: manager can delegate approval to another person during absence

**Story 4.3**  
As an **Employee**, I want to **see my leave balance and history** so that **I know how many days I have left**.  
**Acceptance Criteria:**
- Dashboard widget: remaining days per leave type (current year)
- Leave history: list of all requests with status (pending/approved/rejected)
- Leave calendar view: shows approved leaves for team (anonymized for other teams)
- Annual leave resets on January 1 each year
- New employees: pro-rated balance based on join date

---

#### Module 5: Payroll

**Story 5.1**  
As an **HR Officer**, I want to **run monthly payroll** with auto-calculation of salary, deductions, and tax so that **processing time drops from 5 days to 1 day**.  
**Acceptance Criteria:**
- Payroll period selection: month/year
- Auto-sync attendance data: work days, late, absence, overtime
- Auto-calculate components:
  - Earnings: basic salary, fixed allowances, overtime (1.5x/2x/3x based on rules)
  - Deductions: BPJS Kesehatan (4% employer + 1% employee), JHT (3.7% + 2%), JP (2% + 1%), PPh 21 (progressive tax table)
- Manual adjustments: bonus, commission, special deduction
- Net pay = Total Earnings - Total Deductions
- Calculation completes for 1000 employees in ≤ 30 seconds
- Draft mode: preview before final submission

**Story 5.2**  
As an **HR Manager**, I want to **approve payroll runs** so that **disbursement is authorized**.  
**Acceptance Criteria:**
- Two-step approval: HR Officer (process) → HR Manager (approve)
- Approval shows summary: total payroll, per-department breakdown, comparison with previous month
- Reject: return to draft with comments
- Approved payroll cannot be modified (creates new adjustment record instead)
- Full audit trail of all payroll changes

**Story 5.3**  
As an **Employee (ESS)**, I want to **view my payslip** so that **I understand my salary breakdown**.  
**Acceptance Criteria:**
- Payslip shows: earnings (itemized), deductions (itemized), net pay
- PPh 21 calculation breakdown visible
- BPJS contribution breakdown visible
- Download payslip as PDF
- History: all past payslips accessible
- Payslips available only after payroll marked as "paid"

**Story 5.4**  
As a **Finance Officer**, I want to **generate bank transfer file** so that **I can upload directly to the banking system**.  
**Acceptance Criteria:**
- Export format per bank (BCA, Mandiri, BRI, BNI — CSV format)
- File includes: employee name, bank account, amount, reference
- Auto-reconcile: match payroll items to bank accounts
- Error handling: employees without bank account flagged
- Generate summary report: total transfer, per-bank breakdown

**Story 5.5**  
As an **HR Manager**, I want to **auto-calculate THR** (Tunjangan Hari Raya) so that **compliance with PP 78/2015 is maintained**.  
**Acceptance Criteria:**
- THR = (Basic Salary + Fixed Allowances) × (months worked / 12)
- Trigger: configurable (1 month before Hari Raya)
- Pro-rata for employees with < 12 months tenure
- THR only for employees with ≥ 1 month tenure
- Separate payroll run for THR (not mixed with regular payroll)

---

#### Module 6: Expense / Reimbursement

**Story 6.1**  
As an **Employee**, I want to **submit an expense claim** with receipt so that **I get reimbursed for work-related expenses**.  
**Acceptance Criteria:**
- Claim types: Transport, Meal, Accommodation, Communication, Training, Other
- Upload receipt image/PDF (max 10MB per file)
- Fields: date, type, amount (IDR), description, receipt
- Claims > Rp 100.000 require receipt upload
- Submit within 30 days of expense date
- Auto-route to direct manager for approval

**Story 6.2**  
As a **Department Manager**, I want to **approve or reject expense claims** so that **only valid business expenses are reimbursed**.  
**Acceptance Criteria:**
- View claim details + receipt image preview
- Approve: mark for inclusion in next payroll
- Reject: mandatory reason, notify employee
- Claims > Rp 5.000.000 require additional approval from HR Director
- Bulk approve: select multiple claims, approve at once

---

#### Module 7: Recruitment

**Story 7.1**  
As a **Recruiter**, I want to **create a job posting** so that **I can attract candidates**.  
**Acceptance Criteria:**
- Fields: title, department, location, description, requirements, salary range, employment type
- Template library for common positions
- Approval required from HR Manager before publishing
- Publish to: internal job board (built-in)
- Status: Draft → Pending Approval → Published → Closed

**Story 7.2**  
As a **Recruiter**, I want to **track applicants through a pipeline** so that **I never lose track of a candidate**.  
**Acceptance Criteria:**
- Pipeline stages (configurable): Screening → Assessment → Interview (HR) → Interview (Technical) → Final Interview → Offer → Hired/Rejected
- Kanban board view: drag & drop between stages
- Per-candidate: notes, interview scores, source tracking
- Bulk status update (reject multiple candidates at once)
- Source tracking: Job Board, Referral, Walk-in, Social Media

**Story 7.3**  
As a **Recruiter**, I want to **schedule interviews** integrated with the pipeline so that **scheduling conflicts are avoided**.  
**Acceptance Criteria:**
- Schedule interview: date, time, interviewer(s), type (Phone/Video/In-person)
- Check interviewer availability (calendar view)
- Auto-notify interviewer and candidate
- Interview notes and scoring form
- Reschedule with audit trail

---

#### Module 8: Onboarding

**Story 8.1**  
As an **HR Officer**, I want to **create and track onboarding checklists** for new hires so that **nothing falls through the cracks**.  
**Acceptance Criteria:**
- Template checklist (configurable per department/position)
- Auto-triggered when hire is confirmed
- Tasks assigned to responsible parties (IT, HR, Manager)
- Progress tracking: percentage complete per new hire
- Reminder notifications for overdue tasks
- Pre-boarding tasks (before join date) + Day 1 + Week 1 + Month 1

**Story 8.2**  
As a **New Hire**, I want to **submit required documents** via a portal so that **I don't need to email them manually**.  
**Acceptance Criteria:**
- Document submission checklist (KTP, NPWP, ijazah, SKCK, etc.)
- Upload interface with drag & drop
- Status tracking: submitted, verified, pending
- HR can mark documents as verified/returned

---

#### Module 9: Offboarding

**Story 9.1**  
As an **HR Officer**, I want to **manage the offboarding process** so that **all clearance steps are completed before the employee's last day**.  
**Acceptance Criteria:**
- Trigger: resignation letter accepted or termination memo
- Clearance checklist: asset return, task handover, access revocation
- Final settlement calculation: pro-rata salary, unused leave compensation, outstanding deductions
- Generate Final Settlement Report (PDF)
- Employee status updated to "Inactive" after completion
- All data archived (not deleted)

---

#### Module 10: Document Management

**Story 10.1**  
As an **HR Officer**, I want to **upload and organize employee documents** so that **all documents are searchable and accessible**.  
**Acceptance Criteria:**
- Categories: Personal, Employment, Company
- File types: PDF, JPEG, PNG, DOCX (max 10MB per file)
- Access control: HR sees all; employee sees own documents only
- Version control: upload new version, keep history
- Expiry alerts: auto-notify 30 days before document expiry (KTP, contract)
- Search by: employee name, document type, date range

---

#### Module 11: Reporting & Analytics

**Story 11.1**  
As an **HR Director**, I want to **view an executive dashboard** with real-time KPIs so that **I can make data-driven decisions**.  
**Acceptance Criteria:**
- KPI cards: Total Headcount, New Hires (MTD), Turnover Rate (MTD/YTD), Total Payroll (MTD), Attendance Rate
- Charts (Recharts/Nivo):
  - Headcount trend (line, 12 months)
  - Turnover rate trend (line, 12 months)
  - Department distribution (pie/donut)
  - Payroll distribution by department (bar)
  - Leave usage by type (stacked bar)
  - Age & gender distribution
- Alerts panel: contracts expiring (30 days), probation ending (30 days), birthdays this month
- Dashboard loads in ≤ 3 seconds

**Story 11.2**  
As an **HR Manager**, I want to **generate standard reports** so that **management gets the data they need**.  
**Acceptance Criteria:**
- Reports available (PDF + Excel):
  - Headcount Report (by department, position, status)
  - Turnover Report (monthly, with reasons)
  - Attendance Summary (per employee, per department)
  - Leave Balance Report
  - Overtime Report
  - Payroll Summary
  - PPh 21 Report
  - BPJS Report
  - New Hire Report
  - Exit Report
  - Demographics Report
- Date range filter on all reports
- Export in ≤ 60 seconds for full-month data

---

#### Module 12: Role-Based Access Control (RBAC)

**Story 12.1**  
As a **Super Admin**, I want to **manage user roles and permissions** so that **each user only accesses what they're authorized for**.  
**Acceptance Criteria:**
- Predefined roles: Super Admin, HR Director, HR Manager, HR Officer, Recruiter, Finance Officer, Department Manager, Team Leader, Employee (ESS)
- Permission matrix: module × action (View, Create, Update, Delete, Approve, Export)
- Custom role creation: combine permissions from matrix
- Role assignment: one primary role per user
- Data-level access: Manager sees only own department; Employee sees only own data
- Changes to roles logged in audit trail

**Story 12.2**  
As an **Employee (ESS)**, I want to **access only my own data** (profile, payslip, leave balance) so that **company information stays confidential**.  
**Acceptance Criteria:**
- Employee can view: own profile, own payslips, own leave history/balance, own attendance
- Employee can update: own address, contact, bank account, emergency contact
- Employee can submit: leave requests, expense claims
- Employee cannot view: other employees' data, payroll reports, company financial data
- Enforced at API level (not just UI)

---

### 2.3 Non-Goals (v1.0)

| Non-Goal | Reason | Planned Version |
|----------|--------|-----------------|
| Learning Management System (LMS) | Out of HR core scope | v2.0 |
| Performance appraisal / OKR | Complex module, needs separate design | v2.0 |
| Employee engagement / surveys | Not core HRIS | v2.0 |
| Mobile native app (iOS/Android) | Responsive web is sufficient for v1.0 | v2.0 |
| Biometric/fingerprint device integration | Requires physical hardware; manual input for MVP | v1.1 |
| Multi-company / multi-tenant | Adds architectural complexity | v2.0 |
| International payroll (multi-currency) | Focus on Indonesia only | v3.0 |
| AI-powered features (chatbot, auto-classification) | Needs separate AI evaluation | v2.0 |

---

## 3. AI System Requirements

> **Not applicable for v1.0** — HRIS v1.0 is a traditional CRUD/workflow system. AI features planned for v2.0:
> - Intelligent document extraction (OCR for KTP, ijazah)
> - Anomaly detection in attendance data
> - Chatbot for employee FAQ (leave balance, policy)
> - Predictive turnover analytics

---

## 4. Technical Specifications

### 4.1 Technology Stack

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| **Frontend Framework** | Next.js (React) | 14+ | SSR for dashboard performance, App Router, server components |
| **UI Library** | shadcn/ui | latest | Accessible, customizable, Tailwind-native |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first, consistent design system |
| **Charting** | Recharts | 2.x | React-native, composable charts |
| **State Management** | TanStack Query + Zustand | latest | Server state caching + client state |
| **Backend Framework** | FastAPI | 0.110+ | Async Python, auto OpenAPI docs, high performance |
| **ORM** | SQLAlchemy 2.0 + Alembic | 2.0+ | Mature, async support, migration management |
| **Database** | PostgreSQL | 15+ | ACID, row-level security, JSONB support |
| **Cache** | Redis | 7+ | Session, rate limiting, background job queue |
| **File Storage** | AWS S3 | — | Employee documents, exports |
| **Background Jobs** | Celery + Redis | 5.x | Payroll processing, notifications, scheduled tasks |
| **Email** | AWS SES + Jinja2 templates | — | Transactional emails, cost-effective |
| **Search** | PostgreSQL FTS (full-text) | — | Sufficient for v1.0; Meilisearch for v2.0 |
| **Auth** | JWT (jose) + OAuth2 | — | Access + refresh tokens, Google SSO (optional) |
| **Monitoring** | Sentry + AWS CloudWatch | — | Error tracking + infrastructure metrics |
| **Containerization** | Docker + Docker Compose | — | Consistent dev/prod environments |
| **CI/CD** | GitHub Actions | — | Automated test + deploy pipeline |
| **Hosting** | AWS (ECS Fargate / EC2) | — | Managed containers, auto-scaling |
| **Database Hosting** | AWS RDS PostgreSQL | — | Managed, automated backups, encryption |

### 4.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ Desktop  │  │  Tablet  │  │  Mobile  │                 │
│  │ Browser  │  │ Browser  │  │ Browser  │                 │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                 │
└───────┼──────────────┼──────────────┼────────────────────────┘
        │              │              │
        ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│              AWS CloudFront (CDN + SSL Termination)         │
│              → Next.js Frontend (Static / SSR)              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼ API calls
┌─────────────────────────────────────────────────────────────┐
│              AWS ALB (Application Load Balancer)             │
│              → FastAPI Backend (ECS Fargate)                 │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Auth       │  │  Business    │  │  Background      │   │
│  │  (JWT/OAuth)│  │  Services    │  │  Workers         │   │
│  │             │  │  (FastAPI)   │  │  (Celery)        │   │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘   │
│         │                │                    │             │
└─────────┼────────────────┼────────────────────┼─────────────┘
          │                │                    │
          ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                             │
│  ┌──────────────┐  ┌──────────┐  ┌──────────────────┐      │
│  │ PostgreSQL   │  │  Redis   │  │  AWS S3          │      │
│  │ (AWS RDS)    │  │ (Cache + │  │  (Document       │      │
│  │ Primary +    │  │  Queue)  │  │   Storage)       │      │
│  │ Read Replica │  │          │  │                  │      │
│  └──────────────┘  └──────────┘  └──────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Data Flow: Payroll Processing

```
1. HR Officer clicks "Run Payroll" for period YYYY-MM
         │
         ▼
2. Backend validates: no duplicate run for period
         │
         ▼
3. Celery task triggered (async)
   ├── Fetch attendance data for period
   ├── Fetch active employees
   ├── For each employee:
   │   ├── Calculate base earnings
   │   ├── Calculate overtime (from attendance)
   │   ├── Calculate variable components (bonus, commission)
   │   ├── Calculate deductions:
   │   │   ├── BPJS Kesehatan (ceiling check)
   │   │   ├── BPJS Ketenagakerjaan (JHT + JP)
   │   │   ├── PPh 21 (annualizing method)
   │   │   └── Manual deductions (loan, absence)
   │   └── Net pay = Earnings - Deductions
   └── Store payroll_items in DB
         │
         ▼
4. HR Manager reviews → Approve
         │
         ▼
5. Generate outputs:
   ├── Payslips (PDF, per employee)
   ├── Bank transfer file (CSV per bank)
   ├── PPh 21 report (Excel)
   ├── BPJS report (Excel)
   └── Payroll summary (Excel)
         │
         ▼
6. Notification: "Payroll for YYYY-MM is ready" → all employees
```

### 4.4 Integration Points

| Integration | Protocol | Direction | Priority |
|-------------|----------|-----------|----------|
| **Fingerprint Device** | REST API (polling) | Inbound | High (v1.1) |
| **Google SSO** | OAuth 2.0 | Inbound | Medium |
| **AWS SES** | AWS SDK | Outbound | High |
| **AWS S3** | AWS SDK | Bidirectional | High |
| **Bank Transfer File** | CSV export | Outbound | High |
| **BPJS Report** | Excel export | Outbound | Medium |
| **PPh 21 / DJP** | Excel export | Outbound | Medium |

### 4.5 API Design

**Conventions:**
- Base URL: `/api/v1/`
- Format: RESTful JSON
- Auth: Bearer JWT (access token: 15min, refresh token: 7 days)
- Pagination: `?page=1&per_page=20` (default), cursor-based optional
- Filtering: `?status=active&department_id=xxx`
- Sorting: `?sort=created_at&order=desc`
- Date format: ISO 8601
- Error format: `{ "detail": "message", "code": "ERROR_CODE" }`

**Key Endpoint Groups (80+ endpoints):**

```
Auth:           POST /auth/login, /refresh, /logout, /forgot-password
Employees:      CRUD /employees, /employees/:id, /employees/import
Departments:    CRUD /departments, /departments/:id/members
Positions:      CRUD /positions
Attendance:     GET /attendance, POST /check-in, POST /check-out, PUT /:id
Leave:          CRUD /leave-requests, PUT /:id/approve, GET /balance/:emp_id
Payroll:        POST /payroll/runs, GET /runs/:id, PUT /runs/:id/approve
                GET /payslip/:emp_id/:period
Expenses:       CRUD /expenses, PUT /:id/approve
Recruitment:    CRUD /jobs, GET /jobs/:id/applicants, PUT /applicants/:id/stage
Onboarding:     GET /onboarding/:emp_id, PUT /tasks/:id/complete
Offboarding:    POST /offboarding, GET /clearance/:emp_id
Documents:      POST /documents/upload, GET /documents, GET /:id/download
Reports:        GET /reports/headcount, /turnover, /attendance, /payroll, /pph21
Dashboard:      GET /dashboard/kpis, /charts/:type, /alerts
Settings:       GET/PUT /settings/attendance, /leave-types, /payroll, /company
Users & Roles:  CRUD /users, /roles, PUT /users/:id/role
```

### 4.6 Database Schema (Key Entities)

```sql
-- Employees (core)
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(20) UNIQUE NOT NULL,  -- EMP-YYYYMMDD-XXX
    -- Personal data
    full_name VARCHAR(200) NOT NULL,
    nik VARCHAR(16) UNIQUE,
    npwp VARCHAR(20) UNIQUE,
    place_of_birth VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(20),
    blood_type VARCHAR(5),
    religion VARCHAR(50),
    marital_status VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(200) UNIQUE,
    address_ktp TEXT,
    address_domisili TEXT,
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(50),
    -- Employment data
    join_date DATE NOT NULL,
    contract_start DATE,
    contract_end DATE,
    probation_end DATE,
    employment_status VARCHAR(20) NOT NULL,  -- contract, permanent, outsourcing
    employment_type VARCHAR(20) DEFAULT 'full-time',
    department_id UUID REFERENCES departments(id),
    position_id UUID REFERENCES positions(id),
    reporting_to UUID REFERENCES employees(id),
    branch VARCHAR(100),
    -- Compensation
    base_salary NUMERIC(15,2),
    bank_name VARCHAR(100),
    bank_account VARCHAR(50),
    bank_account_name VARCHAR(200),
    bpjs_kesehatan_no VARCHAR(30),
    bpjs_ketenagakerjaan_no VARCHAR(30),
    -- Status
    status VARCHAR(20) DEFAULT 'active',  -- active, inactive, terminated
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    parent_id UUID REFERENCES departments(id),
    head_id UUID REFERENCES employees(id),
    cost_center VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Positions
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    level INTEGER,
    grade VARCHAR(10),
    department_id UUID REFERENCES departments(id),
    min_salary NUMERIC(15,2),
    max_salary NUMERIC(15,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance Records
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    date DATE NOT NULL,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL,  -- present, late, early_leave, absent, wfh, leave
    overtime_hours NUMERIC(5,2) DEFAULT 0,
    late_minutes INTEGER DEFAULT 0,
    source VARCHAR(20) DEFAULT 'web',  -- web, manual, fingerprint, api
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, date)
);

-- Leave Requests
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    leave_type VARCHAR(10) NOT NULL,  -- AL, SL, PL, ML, PT, BL, MR, HJ, UL, CB
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days NUMERIC(4,1) NOT NULL,
    reason TEXT,
    attachment_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending',  -- pending, approved, rejected
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave Balances
CREATE TABLE leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    leave_type VARCHAR(10) NOT NULL,
    year INTEGER NOT NULL,
    total_days NUMERIC(4,1) NOT NULL,
    used_days NUMERIC(4,1) DEFAULT 0,
    remaining_days NUMERIC(4,1) GENERATED ALWAYS AS (total_days - used_days) STORED,
    UNIQUE(employee_id, leave_type, year)
);

-- Payroll Runs
CREATE TABLE payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period VARCHAR(7) NOT NULL,  -- YYYY-MM
    status VARCHAR(20) DEFAULT 'draft',  -- draft, processing, calculated, approved, paid
    processed_by UUID REFERENCES employees(id),
    approved_by UUID REFERENCES employees(id),
    paid_at TIMESTAMPTZ,
    total_employees INTEGER,
    total_gross NUMERIC(18,2),
    total_deductions NUMERIC(18,2),
    total_net NUMERIC(18,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payroll Items (per employee per run)
CREATE TABLE payroll_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id),
    employee_id UUID NOT NULL REFERENCES employees(id),
    -- Earnings
    base_salary NUMERIC(15,2),
    fixed_allowances NUMERIC(15,2),
    variable_allowances NUMERIC(15,2),
    overtime_pay NUMERIC(15,2),
    bonus NUMERIC(15,2),
    commission NUMERIC(15,2),
    total_earnings NUMERIC(15,2),
    -- Deductions
    bpjs_kesehatan NUMERIC(15,2),
    bpjs_jht NUMERIC(15,2),
    bpjs_jp NUMERIC(15,2),
    pph21 NUMERIC(15,2),
    other_deductions NUMERIC(15,2),
    total_deductions NUMERIC(15,2),
    -- Net
    net_pay NUMERIC(15,2),
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(payroll_run_id, employee_id)
);

-- Expense Claims
CREATE TABLE expense_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    claim_date DATE NOT NULL,
    type VARCHAR(50) NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    description TEXT,
    receipt_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending',
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Postings
CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    department_id UUID REFERENCES departments(id),
    location VARCHAR(200),
    description TEXT,
    requirements TEXT,
    salary_min NUMERIC(15,2),
    salary_max NUMERIC(15,2),
    employment_type VARCHAR(20),
    status VARCHAR(20) DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applicants
CREATE TABLE applicants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_posting_id UUID NOT NULL REFERENCES job_postings(id),
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(200),
    phone VARCHAR(20),
    resume_url VARCHAR(500),
    cover_letter TEXT,
    source VARCHAR(50),
    current_stage VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id),
    category VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    file_type VARCHAR(20),
    file_url VARCHAR(500) NOT NULL,
    uploaded_by UUID REFERENCES employees(id),
    expires_at DATE,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES employees(id),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    action VARCHAR(20) NOT NULL,  -- create, update, delete
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id),
    email VARCHAR(200) UNIQUE NOT NULL,
    password_hash VARCHAR(200),
    role VARCHAR(50) NOT NULL DEFAULT 'employee',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.7 Security & Privacy

**Authentication:**
- JWT access token (15 min expiry) + refresh token (7 days, httpOnly cookie)
- Password policy: minimum 8 characters, uppercase + lowercase + number + special
- Failed login lockout: 5 attempts → lock 15 minutes
- Optional: Google OAuth 2.0 SSO

**Authorization:**
- Role-Based Access Control (RBAC) enforced at API middleware level
- Row-level data filtering: Department Manager sees only own department employees
- Employee ESS: sees only own data (enforced via `current_user.employee_id` filter)
- Permission check decorator on every endpoint

**Data Protection:**
- Encryption at rest: AWS RDS encryption (AES-256), S3 SSE-KMS
- Encryption in transit: TLS 1.3 enforced
- Password hashing: bcrypt (12 rounds)
- Sensitive fields (salary, bank account): application-level encryption (Fernet)
- PII masked in logs (no NIK, salary in application logs)
- Audit trail for all CRUD operations on sensitive data

**Compliance:**
- UU No. 13/2003 Ketenagakerjaan (Indonesian Labor Law)
- PP 78/2015 (Pengupahan)
- UU Cipta Kerja (Omnibus Law)
- Data export capability (GDPR-like right to data portability)
- Employee data retention: 5 years after termination
- No cross-border data transfer (data residency: Indonesia region)

### 4.8 Performance Requirements

| Metric | Requirement | Measurement Method |
|--------|-------------|-------------------|
| Page load (initial) | ≤ 3 seconds (p50), ≤ 5 seconds (p99) | Lighthouse + Sentry Performance |
| API response time | ≤ 500ms (p50), ≤ 2 seconds (p99) | FastAPI middleware metrics |
| Concurrent users | 500 simultaneous | Load test (k6/Locust) |
| Payroll calculation | ≤ 30 seconds for 1000 employees | Celery task duration metric |
| Report generation | ≤ 60 seconds for full-month data | Task duration metric |
| File upload | ≤ 10MB per file, ≤ 50 files bulk | S3 multipart upload |
| Database queries | ≤ 100ms for operational queries | pg_stat_statements |
| Dashboard load | ≤ 3 seconds with all widgets | Lighthouse |

---

## 5. Risks & Roadmap

### 5.1 Technical Risks

| # | Risk | Impact | Probability | Mitigation |
|---|------|--------|-------------|------------|
| 1 | PPh 21 calculation errors due to regulatory changes | **Critical** | Medium | Tax calculation as isolated, testable module; unit tests with official DJP test cases; config-driven tax tables |
| 2 | Payroll data integrity (race conditions during concurrent edits) | **Critical** | Medium | Database-level locks on payroll runs; optimistic locking on payroll items; single-writer pattern for payroll period |
| 3 | Data security breach (employee PII exposure) | **Critical** | Low | Encryption at rest + transit; RBAC at API level; security audit pre-launch; bug bounty program |
| 4 | BPJS ceiling/rate changes mid-year | **High** | High | Configurable BPJS rates in admin settings; effectivity-date-based configuration (not hardcoded) |
| 5 | Fingerprint device integration complexity | **High** | High | Manual attendance input as fallback; device integration in v1.1 (after core is stable) |
| 6 | User adoption resistance (HR team used to Excel) | **High** | High | Training program, import tools, parallel run period, change management champion |
| 7 | Scope creep from stakeholder requests | **High** | High | Strict non-goals documented; sprint reviews with stakeholder; change request process |
| 8 | AWS costs exceeding budget | Medium | Low | Cost monitoring via CloudWatch budgets; right-size instances; use Fargate Spot for non-prod |

### 5.2 Phased Rollout

#### Phase 1: MVP (Month 1–3) — Core HR Foundation

| Sprint | Deliverables |
|--------|-------------|
| **Sprint 1-2** (Week 1-4) | Project setup, auth (JWT), user management, RBAC, employee master data (CRUD + bulk import), org structure |
| **Sprint 3-4** (Week 5-8) | Attendance management (web check-in, manual input), leave management (request, approval, balance), notifications (email + in-app) |
| **Sprint 5-6** (Week 9-12) | Basic payroll (calculation, payslip), dashboard (headcount + attendance summary), basic reporting (headcount, attendance, leave balance), data migration tools, UAT |

**Phase 1 Exit Criteria:**
- Employee CRUD operational with bulk import
- Attendance + Leave workflow end-to-end
- Basic payroll runs with payslip generation
- RBAC enforced across all endpoints
- ≥ 80% unit test coverage on payroll module
- UAT signed off by HR team

#### Phase 2: Enhanced Features (Month 4–6)

| Sprint | Deliverables |
|--------|-------------|
| **Sprint 7-8** | Expense/reimbursement module, advanced attendance (shift scheduling, WFH), document management |
| **Sprint 9-10** | Recruitment module (ATS, pipeline), onboarding module (checklists, task tracking) |
| **Sprint 11-12** | Offboarding module, advanced payroll (PPh 21 auto-calc, BPJS auto-calc, THR), advanced reporting (12+ reports, export), fingerprint device integration (v1.1) |

**Phase 2 Exit Criteria:**
- All 12 modules operational
- Payroll calculates PPh 21 and BPJS automatically
- Recruitment pipeline with kanban view
- All standard reports available (PDF + Excel)
- ≥ 80% unit test coverage overall

#### Phase 3: Scale & Optimize (Month 7–9)

| Sprint | Deliverables |
|--------|-------------|
| **Sprint 13-14** | SSO integration (Google), advanced search, performance optimization, load testing |
| **Sprint 15-16** | Executive dashboard (full analytics), mobile-responsive optimization, API documentation portal |
| **Sprint 17-18** | Audit & compliance reporting, production hardening, disaster recovery setup, documentation |

**Phase 3 Exit Criteria:**
- System handles 500 concurrent users (load test)
- All P0/P1 bugs resolved
- Security audit passed
- Disaster recovery tested (backup + restore)
- Production deployment with monitoring + alerting

### 5.3 Testing Strategy

| Test Type | Tool | Coverage Target |
|-----------|------|-----------------|
| Unit Tests | pytest | ≥ 80% overall, ≥ 90% payroll |
| API Integration Tests | pytest + httpx | ≥ 85% endpoints |
| E2E Tests | Playwright | Critical user flows |
| Load Tests | k6 / Locust | 500 concurrent users |
| Security Tests | OWASP ZAP + manual | Pre-launch audit |

**Critical Test Scenarios:**
1. Payroll calculation accuracy: 100 employees with various scenarios (overtime, unpaid leave, new hire pro-rata, THR)
2. PPh 21 accuracy: compare against DJP official calculator
3. Leave balance: pro-rata new hire, year-end reset, carry-over
4. RBAC enforcement: each role can only access permitted endpoints/data
5. Concurrent payroll processing: single-writer lock validation

### 5.4 DevOps & Deployment

```
GitHub Actions CI/CD Pipeline:
  ┌──────┐    ┌──────┐    ┌──────────┐    ┌────────┐    ┌──────────┐    ┌────────────┐
  │ Lint │───▶│ Test │───▶│ Build    │───▶│ Scan   │───▶│ Deploy   │───▶│ Smoke Test │
  │(ruff)│    │(pyt) │    │(Docker)  │    │(Trivy) │    │(ECS)     │    │(healthchk) │
  └──────┘    └──────┘    └──────────┘    └────────┘    └──────────┘    └────────────┘
                                                                      │
                                              ┌────────────────────────┘
                                              ▼
                                        ┌──────────┐
                                        │ Manual   │
                                        │ Approval │ (production only)
                                        └──────────┘
```

**Environment Strategy:**

| Environment | Infrastructure | Purpose |
|-------------|---------------|---------|
| **Local** | Docker Compose | Development |
| **Staging** | AWS ECS (single task) + RDS (db.t3.medium) | Pre-production testing |
| **Production** | AWS ECS Fargate (2+ tasks) + RDS (db.r6g.large, Multi-AZ) | Live system |

**Monitoring Stack:**
- **Sentry**: Application error tracking + performance monitoring
- **AWS CloudWatch**: Infrastructure metrics, logs, alarms
- **UptimeRobot**: External uptime monitoring (HTTP checks every 5 min)
- **PagerDuty/Slack**: Alert routing for P0/P1 incidents

### 5.5 Data Migration Plan

| Phase | Activity | Duration |
|-------|----------|----------|
| **1. Audit** | Inventory existing data sources (spreadsheets, old system) | Week 1 |
| **2. Mapping** | Map source fields → HRIS schema, identify gaps | Week 2 |
| **3. Cleanse** | Standardize data (dates, phone formats, duplicates) | Week 2-3 |
| **4. Import** | Bulk import via CSV/Excel wizard | Week 3 |
| **5. Validate** | HR team verifies imported data (spot check 10%) | Week 4 |
| **6. Sign-off** | HR Manager approves data accuracy | Week 4 |

---

## Appendix A: Indonesian Regulatory Reference

### PPh 21 Tax Calculation (2026)

```
PTKP (Penghasilan Tidak Kena Pajak):
  TK/0 (single):              Rp 54.000.000/tahun
  TK/1 (1 dependent):         Rp 58.500.000/tahun
  K/0 (married):              Rp 58.500.000/tahun
  K/1 (married + 1):          Rp 63.000.000/tahun
  K/2:                        Rp 67.500.000/tahun
  K/3:                        Rp 72.000.000/tahun
  + Rp 4.500.000 per additional dependent

Progressive Tax Rate:
  Up to Rp 60.000.000:          0%
  Rp 60.000.001 - Rp 250.000.000:   5%
  Rp 250.000.001 - Rp 500.000.000:  10%
  Rp 500.000.001 - Rp 5.000.000.000: 15%
  Rp 5.000.000.001 - Rp 10.000.000.000: 20%
  Above Rp 10.000.000.000:           25%

Annualizing Method:
  PKP tahunan = (bruto × 12) - PTKP
  PPh 21 tahunan = hitung progressive tax atas PKP
  PPh 21 bulanan = PPh 21 tahunan / 12
```

### BPJS Contribution (2026)

```
BPJS Kesehatan:
  Employer: 4% × (Gaji Pokok + Tunjangan Tetap) [max ceiling]
  Employee: 1% × (Gaji Pokok + Tunjangan Tetap) [max ceiling]

BPJS Ketenagakerjaan:
  JKK (Jaminan Kecelakaan Kerja): 0.24% (low risk) — 1.74% (high risk)
  JKM (Jaminan Kematian):         0.30%
  JHT (Jaminan Hari Tua):         3.70% employer + 2.00% employee
  JP  (Jaminan Pensiun):          2.00% employer + 1.00% employee [max ceiling]

⚠️ Angka di atas untuk referensi. Selalu update sesuai PMK/PP terbaru.
```

### THR Calculation (PP 78/2015)

```
THR = (Gaji Pokok + Tunjangan Tetap) × (Masa Kerja dalam 12 bulan / 12)

Ketentuan:
  - Wajib dibayarkan maksimal 7 hari sebelum Hari Raya
  - Karyawan ≥ 12 bulan masa kerja: THR penuh
  - Karyawan < 12 bulan: pro-rata
  - Karyawan < 1 bulan: tidak wajib
```

---

## Appendix B: Glossary

| Term | Definition |
|------|-----------|
| PKWT | Perjanjian Kerja Waktu Tertentu (Fixed-Term Employment Agreement) |
| PKWTT | Perjanjian Kerja Waktu Tidak Tertentu (Indefinite Employment Agreement) |
| THR | Tunjangan Hari Raya (Religious Holiday Allowance) |
| PPh 21 | Pajak Penghasilan Pasal 21 (Income Tax Article 21) |
| BPJS | Badan Penyelenggara Jaminan Sosial (Social Security Administrator) |
| PTKP | Penghasilan Tidak Kena Pajak (Non-Taxable Income) |
| JHT | Jaminan Hari Tua (Old Age Security) |
| JP | Jaminan Pensiun (Pension Security) |
| JKK | Jaminan Kecelakaan Kerja (Work Accident Security) |
| JKM | Jaminan Kematian (Death Security) |
| ESS | Employee Self-Service |
| ATS | Applicant Tracking System |
| NPS | Net Promoter Score |

---

**Document Owner:** Product Team  
**Last Updated:** 2026-09-21  
**Next Review:** TBD  
**PRD Skill:** [github/awesome-copilot — prd](https://github.com/github/awesome-copilot)
