'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const steps = ['Personal Info', 'Employment', 'Compensation', 'Review'];

export default function NewEmployeePage() {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [form, setForm] = useState({
    fullName: '', nik: '', npwp: '', placeOfBirth: '', dateOfBirth: '', gender: '', phone: '', email: '',
    addressKtp: '', addressDomisili: '', emergencyName: '', emergencyPhone: '', emergencyRelation: '',
    joinDate: '', employmentStatus: 'contract', employmentType: 'full-time', departmentId: '', positionId: '',
    reportingTo: '', branch: '', baseSalary: '', bankName: '', bankAccount: '', bankAccountName: '',
  });
  const { toast } = useToast();
  const set = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  const validateStep = (currentStep: number) => {
    const nextErrors: string[] = [];
    if (currentStep === 0) {
      if (!form.fullName.trim()) nextErrors.push('Full name is required.');
      if (form.nik && !/^\d{16}$/.test(form.nik)) nextErrors.push('NIK must contain exactly 16 digits.');
      if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.push('Enter a valid email address.');
      if (form.phone && !/^[+\d][\d\s-]{7,}$/.test(form.phone)) nextErrors.push('Enter a valid phone number.');
    }
    if (currentStep === 1 && !form.joinDate) nextErrors.push('Join date is required.');
    if (currentStep === 2) {
      if (!form.baseSalary || Number(form.baseSalary) <= 0) nextErrors.push('Base salary must be greater than zero.');
      if (form.bankAccount && !/^\d{6,20}$/.test(form.bankAccount)) nextErrors.push('Bank account must contain 6–20 digits.');
    }
    setErrors(nextErrors);
    return nextErrors.length === 0;
  };

  const nextStep = () => { if (validateStep(step)) setStep((current) => Math.min(current + 1, steps.length - 1)); };
  const saveEmployee = async () => {
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) { setStep(0); return; }
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setSaving(false);
    toast('Employee record created successfully.', 'success');
  };

  const hasData = Object.values(form).some(Boolean);

  return (
    <div>
      <div className="mb-6">
        <Link href="/employees" onClick={(event) => { if (hasData) { event.preventDefault(); setConfirmLeave(true); } }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors mb-3"><ArrowLeft size={14} /> Back to Employees</Link>
        <h1 className="text-2xl font-bold text-ink tracking-tight">Add New Employee</h1>
        <p className="text-sm text-muted mt-1">Create a new employee record in four simple steps</p>
      </div>

      <div className="flex items-start mb-8 max-w-3xl">
        {steps.map((s, i) => (
          <div key={s} className="flex items-start flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <button onClick={() => { if (validateStep(i - 1)) setStep(i); }} aria-label={`Go to ${s}`} className={`w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 ${i === step ? 'bg-primary text-white' : i < step ? 'bg-cta text-white' : 'bg-surface-strong text-muted'}`}>
                {i < step ? <Check size={15} /> : i + 1}
              </button>
              <span className={`text-[11px] font-semibold whitespace-nowrap ${i === step ? 'text-primary' : 'text-muted'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`h-0.5 flex-1 mt-[18px] mx-2 ${i < step ? 'bg-cta' : 'bg-hairline'}`} />}
          </div>
        ))}
      </div>

      <div className="card max-w-3xl">
        {errors.length > 0 && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-semantic-down"><div className="flex items-start gap-2"><AlertCircle size={16} className="mt-0.5 shrink-0" /><ul className="list-disc pl-4 space-y-1">{errors.map((error) => <li key={error}>{error}</li>)}</ul></div></div>}
        {step === 0 && (
          <div className="space-y-5">
            <div><h2 className="text-base font-bold text-ink">Personal Information</h2><p className="text-xs text-muted mt-1">Basic identity and contact details</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Full Name *" value={form.fullName} onChange={(v) => set('fullName', v)} placeholder="John Doe" />
              <Field label="NIK (16 digits)" value={form.nik} onChange={(v) => set('nik', v)} placeholder="3201234567890001" />
              <Field label="NPWP" value={form.npwp} onChange={(v) => set('npwp', v)} placeholder="12.345.678.9-012.000" />
              <Field label="Place of Birth" value={form.placeOfBirth} onChange={(v) => set('placeOfBirth', v)} placeholder="Jakarta" />
              <Field label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(v) => set('dateOfBirth', v)} />
              <SelectField label="Gender" value={form.gender} onChange={(v) => set('gender', v)} options={[['', 'Select...'], ['male', 'Male'], ['female', 'Female']]} />
              <Field label="Phone" value={form.phone} onChange={(v) => set('phone', v)} placeholder="+628123456789" />
              <Field label="Email" type="email" value={form.email} onChange={(v) => set('email', v)} placeholder="john@company.com" />
            </div>
            <TextAreaField label="Address (KTP)" value={form.addressKtp} onChange={(v) => set('addressKtp', v)} />
            <TextAreaField label="Address (Domisili)" value={form.addressDomisili} onChange={(v) => set('addressDomisili', v)} />
            <h3 className="text-sm font-bold text-ink pt-2">Emergency Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Field label="Name" value={form.emergencyName} onChange={(v) => set('emergencyName', v)} />
              <Field label="Phone" value={form.emergencyPhone} onChange={(v) => set('emergencyPhone', v)} />
              <Field label="Relation" value={form.emergencyRelation} onChange={(v) => set('emergencyRelation', v)} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div><h2 className="text-base font-bold text-ink">Employment Details</h2><p className="text-xs text-muted mt-1">Define the employee's role and working arrangement</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Join Date *" type="date" value={form.joinDate} onChange={(v) => set('joinDate', v)} />
              <SelectField label="Status" value={form.employmentStatus} onChange={(v) => set('employmentStatus', v)} options={[['contract', 'Contract (PKWT)'], ['permanent', 'Permanent (PKWTT)'], ['outsourcing', 'Outsourcing']]} />
              <SelectField label="Type" value={form.employmentType} onChange={(v) => set('employmentType', v)} options={[['full-time', 'Full-time'], ['part-time', 'Part-time'], ['intern', 'Intern']]} />
              <Field label="Branch" value={form.branch} onChange={(v) => set('branch', v)} placeholder="Head Office" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div><h2 className="text-base font-bold text-ink">Compensation & Bank</h2><p className="text-xs text-muted mt-1">Add salary and payment details</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Base Salary (IDR)" type="number" value={form.baseSalary} onChange={(v) => set('baseSalary', v)} placeholder="5000000" />
              <Field label="Bank Name" value={form.bankName} onChange={(v) => set('bankName', v)} placeholder="BCA" />
              <Field label="Account Number" value={form.bankAccount} onChange={(v) => set('bankAccount', v)} />
              <Field label="Account Name" value={form.bankAccountName} onChange={(v) => set('bankAccountName', v)} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div><h2 className="text-base font-bold text-ink">Review & Confirm</h2><p className="text-xs text-muted mt-1">Check the information before saving</p></div>
            <div className="bg-surface-soft rounded-lg p-5 text-sm space-y-3">
              <ReviewRow label="Name" value={form.fullName} /><ReviewRow label="NIK" value={form.nik} /><ReviewRow label="Email" value={form.email} /><ReviewRow label="Join Date" value={form.joinDate} /><ReviewRow label="Status" value={form.employmentStatus} /><ReviewRow label="Type" value={form.employmentType} /><ReviewRow label="Salary" value={form.baseSalary ? `Rp ${Number(form.baseSalary).toLocaleString('id-ID')}` : ''} /><ReviewRow label="Bank" value={`${form.bankName || '—'} — ${form.bankAccount || '—'}`} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-5 border-t border-hairline">
          <button onClick={() => step > 0 && setStep(step - 1)} className="btn-secondary text-sm" disabled={step === 0}>Previous</button>
          {step < steps.length - 1 ? <button onClick={nextStep} className="btn-primary text-sm">Next Step</button> : <button onClick={saveEmployee} disabled={saving} className="btn-cta text-sm gap-2"><Save size={14} /> {saving ? 'Saving…' : 'Save Employee'}</button>}
        </div>
      </div>
      <ConfirmDialog open={confirmLeave} title="Discard this employee?" description="You have unsaved employee information. Leaving now will discard your progress." confirmLabel="Discard and leave" variant="danger" onConfirm={() => { window.location.href = '/employees'; }} onCancel={() => setConfirmLeave(false)} />
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <div><label className="block text-sm font-semibold text-ink mb-1.5">{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="input-field" placeholder={placeholder} /></div>;
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return <div><label className="block text-sm font-semibold text-ink mb-1.5">{label}</label><select value={value} onChange={(e) => onChange(e.target.value)} className="input-field">{options.map(([v, text]) => <option key={v} value={v}>{text}</option>)}</select></div>;
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div><label className="block text-sm font-semibold text-ink mb-1.5">{label}</label><textarea value={value} onChange={(e) => onChange(e.target.value)} className="input-field" rows={2} /></div>;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return <p className="flex justify-between gap-4 border-b border-indigo-100 last:border-0 pb-2 last:pb-0"><span className="font-semibold text-ink">{label}</span><span className="text-body text-right">{value || '—'}</span></p>;
}
