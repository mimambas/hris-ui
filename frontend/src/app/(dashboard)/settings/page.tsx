'use client';

import { useState } from 'react';
import { Building2, Clock, CalendarDays, Wallet, Bell, Shield, Save } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const sections = [
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'leave', label: 'Leave', icon: CalendarDays },
  { id: 'payroll', label: 'Payroll', icon: Wallet },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('company');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setSaving(false);
    toast('Settings saved successfully.', 'success');
  };

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Settings</h1>
        <p className="mt-1.5 text-sm text-muted">Configure your HRIS workspace preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="card p-2 h-fit lg:sticky lg:top-24">
          <nav aria-label="Settings sections" className="space-y-0.5">
            {sections.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveSection(id)} aria-current={activeSection === id ? 'page' : undefined} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-11 ${activeSection === id ? 'bg-primary-surface text-primary font-semibold' : 'text-body hover:bg-primary-surface/50 hover:text-ink'}`}>
                <Icon size={17} strokeWidth={activeSection === id ? 2 : 1.5} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3">
          {activeSection === 'company' && <CompanySettings />}
          {activeSection === 'attendance' && <AttendanceSettings />}
          {activeSection === 'leave' && <LeaveSettings />}
          {activeSection === 'payroll' && <PayrollSettings />}
          {activeSection === 'notifications' && <NotificationSettings />}
          {activeSection === 'security' && <SecuritySettings />}
          <div className="flex justify-end mt-6">
            <button onClick={handleSave} disabled={saving} className="btn-primary gap-2 text-sm"><Save size={14} /> {saving ? 'Saving…' : 'Save changes'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsCard({ title, description, onDirty, children }: { title: string; description: string; onDirty?: () => void; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="mb-5">
        <h2 className="text-sm font-bold text-ink">{title}</h2>
        <p className="text-xs text-muted mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start py-3 border-b border-hairline-soft last:border-0">
      <div><label className="text-sm font-semibold text-ink">{label}</label>{hint && <p className="text-[11px] text-muted mt-0.5">{hint}</p>}</div>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}

function CompanySettings() {
  return (
    <SettingsCard title="Company Profile" description="Basic information about your organization">
      <div className="space-y-0">
        <Field label="Company name" hint="Displayed across the app"><input type="text" defaultValue="PT Maju Bersama" className="input-field" /></Field>
        <Field label="Legal entity (PT/CV)" hint="As per AKTA"><input type="text" defaultValue="PT Maju Bersama Indonesia" className="input-field" /></Field>
        <Field label="NPWP" hint="Tax identification number"><input type="text" defaultValue="12.345.678.9-012.000" className="input-field font-mono" /></Field>
        <Field label="Industry" hint="Sector classification"><input type="text" defaultValue="Technology / Software" className="input-field" /></Field>
        <Field label="Address" hint="Registered office address"><textarea defaultValue="Jl. Sudirman Kav. 52-53, Jakarta Selatan 12190" className="input-field" rows={2} /></Field>
        <Field label="Timezone" hint="Used for attendance and scheduling"><select defaultValue="Asia/Jakarta" className="input-field"><option>Asia/Jakarta (WIB, UTC+7)</option><option>Asia/Makassar (WITA, UTC+8)</option><option>Asia/Jayapura (WIT, UTC+9)</option></select></Field>
        <Field label="Fiscal year" hint="Tax and reporting year"><select defaultValue="jan" className="input-field"><option value="jan">January — December</option><option value="apr">April — March</option><option value="jul">July — June</option></select></Field>
        <Field label="Currency" hint="Default currency for payroll"><select defaultValue="IDR" className="input-field"><option>IDR — Indonesian Rupiah</option><option>USD — US Dollar</option></select></Field>
      </div>
    </SettingsCard>
  );
}

function AttendanceSettings() {
  return (
    <SettingsCard title="Attendance Rules" description="Configure working hours, shifts, and overtime policies">
      <div className="space-y-0">
        <Field label="Work start time" hint="Default check-in time"><input type="time" defaultValue="08:00" className="input-field font-mono" /></Field>
        <Field label="Work end time" hint="Default check-out time"><input type="time" defaultValue="17:00" className="input-field font-mono" /></Field>
        <Field label="Grace period" hint="Minutes after start before marked late"><select defaultValue="15" className="input-field"><option>0 minutes</option><option>5 minutes</option><option>15 minutes</option><option>30 minutes</option></select></Field>
        <Field label="Overtime policy" hint="How overtime is calculated"><select defaultValue="daily" className="input-field"><option value="daily">Daily approval required</option><option value="auto">Auto-calculate from clock times</option><option value="disabled">Overtime not tracked</option></select></Field>
        <Field label="Max overtime (hours/day)" hint="Cap for daily overtime"><input type="number" defaultValue="4" className="input-field font-mono" /></Field>
        <Field label="Weekend work" hint="Work schedule on weekends"><select defaultValue="none" className="input-field"><option value="none">Not scheduled</option><option value="optional">Optional (half-day)</option><option value="full">Full working day</option></select></Field>
      </div>
    </SettingsCard>
  );
}

function LeaveSettings() {
  return (
    <SettingsCard title="Leave Policy" description="Set leave entitlements and approval workflows">
      <div className="space-y-0">
        <Field label="Annual leave (days/year)" hint="Per employee entitlement"><input type="number" defaultValue="12" className="input-field font-mono" /></Field>
        <Field label="Sick leave (days/year)" hint="Paid sick leave allowance"><input type="number" defaultValue="12" className="input-field font-mono" /></Field>
        <Field label="Personal leave (days/year)" hint="Unpaid or paid personal days"><input type="number" defaultValue="3" className="input-field font-mono" /></Field>
        <Field label="Carry-over policy" hint="Unused leave rollover"><select defaultValue="partial" className="input-field"><option value="none">No carry-over</option><option value="partial">Carry up to 5 days</option><option value="full">Full carry-over</option></select></Field>
        <Field label="Approval workflow" hint="Who approves leave requests"><select defaultValue="manager" className="input-field"><option value="manager">Direct manager approval</option><option value="hr">HR department approval</option><option value="dual">Manager + HR dual approval</option></select></Field>
        <Field label="Maternity leave (days)" hint="As per Indonesian labor law"><input type="number" defaultValue="90" className="input-field font-mono" /></Field>
        <Field label="Marriage leave (days)" hint="Employee marriage entitlement"><input type="number" defaultValue="3" className="input-field font-mono" /></Field>
      </div>
    </SettingsCard>
  );
}

function PayrollSettings() {
  return (
    <SettingsCard title="Payroll Configuration" description="Define payroll cycles, tax settings, and benefits">
      <div className="space-y-0">
        <Field label="Payroll cycle" hint="How often payroll is processed"><select defaultValue="monthly" className="input-field"><option value="monthly">Monthly</option><option value="biweekly">Bi-weekly</option><option value="weekly">Weekly</option></select></Field>
        <Field label="Pay day" hint="Day of month payment is made"><input type="number" defaultValue="28" min="1" max="31" className="input-field font-mono" /></Field>
        <Field label="Tax method" hint="PPh 21 calculation method"><select defaultValue="gross" className="input-field"><option value="gross">Gross-up (employer absorbs tax)</option><option value="net">Net income (employee bears tax)</option></select></Field>
        <Field label="BPJS Kesehatan" hint="Health insurance contribution"><select defaultValue="5-4" className="input-field"><option value="4-4">4% employer, 4% employee</option><option value="5-4">5% employer, 4% employee</option></select></Field>
        <Field label="BPJS Ketenagakerjaan" hint="Employment social security"><select defaultValue="all" className="input-field"><option value="all">All components (JKK + JKM + JHT + JP)</option><option value="basic">Basic (JKK + JKM only)</option></select></Field>
        <Field label="THR (Tunjangan Hari Raya)" hint="Religious holiday allowance"><select defaultValue="annual" className="input-field"><option value="annual">Annual (1 month salary)</option><option value="prorated">Prorated by tenure</option></select></Field>
        <Field label="Currency" hint="Default payroll currency"><select defaultValue="IDR" className="input-field"><option>IDR — Indonesian Rupiah</option><option>USD — US Dollar</option></select></Field>
      </div>
    </SettingsCard>
  );
}

function NotificationSettings() {
  return (
    <SettingsCard title="Notification Preferences" description="Control how and when you receive alerts">
      <div className="space-y-0">
        {[
          { label: 'Leave requests', hint: 'When employees submit leave' },
          { label: 'Expense claims', hint: 'New claims awaiting review' },
          { label: 'Contract expirations', hint: '30, 14, and 7 days before expiry' },
          { label: 'Probation endings', hint: 'Reminders for upcoming reviews' },
          { label: 'Payroll processed', hint: 'Confirmation after payroll run' },
          { label: 'Birthday reminders', hint: 'Upcoming employee birthdays' },
        ].map((item) => (
          <Field key={item.label} label={item.label} hint={item.hint}>
            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-hairline rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/30 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
              </label>
              <span className="text-xs text-muted">Email</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-hairline rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/30 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
              </label>
              <span className="text-xs text-muted">In-app</span>
            </div>
          </Field>
        ))}
      </div>
    </SettingsCard>
  );
}

function SecuritySettings() {
  return (
    <SettingsCard title="Security" description="Manage authentication, sessions, and access controls">
      <div className="space-y-0">
        <Field label="Password policy" hint="Minimum requirements"><select defaultValue="strong" className="input-field"><option value="basic">Basic (8 chars)</option><option value="medium">Medium (8 chars, mixed case)</option><option value="strong">Strong (8+ chars, mixed case, numbers, symbols)</option></select></Field>
        <Field label="Session timeout" hint="Inactivity timeout for active sessions"><select defaultValue="30" className="input-field"><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">1 hour</option><option value="120">2 hours</option></select></Field>
        <Field label="Two-factor authentication" hint="Require 2FA for all users"><select defaultValue="optional" className="input-field"><option value="disabled">Disabled</option><option value="optional">Optional</option><option value="required">Required for all users</option></select></Field>
        <Field label="Login attempts" hint="Before account lockout"><input type="number" defaultValue="5" className="input-field font-mono" /></Field>
        <Field label="Password expiry" hint="Force password change interval"><select defaultValue="90" className="input-field"><option value="never">Never</option><option value="60">Every 60 days</option><option value="90">Every 90 days</option></select></Field>
        <Field label="Audit log retention" hint="How long logs are kept"><select defaultValue="365" className="input-field"><option value="90">90 days</option><option value="180">180 days</option><option value="365">1 year</option><option value="730">2 years</option></select></Field>
      </div>
    </SettingsCard>
  );
}
