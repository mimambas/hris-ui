'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center min-h-screen bg-surface-soft">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5">
        <AlertTriangle size={26} className="text-semantic-down" />
      </div>
      <h2 className="text-lg font-bold text-ink">Something went wrong</h2>
      <p className="text-sm text-muted mt-2 max-w-md">{error?.message || 'An unexpected error occurred.'}</p>
      {error?.digest && <p className="text-xs text-muted mt-2 font-mono">Error ID: {error.digest}</p>}
      <button onClick={reset} className="btn-primary gap-2 mt-6">
        <RefreshCw size={15} /> Try again
      </button>
    </div>
  );
}
