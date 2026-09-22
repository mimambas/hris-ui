import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { ToastProvider } from '@/components/ui/Toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-surface-soft">
        <Sidebar />
        <div className="flex-1 ml-0 lg:ml-64 min-w-0">
          <Topbar />
          <main className="w-full p-5 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-[1800px]">
              <ErrorBoundary>{children}</ErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
