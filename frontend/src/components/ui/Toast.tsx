'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const icons: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const colors: Record<ToastType, string> = {
  success: 'bg-cta text-white',
  error: 'bg-semantic-down text-white',
  info: 'bg-primary text-white',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timerRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timerRef.current.get(id);
    if (timer) { clearTimeout(timer); timerRef.current.delete(id); }
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    const timer = setTimeout(() => remove(id), 4000);
    timerRef.current.set(id, timer);
  }, [remove]);

  useEffect(() => {
    return () => { timerRef.current.forEach((t) => clearTimeout(t)); };
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none max-w-sm">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div key={t.id} className={`pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-medium animate-in slide-in-from-bottom-4 ${colors[t.type]}`}>
              <Icon size={18} className="shrink-0" />
              <span className="flex-1">{t.message}</span>
              <button onClick={() => remove(t.id)} aria-label="Dismiss notification" className="shrink-0 p-1 rounded-md hover:bg-white/20 transition-colors"><X size={14} /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
