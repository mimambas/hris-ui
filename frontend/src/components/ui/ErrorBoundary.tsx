'use client';

import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5">
            <AlertTriangle size={26} className="text-semantic-down" />
          </div>
          <h2 className="text-lg font-bold text-ink">Something went wrong</h2>
          <p className="text-sm text-muted mt-2 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred while rendering this page.'}
          </p>
          <button onClick={() => { this.setState({ hasError: false }); location.reload(); }} className="btn-primary gap-2 mt-6">
            <RefreshCw size={15} /> Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
