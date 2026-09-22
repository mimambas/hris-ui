'use client';

import { useState } from 'react';
import {
  FileText, AlertTriangle, CheckCircle2, HardDrive, Search, Upload, MoreHorizontal, Download, Clock, Shield, X, Eye, Trash2, Send, Edit3, Copy,
} from 'lucide-react';
import ModuleHeader from '@/components/ui/ModuleHeader';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useEscapeKey } from '@/components/ui/useEscapeKey';

type Doc = {
  id: string; name: string; employee: string; type: string; size: string; uploaded: string;
  expiry: string; status: 'valid' | 'expiring' | 'expired'; uploadBy: string;
  reminderSent?: boolean; renewalRequested?: boolean;};

const initialDocs: Doc[] = [
  { id: '1', name: 'Employment Agreement', employee: 'Rina Sari', type: 'Contract', size: '2.4 MB', uploaded: '22 Sep 2026', expiry: '15 Mar 2027', status: 'valid', uploadBy: 'Rina Sari' },
  { id: '2', name: 'KTP', employee: 'Budi Hartono', type: 'Identity', size: '1.8 MB', uploaded: '01 Jun 2021', expiry: '2028', status: 'valid', uploadBy: 'System' },
  { id: '3', name: 'NPWP', employee: 'Sari Dewi', type: 'Tax', size: '890 KB', uploaded: '10 Jan 2023', expiry: '—', status: 'valid', uploadBy: 'Sari Dewi' },
  { id: '4', name: 'Employment Agreement', employee: 'Andi Pratama', type: 'Contract', size: '2.1 MB', uploaded: '20 Sep 2022', expiry: '20 Sep 2026', status: 'expiring', uploadBy: 'Andi Pratama' },
  { id: '5', name: 'BPJS Certificate', employee: 'Dewi Lestari', type: 'Benefits', size: '1.2 MB', uploaded: '14 Feb 2024', expiry: '—', status: 'valid', uploadBy: 'HR System' },
  { id: '6', name: 'NDA', employee: 'Fajar Nugroho', type: 'Legal', size: '450 KB', uploaded: '01 Nov 2022', expiry: '01 Nov 2025', status: 'expired', uploadBy: 'Fajar Nugroho' },
  { id: '7', name: 'SKCK', employee: 'Rizky Prasetyo', type: 'Identity', size: '1.1 MB', uploaded: '05 Aug 2023', expiry: '05 Aug 2026', status: 'expired', uploadBy: 'Rizky Prasetyo' },
  { id: '8', name: 'Surat Keterangan Sehat', employee: 'Maya Anggraeni', type: 'Medical', size: '780 KB', uploaded: '10 Jul 2025', expiry: '10 Jul 2026', status: 'expired', uploadBy: 'Maya Anggraeni' },
];

const statusMeta: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  valid: { label: 'Valid', color: 'bg-cta-surface text-cta-hover', icon: CheckCircle2 },
  expiring: { label: 'Expiring soon', color: 'bg-amber-50 text-accent-yellow', icon: Clock },
  expired: { label: 'Expired', color: 'bg-red-50 text-semantic-down', icon: AlertTriangle },
};

const categories = ['All Documents', 'Contract', 'Identity', 'Tax', 'Benefits', 'Legal', 'Medical'];

const employees = ['Rina Sari', 'Budi Hartono', 'Sari Dewi', 'Andi Pratama', 'Dewi Lestari', 'Fajar Nugroho', 'Rizky Prasetyo', 'Maya Anggraeni'];

function downloadTextFile(filename: string, content: string, mime = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function DocPreviewModal({ doc, onClose, onDownload }: { doc: Doc; onClose: () => void; onDownload: () => void }) {
  useEscapeKey(onClose);
  const st = statusMeta[doc.status];
  const Icon = st.icon;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-canvas border border-hairline shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-canvas border-b border-hairline-soft px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-base font-bold text-ink">Document Preview</h2>
          <button onClick={onClose} aria-label="Close preview" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button>
        </div>
        <div className="px-6 py-5">
          <div className="rounded-xl bg-surface-soft border border-hairline p-8 mb-5 flex flex-col items-center justify-center min-h-[200px]">
            <FileText size={48} className="text-primary mb-3" />
            <p className="text-sm font-bold text-ink">{doc.name}</p>
            <p className="text-xs text-muted mt-1">{doc.employee} · {doc.type}</p>
            <p className="text-[11px] text-muted mt-1">{doc.size}</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-muted">Employee</span><span className="font-semibold text-ink">{doc.employee}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted">Document type</span><span className="badge bg-surface-strong text-muted">{doc.type}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted">Uploaded</span><span className="text-ink">{doc.uploaded}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted">Uploaded by</span><span className="text-ink">{doc.uploadBy}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted">Expiry</span><span className="font-mono text-ink">{doc.expiry}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted">Status</span><span className={`badge gap-1.5 ${st.color}`}><Icon size={12} /> {st.label}</span></div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-hairline-soft flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center text-sm">Close</button>
          <button onClick={onDownload} className="btn-cta flex-1 justify-center gap-2 text-sm"><Download size={14} /> Download</button>
        </div>
      </div>
    </div>
  );
}

