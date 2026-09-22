'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'primary', onConfirm, onCancel }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Tab') {
        const focusable = [cancelRef.current, confirmRef.current].filter(Boolean) as HTMLElement[];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    confirmRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onCancel} />
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-desc" className="relative w-full max-w-md rounded-2xl bg-canvas border border-hairline shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 pt-6 pb-2 flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${variant === 'danger' ? 'bg-red-50 text-semantic-down' : 'bg-primary-surface text-primary'}`}>
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="confirm-title" className="text-base font-bold text-ink">{title}</h2>
            <p id="confirm-desc" className="text-sm text-body mt-1">{description}</p>
          </div>
          <button onClick={onCancel} aria-label="Close dialog" className="shrink-0 min-h-10 min-w-10 rounded-md hover:bg-surface-strong -mt-1 -mr-1 flex items-center justify-center transition-colors">
            <X size={16} className="text-muted" />
          </button>
        </div>
        <div className="px-6 py-4 border-t border-hairline-soft flex items-center justify-end gap-3 bg-surface-soft/30">
          <button ref={cancelRef} onClick={onCancel} className="btn-secondary text-sm">{cancelLabel}</button>
          <button ref={confirmRef} onClick={onConfirm} className={`text-sm min-h-11 px-5 rounded-pill font-semibold inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${variant === 'danger' ? 'bg-semantic-down text-white hover:bg-red-600 focus:ring-semantic-down/30' : 'bg-primary text-white hover:bg-primary-hover focus:ring-primary/30'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
