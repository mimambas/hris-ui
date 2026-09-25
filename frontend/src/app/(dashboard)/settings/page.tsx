'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { Building2, Clock, CalendarDays, Wallet, Bell, Shield, Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

type SettingsData = {
  companyName: string;
  legalEntity: string;
  npwp: string;
  industry: string;
  address: string;
  timezone: string;
  fiscalYear: string;
  currency: string;
  workStart: string;
  workEnd: string;
  gracePeriod: string;
  overtimePolicy: string;
  maxOvertime: string;
  weekendWork: string;
  annualLeave: string;
  sickLeave: string;
  personalLeave: string;
  carryOver: string;
  leaveApproval: string;
  maternityLeave: string;
  marriageLeave: string;
  payrollCycle: string;
  payDay: string;
  taxMethod: string;
  bpjsKesehatan: string;
  bpjsKetenagakerjaan: string;
  thr: string;
  payrollCurrency: string;
  passwordPolicy: string;
  sessionTimeout: string;
  twoFactor: string;
  loginAttempts: string;
  passwordExpiry: string;
  auditRetention: string;
  notifLeave: boolean;
  notifLeaveInApp: boolean;
  notifExpense: boolean;
  notifExpenseInApp: boolean;
  notifContract: boolean;
  notifContractInApp: boolean;
  notifProbation: boolean;
  notifProbationInApp: boolean;
  notifPayroll: boolean;
  notifPayrollInApp: boolean;
  notifBirthday: boolean;
  notifBirthdayInApp: boolean;
};

const defaults: SettingsData = {
  companyName: 'PT Maju Bersama',
  legalEntity: 'PT Maju Bersama Indonesia',
  npwp: '12.345.678.9-012.000',
  industry: 'Technology / Software',
  address: 'Jl. Sudirman Kav. 52-53, Jakarta Selatan 12190',
  timezone: 'Asia/Jakarta (WIB, UTC+7)',
  fiscalYear: 'jan',
  currency: 'IDR',
  workStart: '08:00',
  workEnd: '17:00',
  gracePeriod: '15',
  overtimePolicy: 'daily',
  maxOvertime: '4',
  weekendWork: 'none',
  annualLeave: '12',
  sickLeave: '12',
  personalLeave: '3',
  carryOver: 'partial',
  leaveApproval: 'manager',
  maternityLeave: '90',
  marriageLeave: '3',
  payrollCycle: 'monthly',
  payDay: '28',
  taxMethod: 'gross',
  bpjsKesehatan: '5-4',
  bpjsKetenagakerjaan: 'all',
  thr: 'annual',
  payrollCurrency: 'IDR',
  passwordPolicy: 'strong',
  sessionTimeout: '30',
  twoFactor: 'optional',
  loginAttempts: '5',
  passwordExpiry: '90',
  auditRetention: '365',
  notifLeave: true,
  notifLeaveInApp: true,
  notifExpense: true,
  notifExpenseInApp: true,
  notifContract: true,
  notifContractInApp: true,
  notifProbation: true,
  notifProbationInApp: true,
  notifPayroll: true,
  notifPayrollInApp: true,
  notifBirthday: true,
  notifBirthdayInApp: true,
};

const sections = [
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'leave', label: 'Leave', icon: CalendarDays },
  { id: 'payroll', label: 'Payroll', icon: Wallet },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

function SettingsCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
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

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
      <div className="w-11 h-6 bg-hairline rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/30 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
    </label>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('company');
  const [data, setData] = useState<SettingsData>({ ...defaults });
  const [savedData, setSavedData] = useState<SettingsData>({ ...defaults });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const { toast } = useToast();

  const dirty = useMemo(() => JSON.stringify(data) !== JSON.stringify(savedData), [data, savedData]);
  const update = useCallback(<K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    api.get('/settings').then((response) => {
      const loaded = { ...defaults, ...(response.data.settings ?? {}) } as SettingsData;
      setData(loaded);
      setSavedData(loaded);
    }).catch(() => toast('Unable to load organization settings.', 'error')).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.patch('/settings', { settings: data });
      const saved = { ...defaults, ...(response.data.settings ?? {}) } as SettingsData;
      setData(saved);
      setSavedData(saved);
      toast('Settings saved successfully.', 'success');
    } catch (error: any) {
      toast(error.response?.data?.detail || 'Unable to save settings.', 'error');
    } finally { setSaving(false); }
  };

  const handleReset = () => {
    setData(savedData);
    setShowReset(false);
    toast('Unsaved changes were reset.', 'success');
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

        <div className="lg:col-span-3">{loading && <div className="mb-4 text-sm text-muted">Loading settings…</div>}
          {activeSection === 'company' && (
            <SettingsCard title="Company Profile" description="Basic information about your organization">
              <div className="space-y-0">
                <Field label="Company name" hint="Displayed across the app">
                  <input type="text" value={data.companyName} onChange={(e) => update('companyName', e.target.value)} className="input-field" />
                </Field>
                <Field label="Legal entity (PT/CV)" hint="As per AKTA">
                  <input type="text" value={data.legalEntity} onChange={(e) => update('legalEntity', e.target.value)} className="input-field" />
                </Field>
                <Field label="NPWP" hint="Tax identification number">
                  <input type="text" value={data.npwp} onChange={(e) => update('npwp', e.target.value)} className="input-field font-mono" />
                </Field>
                <Field label="Industry" hint="Sector classification">
                  <input type="text" value={data.industry} onChange={(e) => update('industry', e.target.value)} className="input-field" />
                </Field>
                <Field label="Address" hint="Registered office address">
                  <textarea value={data.address} onChange={(e) => update('address', e.target.value)} className="input-field" rows={2} />
                </Field>
                <Field label="Timezone" hint="Used for attendance and scheduling">
                  <select value={data.timezone} onChange={(e) => update('timezone', e.target.value)} className="input-field">
                    <option>Asia/Jakarta (WIB, UTC+7)</option>
                    <option>Asia/Makassar (WITA, UTC+8)</option>
                    <option>Asia/Jayapura (WIT, UTC+9)</option>
                  </select>
                </Field>
                <Field label="Fiscal year" hint="Tax and reporting year">
                  <select value={data.fiscalYear} onChange={(e) => update('fiscalYear', e.target.value)} className="input-field">
                    <option value="jan">January — December</option>
                    <option value="apr">April — March</option>
                    <option value="jul">July — June</option>
                  </select>
                </Field>
                <Field label="Currency" hint="Default currency for payroll">
                  <select value={data.currency} onChange={(e) => update('currency', e.target.value)} className="input-field">
                    <option>IDR</option>
                    <option>USD</option>
                  </select>
                </Field>
              </div>
            </SettingsCard>
          )}

          {activeSection === 'attendance' && (
            <SettingsCard title="Attendance Rules" description="Configure working hours, shifts, and overtime policies">
              <div className="space-y-0">
                <Field label="Work start time" hint="Default check-in time">
                  <input type="time" value={data.workStart} onChange={(e) => update('workStart', e.target.value)} className="input-field font-mono" />
                </Field>
                <Field label="Work end time" hint="Default check-out time">
                  <input type="time" value={data.workEnd} onChange={(e) => update('workEnd', e.target.value)} className="input-field font-mono" />
                </Field>
                <Field label="Grace period" hint="Minutes after start before marked late">
                  <select value={data.gracePeriod} onChange={(e) => update('gracePeriod', e.target.value)} className="input-field">
                    <option value="0">0 minutes</option>
                    <option value="5">5 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                  </select>
                </Field>
                <Field label="Overtime policy" hint="How overtime is calculated">
                  <select value={data.overtimePolicy} onChange={(e) => update('overtimePolicy', e.target.value)} className="input-field">
                    <option value="daily">Daily approval required</option>
                    <option value="auto">Auto-calculate from clock times</option>
                    <option value="disabled">Overtime not tracked</option>
                  </select>
                </Field>
                <Field label="Max overtime (hours/day)" hint="Cap for daily overtime">
                  <input type="number" value={data.maxOvertime} onChange={(e) => update('maxOvertime', e.target.value)} min="0" max="12" className="input-field font-mono" />
                </Field>
                <Field label="Weekend work" hint="Work schedule on weekends">
                  <select value={data.weekendWork} onChange={(e) => update('weekendWork', e.target.value)} className="input-field">
                    <option value="none">Not scheduled</option>
                    <option value="optional">Optional (half-day)</option>
                    <option value="full">Full working day</option>
                  </select>
                </Field>
              </div>
            </SettingsCard>
          )}

          {activeSection === 'leave' && (
            <SettingsCard title="Leave Policy" description="Set leave entitlements and approval workflows">
              <div className="space-y-0">
                <Field label="Annual leave (days/year)" hint="Per employee entitlement">
                  <input type="number" value={data.annualLeave} onChange={(e) => update('annualLeave', e.target.value)} min="0" max="60" className="input-field font-mono" />
                </Field>
                <Field label="Sick leave (days/year)" hint="Paid sick leave allowance">
                  <input type="number" value={data.sickLeave} onChange={(e) => update('sickLeave', e.target.value)} min="0" max="60" className="input-field font-mono" />
                </Field>
                <Field label="Personal leave (days/year)" hint="Unpaid or paid personal days">
                  <input type="number" value={data.personalLeave} onChange={(e) => update('personalLeave', e.target.value)} min="0" max="30" className="input-field font-mono" />
                </Field>
                <Field label="Carry-over policy" hint="Unused leave rollover">
                  <select value={data.carryOver} onChange={(e) => update('carryOver', e.target.value)} className="input-field">
                    <option value="none">No carry-over</option>
                    <option value="partial">Carry up to 5 days</option>
                    <option value="full">Full carry-over</option>
                  </select>
                </Field>
                <Field label="Approval workflow" hint="Who approves leave requests">
                  <select value={data.leaveApproval} onChange={(e) => update('leaveApproval', e.target.value)} className="input-field">
                    <option value="manager">Direct manager approval</option>
                    <option value="hr">HR department approval</option>
                    <option value="dual">Manager + HR dual approval</option>
                  </select>
                </Field>
                <Field label="Maternity leave (days)" hint="As per Indonesian labor law">
                  <input type="number" value={data.maternityLeave} onChange={(e) => update('maternityLeave', e.target.value)} min="0" max="180" className="input-field font-mono" />
                </Field>
                <Field label="Marriage leave (days)" hint="Employee marriage entitlement">
                  <input type="number" value={data.marriageLeave} onChange={(e) => update('marriageLeave', e.target.value)} min="0" max="14" className="input-field font-mono" />
                </Field>
              </div>
            </SettingsCard>
          )}

          {activeSection === 'payroll' && (
            <SettingsCard title="Payroll Configuration" description="Define payroll cycles, tax settings, and benefits">
              <div className="space-y-0">
                <Field label="Payroll cycle" hint="How often payroll is processed">
                  <select value={data.payrollCycle} onChange={(e) => update('payrollCycle', e.target.value)} className="input-field">
                    <option value="monthly">Monthly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </Field>
                <Field label="Pay day" hint="Day of month payment is made">
                  <input type="number" value={data.payDay} onChange={(e) => update('payDay', e.target.value)} min="1" max="31" className="input-field font-mono" />
                </Field>
                <Field label="Tax method" hint="PPh 21 calculation method">
                  <select value={data.taxMethod} onChange={(e) => update('taxMethod', e.target.value)} className="input-field">
                    <option value="gross">Gross-up (employer absorbs tax)</option>
                    <option value="net">Net income (employee bears tax)</option>
                  </select>
                </Field>
                <Field label="BPJS Kesehatan" hint="Health insurance contribution">
                  <select value={data.bpjsKesehatan} onChange={(e) => update('bpjsKesehatan', e.target.value)} className="input-field">
                    <option value="4-4">4% employer, 4% employee</option>
                    <option value="5-4">5% employer, 4% employee</option>
                  </select>
                </Field>
                <Field label="BPJS Ketenagakerjaan" hint="Employment social security">
                  <select value={data.bpjsKetenagakerjaan} onChange={(e) => update('bpjsKetenagakerjaan', e.target.value)} className="input-field">
                    <option value="all">All components (JKK + JKM + JHT + JP)</option>
                    <option value="basic">Basic (JKK + JKM only)</option>
                  </select>
                </Field>
                <Field label="THR (Tunjangan Hari Raya)" hint="Religious holiday allowance">
                  <select value={data.thr} onChange={(e) => update('thr', e.target.value)} className="input-field">
                    <option value="annual">Annual (1 month salary)</option>
                    <option value="prorated">Prorated by tenure</option>
                  </select>
                </Field>
                <Field label="Currency" hint="Default payroll currency">
                  <select value={data.payrollCurrency} onChange={(e) => update('payrollCurrency', e.target.value)} className="input-field">
                    <option>IDR</option>
                    <option>USD</option>
                  </select>
                </Field>
              </div>
            </SettingsCard>
          )}

          {activeSection === 'notifications' && (
            <SettingsCard title="Notification Preferences" description="Control how and when you receive alerts">
              <div className="space-y-0">
                {[
                  { label: 'Leave requests', hint: 'When employees submit leave', emailKey: 'notifLeave' as const, inAppKey: 'notifLeaveInApp' as const },
                  { label: 'Expense claims', hint: 'New claims awaiting review', emailKey: 'notifExpense' as const, inAppKey: 'notifExpenseInApp' as const },
                  { label: 'Contract expirations', hint: '30, 14, and 7 days before expiry', emailKey: 'notifContract' as const, inAppKey: 'notifContractInApp' as const },
                  { label: 'Probation endings', hint: 'Reminders for upcoming reviews', emailKey: 'notifProbation' as const, inAppKey: 'notifProbationInApp' as const },
                  { label: 'Payroll processed', hint: 'Confirmation after payroll run', emailKey: 'notifPayroll' as const, inAppKey: 'notifPayrollInApp' as const },
                  { label: 'Birthday reminders', hint: 'Upcoming employee birthdays', emailKey: 'notifBirthday' as const, inAppKey: 'notifBirthdayInApp' as const },
                ].map((item) => (
                  <Field key={item.label} label={item.label} hint={item.hint}>
                    <div className="flex items-center gap-4">
                      <Toggle checked={data[item.emailKey]} onChange={(v) => update(item.emailKey, v)} />
                      <span className="text-xs text-muted">Email</span>
                      <Toggle checked={data[item.inAppKey]} onChange={(v) => update(item.inAppKey, v)} />
                      <span className="text-xs text-muted">In-app</span>
                    </div>
                  </Field>
                ))}
              </div>
            </SettingsCard>
          )}

          {activeSection === 'security' && (
            <SettingsCard title="Security" description="Manage authentication, sessions, and access controls">
              <div className="space-y-0">
                <Field label="Password policy" hint="Minimum requirements">
                  <select value={data.passwordPolicy} onChange={(e) => update('passwordPolicy', e.target.value)} className="input-field">
                    <option value="basic">Basic (8 chars)</option>
                    <option value="medium">Medium (8 chars, mixed case)</option>
                    <option value="strong">Strong (8+ chars, mixed case, numbers, symbols)</option>
                  </select>
                </Field>
                <Field label="Session timeout" hint="Inactivity timeout for active sessions">
                  <select value={data.sessionTimeout} onChange={(e) => update('sessionTimeout', e.target.value)} className="input-field">
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </Field>
                <Field label="Two-factor authentication" hint="Require 2FA for all users">
                  <select value={data.twoFactor} onChange={(e) => update('twoFactor', e.target.value)} className="input-field">
                    <option value="disabled">Disabled</option>
                    <option value="optional">Optional</option>
                    <option value="required">Required for all users</option>
                  </select>
                </Field>
                <Field label="Login attempts" hint="Before account lockout">
                  <input type="number" value={data.loginAttempts} onChange={(e) => update('loginAttempts', e.target.value)} min="1" max="20" className="input-field font-mono" />
                </Field>
                <Field label="Password expiry" hint="Force password change interval">
                  <select value={data.passwordExpiry} onChange={(e) => update('passwordExpiry', e.target.value)} className="input-field">
                    <option value="never">Never</option>
                    <option value="60">Every 60 days</option>
                    <option value="90">Every 90 days</option>
                  </select>
                </Field>
                <Field label="Audit log retention" hint="How long logs are kept">
                  <select value={data.auditRetention} onChange={(e) => update('auditRetention', e.target.value)} className="input-field">
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                    <option value="365">1 year</option>
                    <option value="730">2 years</option>
                  </select>
                </Field>
              </div>
            </SettingsCard>
          )}

          <div className="flex items-center justify-end gap-3 mt-6">
            <button onClick={() => setShowReset(true)} disabled={!dirty} className="btn-secondary gap-2 text-sm disabled:opacity-50">
              <RotateCcw size={14} /> Reset
            </button>
            <button onClick={handleSave} disabled={saving || !dirty} className="btn-primary gap-2 text-sm disabled:opacity-50">
              <Save size={14} /> {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>

      {showReset && (
        <ConfirmDialog
          open
          title="Reset settings"
          description="All settings will revert to their default values. Unsaved changes will be lost."
          confirmLabel="Reset all"
          onConfirm={handleReset}
          onCancel={() => setShowReset(false)}
        />
      )}
    </div>
  );
}
