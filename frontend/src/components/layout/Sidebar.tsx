'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Clock, CalendarDays, Wallet, Receipt,
  Briefcase, UserPlus, FileText, BarChart3, Settings, LogOut, Building2,
  GitBranch, ClipboardList, Search, Calendar, UserCircle, X, UserMinus,
} from 'lucide-react';
import { useMobileMenu } from '@/components/ui/MobileMenuContext';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

type NavItem = { label: string; href: string; icon: typeof LayoutDashboard };
type NavSection = { label: string; items: NavItem[] };

const sections: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
      { label: 'Self Service', href: '/self-service', icon: UserCircle },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'Employees', href: '/employees', icon: Users },
      { label: 'Directory', href: '/directory', icon: Search },
      { label: 'Departments', href: '/departments', icon: Building2 },
      { label: 'Positions', href: '/positions', icon: Briefcase },
      { label: 'Org Chart', href: '/org-chart', icon: GitBranch },
    ],
  },
  {
    label: 'Time & Attendance',
    items: [
      { label: 'Attendance', href: '/attendance', icon: Clock },
      { label: 'Calendar', href: '/calendar', icon: Calendar },
      { label: 'Leave', href: '/leave', icon: CalendarDays },
    ],
  },
  {
    label: 'Compensation',
    items: [
      { label: 'Payroll', href: '/payroll', icon: Wallet },
      { label: 'Expenses', href: '/expenses', icon: Receipt },
    ],
  },
  {
    label: 'Talent',
    items: [
      { label: 'Recruitment', href: '/recruitment', icon: Briefcase },
      { label: 'Onboarding', href: '/onboarding', icon: UserPlus },
      { label: 'Documents', href: '/documents', icon: FileText },
      { label: 'Offboarding', href: '/offboarding', icon: UserMinus },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Reports', href: '/reports', icon: BarChart3 },
      { label: 'Audit Log', href: '/audit-log', icon: ClipboardList },
    ],
  },
  {
    label: 'Configuration',
    items: [{ label: 'Settings', href: '/settings', icon: Settings }],
  },
];

function Brand({ onClose }: { onClose?: () => void }) {
  return (
    <div className="px-5 py-5 border-b border-hairline flex items-center justify-between">
      <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
          <span className="text-white text-sm font-bold tracking-tight">H</span>
        </div>
        <div>
          <span className="text-lg font-bold text-ink tracking-tight">HRIS</span>
          <span className="block text-[10px] text-muted font-medium -mt-0.5">Human Resources</span>
        </div>
      </Link>
      {onClose && (
        <button onClick={onClose} aria-label="Close navigation" className="lg:hidden min-h-10 min-w-10 rounded-lg hover:bg-primary-surface flex items-center justify-center">
          <X size={18} className="text-muted" />
        </button>
      )}
    </div>
  );
}

function Navigation({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Main navigation">
      {sections.map((section) => (
        <div key={section.label} className="mb-3 last:mb-0">
          <h2 className="px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-soft">{section.label}</h2>
          <div className="space-y-0.5">
            {section.items.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 min-h-10',
                    active ? 'bg-primary-surface text-primary font-semibold' : 'text-body hover:bg-primary-surface/50 hover:text-ink',
                  )}
                >
                  <Icon size={17} strokeWidth={active ? 2 : 1.5} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function LogoutButton({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="px-3 py-4 border-t border-hairline">
      <button onClick={onLogout} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-body hover:text-semantic-down hover:bg-red-50 rounded-lg transition-colors w-full min-h-11">
        <LogOut size={18} strokeWidth={1.5} />
        Logout
      </button>
    </div>
  );
}

export default function Sidebar() {
  const { open, close } = useMobileMenu();
  const [showLogout, setShowLogout] = useState(false);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [close]);

  const handleLogout = () => {
    setShowLogout(false);
    window.location.href = '/login';
  };

  return (
    <>
      <aside className="hidden lg:flex w-64 h-screen bg-canvas border-r border-hairline flex-col fixed left-0 top-0 z-30">
        <Brand />
        <Navigation />
        <LogoutButton onLogout={() => setShowLogout(true)} />
      </aside>

      <div className={cn('lg:hidden fixed inset-0 z-50 transition-opacity duration-200', open ? 'visible opacity-100' : 'invisible opacity-0 pointer-events-none')}>
        <button onClick={close} aria-label="Close navigation overlay" className="absolute inset-0 bg-ink/40" />
        <aside className={cn('relative flex w-72 max-w-[85vw] h-full bg-canvas shadow-2xl flex-col transition-transform duration-200', open ? 'translate-x-0' : '-translate-x-full')}>
          <Brand onClose={close} />
          <Navigation onClose={close} />
          <LogoutButton onLogout={() => { close(); setShowLogout(true); }} />
        </aside>
      </div>

      {showLogout && (
        <ConfirmDialog
          open
          title="Logout?"
          description="Are you sure you want to log out from your HRIS account?"
          confirmLabel="Yes, logout"
          variant="danger"
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </>
  );
}