function RequestDocsModal({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  useEscapeKey(onClose);
  const [selectedEmps, setSelectedEmps] = useState<string[]>([]);
  const [docTypes, setDocTypes] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [sending, setSending] = useState(false);

  const allTypes = ['KTP', 'NPWP', 'BPJS Certificate', 'SKCK', 'Surat Keterangan Sehat', 'Employment Agreement', 'NDA'];

  const toggleEmp = (name: string) => setSelectedEmps((cur) => cur.includes(name) ? cur.filter((n) => n !== name) : [...cur, name]);
  const toggleType = (t: string) => setDocTypes((cur) => cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmps.length === 0 || docTypes.length === 0) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast(`Document request sent to ${selectedEmps.length} employee${selectedEmps.length > 1 ? 's' : ''}.`, 'success');
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full max-w-lg rounded-2xl bg-canvas border border-hairline shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-canvas border-b border-hairline-soft px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-base font-bold text-ink">Request Documents</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div>
            <p className="text-sm font-semibold text-ink mb-2">Select employees <span className="text-semantic-down">*</span></p>
            <div className="flex flex-wrap gap-2">
              {employees.map((name) => (
                <button key={name} type="button" onClick={() => toggleEmp(name)} className={`min-h-9 px-3 rounded-pill text-xs font-semibold transition-colors ${selectedEmps.includes(name) ? 'bg-primary text-white' : 'bg-surface-strong text-muted hover:text-ink'}`}>{name}</button>
              ))}
            </div>
            {selectedEmps.length === 0 && <p className="text-[11px] text-muted mt-2">Select at least one employee</p>}
          </div>

          <div>
            <p className="text-sm font-semibold text-ink mb-2">Document types <span className="text-semantic-down">*</span></p>
            <div className="flex flex-wrap gap-2">
              {allTypes.map((t) => (
                <button key={t} type="button" onClick={() => toggleType(t)} className={`min-h-9 px-3 rounded-pill text-xs font-semibold transition-colors ${docTypes.includes(t) ? 'bg-primary text-white' : 'bg-surface-strong text-muted hover:text-ink'}`}>{t}</button>
              ))}
            </div>
            {docTypes.length === 0 && <p className="text-[11px] text-muted mt-2">Select at least one document type</p>}
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-ink">Due date</span>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input-field mt-1.5" />
          </label>
        </div>
        <div className="px-6 py-4 border-t border-hairline-soft flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center text-sm">Cancel</button>
          <button type="submit" disabled={selectedEmps.length === 0 || docTypes.length === 0 || sending} className="btn-cta flex-1 justify-center gap-2 text-sm disabled:opacity-50">
            {sending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
            Send Request
          </button>
        </div>
      </form>
    </div>
  );
}

function ExpiryAlertModal({ docs, onClose, onRemind, onRequestRenewal }: { docs: Doc[]; onClose: () => void; onRemind: (doc: Doc) => void; onRequestRenewal: (doc: Doc) => void }) {
  useEscapeKey(onClose);
  const expiring = docs.filter((d) => d.status === 'expiring');
  const expired = docs.filter((d) => d.status === 'expired');

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-canvas border border-hairline shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-canvas border-b border-hairline-soft px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-base font-bold text-ink">Document Expiry Alerts</h2>
          <button onClick={onClose} aria-label="Close" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button>
        </div>
        <div className="px-6 py-5 space-y-5">
          {expiring.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-accent-yellow uppercase tracking-wider mb-3 flex items-center gap-2"><Clock size={13} /> Expiring Soon ({expiring.length})</h3>
              <div className="space-y-2">
                {expiring.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50/30">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0"><Clock size={14} className="text-accent-yellow" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink">{d.name} — {d.employee}</p>
                      <p className="text-[11px] text-muted">Expires {d.expiry}</p>
                    </div>
                    <button
                      disabled={d.reminderSent}
                      onClick={() => onRemind(d)}
                      className={`min-h-9 px-3 rounded-pill text-[11px] font-semibold transition-colors ${d.reminderSent ? 'bg-amber-50 text-muted cursor-default' : 'bg-amber-100 text-accent-yellow hover:bg-amber-200'}`}
                    >
                      {d.reminderSent ? 'Reminder sent' : 'Remind'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {expired.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-semantic-down uppercase tracking-wider mb-3 flex items-center gap-2"><AlertTriangle size={13} /> Expired ({expired.length})</h3>
              <div className="space-y-2">
                {expired.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl border border-red-200 bg-red-50/30">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0"><AlertTriangle size={14} className="text-semantic-down" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink">{d.name} — {d.employee}</p>
                      <p className="text-[11px] text-muted">Expired {d.expiry}</p>
                    </div>
                    <button
                      disabled={d.renewalRequested}
                      onClick={() => onRequestRenewal(d)}
                      className={`min-h-9 px-3 rounded-pill text-[11px] font-semibold transition-colors ${d.renewalRequested ? 'bg-red-50 text-muted cursor-default' : 'bg-red-100 text-semantic-down hover:bg-red-200'}`}
                    >
                      {d.renewalRequested ? 'Renewal sent' : 'Request renewal'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-hairline-soft">
          <button onClick={onClose} className="btn-secondary w-full justify-center text-sm">Close</button>
        </div>
      </div>
    </div>
  );
}

function PolicyTemplatesModal({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  useEscapeKey(onClose);
  const templates = [
    { name: 'Employment Agreement', desc: 'Standard employment contract template', category: 'Contract' },
    { name: 'Non-Disclosure Agreement', desc: 'Confidentiality agreement for employees', category: 'Legal' },
    { name: 'Offer Letter', desc: 'Job offer letter template', category: 'Contract' },
    { name: 'Internship Agreement', desc: 'Internship program agreement', category: 'Contract' },
    { name: 'BPJS Enrollment Form', desc: 'BPJS Kesehatan & Ketenagakerjaan enrollment', category: 'Benefits' },
    { name: 'Leave Request Form', desc: 'Standard leave application form', category: 'HR' },
  ];
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-canvas border border-hairline shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-canvas border-b border-hairline-soft px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-base font-bold text-ink">Policy Templates</h2>
          <button onClick={onClose} aria-label="Close" className="btn-secondary min-h-10 min-w-10 px-3"><X size={15} /></button>
        </div>
        <div className="px-6 py-5 space-y-2">
          {templates.map((t) => (
            <div key={t.name} className="flex items-center gap-3 p-3 rounded-xl border border-hairline hover:bg-surface-soft transition-colors">
              <div className="w-9 h-9 rounded-lg bg-primary-surface flex items-center justify-center shrink-0"><FileText size={15} className="text-primary" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink">{t.name}</p>
                <p className="text-[11px] text-muted">{t.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge bg-surface-strong text-muted text-[10px]">{t.category}</span>
                <button onClick={() => { downloadTextFile(`${t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-template.txt`, `${t.name}\n\n${t.desc}\n\nHRIS policy template placeholder.`, 'text/plain;charset=utf-8'); toast(`${t.name} downloaded.`, 'success'); }} className="min-h-9 min-w-9 rounded-lg hover:bg-primary-surface flex items-center justify-center" aria-label={`Download ${t.name}`}><Download size={14} className="text-muted" /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-hairline-soft">
          <button onClick={onClose} className="btn-secondary w-full justify-center text-sm">Close</button>
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState(initialDocs);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Documents');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
  const [actionDoc, setActionDoc] = useState<Doc | null>(null);
  const [showRequest, setShowRequest] = useState(false);
  const [showExpiry, setShowExpiry] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const { toast } = useToast();

  const submitUpload = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const file = data.get('file') as File | null;
    const docType = (data.get('docType') as string) || 'Contract';
    const docEmployee = (data.get('docEmployee') as string) || 'Rina Sari';
    if (!file || file.size === 0) { setUploadError('Choose a file to upload.'); return; }
    if (file.size > 10 * 1024 * 1024) { setUploadError('File must be 10 MB or smaller.'); return; }
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.type)) { setUploadError('Only PDF, PNG, JPG, and WebP files are supported.'); return; }
    setUploadError('');
    setShowUpload(false);
    const newDoc: Doc = {
      id: String(Date.now()),
      name: file.name.replace(/\.[^.]+$/, ''),
      employee: docEmployee,
      type: docType,
      size: file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`,
      uploaded: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      expiry: '—',
      status: 'valid',
      uploadBy: 'You',
    };
    setDocs((prev) => [newDoc, ...prev]);
    toast('Document uploaded successfully.', 'success');
  };

  const handleDelete = (doc: Doc) => {
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    setActionDoc(null);
    toast(`${doc.name} (${doc.employee}) has been deleted.`, 'success');
  };

  const handleRemind = (doc: Doc) => {
    setDocs((prev) => prev.map((d) => d.id === doc.id ? { ...d, reminderSent: true } : d));
    toast(`Reminder sent to ${doc.employee}.`, 'success');
  };

  const handleRequestRenewal = (doc: Doc) => {
    setDocs((prev) => prev.map((d) => d.id === doc.id ? { ...d, renewalRequested: true } : d));
    toast(`Renewal request sent to ${doc.employee}.`, 'success');
  };

  const handleDownload = (doc: Doc) => {
    setActionDoc(null);
    downloadTextFile(`${doc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${doc.employee.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`, `${doc.name}\nEmployee: ${doc.employee}\nType: ${doc.type}\nUploaded: ${doc.uploaded}\nExpiry: ${doc.expiry}\nStatus: ${statusMeta[doc.status].label}\nSize: ${doc.size}`);
    toast(`Downloaded ${doc.name} — ${doc.employee}.`, 'success');
  };

  const filtered = docs.filter((d) => {
    const matchesSearch = `${d.name} ${d.employee} ${d.type}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All Documents' || d.type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <ModuleHeader eyebrow="File management" title="Documents" description="Store and manage employee documents securely" action={<button onClick={() => setShowUpload(true)} className="btn-cta gap-2"><Upload size={15} /> Upload Document</button>} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard icon={FileText} label="Total documents" value={String(docs.length + 1278)} tone="primary" detail="Across 486 employees" />
        <StatCard icon={HardDrive} label="Storage used" value="2.8 GB" tone="primary" detail="1.2 GB available" />
        <StatCard icon={Clock} label="Expiring soon" value={String(docs.filter((d) => d.status === 'expiring').length)} tone="amber" detail="Within 30 days" />
        <StatCard icon={AlertTriangle} label="Expired" value={String(docs.filter((d) => d.status === 'expired').length)} tone="red" detail="Requires renewal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-6">
        <div className="lg:col-span-3 card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-hairline-soft flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-soft" />
              <input type="search" aria-label="Search documents" placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full min-h-10 rounded-pill bg-surface-strong pl-9 pr-3 py-2 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          <div className="px-5 py-3 border-b border-hairline-soft flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`min-h-9 px-3 rounded-pill text-[11px] font-semibold whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-primary text-white' : 'bg-surface-strong text-muted hover:text-ink'}`}>{cat}</button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="table-header">Document</th>
                  <th className="table-header">Employee</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Size</th>
                  <th className="table-header">Expiry</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? <tr><td colSpan={7}><EmptyState title="No documents found" description="Try another search or category filter." /></td></tr> : filtered.map((doc) => {
                  const st = statusMeta[doc.status];
                  const Icon = st.icon;
                  return (
                    <tr key={doc.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary-surface flex items-center justify-center shrink-0"><FileText size={14} className="text-primary" /></div>
                          <button onClick={() => setPreviewDoc(doc)} className="font-semibold text-ink hover:text-primary transition-colors text-left max-w-[200px] truncate">{doc.name}</button>
                        </div>
                      </td>
                      <td className="table-cell text-body text-sm">{doc.employee}</td>
                      <td className="table-cell"><span className="badge bg-surface-strong text-muted">{doc.type}</span></td>
                      <td className="table-cell font-mono text-xs text-muted">{doc.size}</td>
                      <td className="table-cell font-mono text-xs text-ink">{doc.expiry}</td>
                      <td className="table-cell"><span className={`badge gap-1.5 ${st.color}`}><Icon size={12} /> {st.label}</span></td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setPreviewDoc(doc)} className="min-h-10 min-w-10 rounded-md hover:bg-primary-surface" aria-label={`Preview ${doc.name}`} title="Preview"><Eye size={14} className="mx-auto text-muted" /></button>
                          <button onClick={() => handleDownload(doc)} className="min-h-10 min-w-10 rounded-md hover:bg-primary-surface" aria-label={`Download ${doc.name}`} title="Download"><Download size={14} className="mx-auto text-muted" /></button>
                          <div className="relative">
                            <button onClick={() => setActionDoc(actionDoc?.id === doc.id ? null : doc)} className="min-h-10 min-w-10 rounded-md hover:bg-primary-surface" aria-label={`Actions for ${doc.name}`} title="More"><MoreHorizontal size={16} className="mx-auto text-muted" /></button>
                            {actionDoc?.id === doc.id && (
                              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-canvas border border-hairline shadow-xl z-20 py-1">
                                <button onClick={() => { setPreviewDoc(doc); setActionDoc(null); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-body hover:bg-surface-soft transition-colors"><Eye size={13} className="text-muted" /> Preview</button>
                                <button onClick={() => { handleDownload(doc); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-body hover:bg-surface-soft transition-colors"><Download size={13} className="text-muted" /> Download</button>
                                <button onClick={() => { navigator.clipboard?.writeText(`${doc.name} — ${doc.employee}, ${doc.type}, ${doc.expiry}`); toast('Document info copied.', 'success'); setActionDoc(null); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-body hover:bg-surface-soft transition-colors"><Copy size={13} className="text-muted" /> Copy info</button>
                                <div className="border-t border-hairline-soft my-1" />
                                <button onClick={() => { handleDelete(doc); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-semantic-down hover:bg-red-50 transition-colors"><Trash2 size={13} /> Delete</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 border-t border-hairline-soft">
            <p className="text-xs text-muted">Showing {filtered.length} of {docs.length} documents</p>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-sm font-bold text-ink">Quick actions</h2>
          {[
            { label: 'Request documents', desc: 'Send a batch request to employees', icon: Send, action: () => setShowRequest(true) },
            { label: 'Expiry alerts', desc: `${docs.filter((d) => d.status !== 'valid').length} documents need attention`, icon: AlertTriangle, action: () => setShowExpiry(true) },
            { label: 'Policy templates', desc: 'Contract, NDA, offer letter', icon: Shield, action: () => setShowTemplates(true) },
          ].map((item) => (
            <button key={item.label} onClick={item.action} className="w-full text-left rounded-lg border border-hairline p-3 hover:border-primary-light hover:bg-primary-surface/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-surface flex items-center justify-center shrink-0"><item.icon size={15} className="text-primary" /></div>
                <div><p className="text-xs font-bold text-ink">{item.label}</p><p className="text-[11px] text-muted mt-0.5">{item.desc}</p></div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {showUpload && <div className="fixed inset-0 z-[80] flex items-center justify-center p-4"><div className="absolute inset-0 bg-ink/40" onClick={() => setShowUpload(false)} /><form onSubmit={submitUpload} className="relative w-full max-w-md rounded-2xl bg-canvas border border-hairline shadow-2xl p-6"><div className="flex items-center justify-between mb-5"><div><h2 className="text-base font-bold text-ink">Upload document</h2><p className="text-xs text-muted mt-1">PDF, PNG, JPG, or WebP up to 10 MB</p></div><button type="button" onClick={() => setShowUpload(false)} aria-label="Close upload dialog" className="min-h-10 min-w-10 rounded-md hover:bg-surface-strong flex items-center justify-center"><X size={16} className="text-muted" /></button></div><div className="space-y-4"><label className="block text-sm font-semibold text-ink">Employee<select name="docEmployee" className="input-field mt-1.5">{employees.map((e) => <option key={e}>{e}</option>)}</select></label><label className="block text-sm font-semibold text-ink">Document type<select name="docType" className="input-field mt-1.5"><option>Contract</option><option>Identity</option><option>Tax</option><option>Benefits</option><option>Legal</option><option>Medical</option></select></label><label className="block text-sm font-semibold text-ink">Choose file<input name="file" type="file" accept="application/pdf,image/png,image/jpeg,image/webp" className="input-field mt-1.5 py-2" /></label>{uploadError && <p role="alert" className="text-xs text-semantic-down mt-1">{uploadError}</p>}</div><div className="flex justify-end gap-3 mt-6 pt-4 border-t border-hairline-soft"><button type="button" onClick={() => setShowUpload(false)} className="btn-secondary text-sm">Cancel</button><button type="submit" className="btn-cta text-sm">Upload</button></div></form></div>}

      {previewDoc && <DocPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} onDownload={() => handleDownload(previewDoc)} />}
      {showRequest && <RequestDocsModal onClose={() => setShowRequest(false)} />}
      {showExpiry && <ExpiryAlertModal docs={docs} onClose={() => setShowExpiry(false)} onRemind={handleRemind} onRequestRenewal={handleRequestRenewal} />}
      {showTemplates && <PolicyTemplatesModal onClose={() => setShowTemplates(false)} />}
    </div>
  );
}
