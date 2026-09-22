'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Clock, CalendarDays, Wallet, Receipt,
  Briefcase, UserPlus, FileText, BarChart3, Settings, LogOut, Building2, GitBranch, Bell, ClipboardList, Search,
} from 'lucide-react';

const nav = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Employees', href: '/employees', icon: Users },
  { label: 'Directory', href: '/directory', icon: Search },
  { label: 'Departments', href: '/departments', icon: Building2 },
  { label: 'Org Chart', href: '/org-chart', icon: GitBranch },
  { label: 'Attendance', href: '/attendance', icon: Clock },
  { label: 'Leave', href: '/leave', icon: CalendarDays },
  { label: 'Payroll', href: '/payroll', icon: Wallet },
  { label: 'Expenses', href: '/expenses', icon: Receipt },
  { label: 'Recruitment', href: '/recruitment', icon: Briefcase },
  { label: 'Onboarding', href: '/onboarding', icon: UserPlus },
  { label: 'Documents', href: '/documents', icon: FileText },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Audit Log', href: '/audit-log', icon: ClipboardList },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 h-screen bg-canvas border-r border-hairline flex-col fixed left-0 top-0 z-30">
      <div className="px-5 py-5 border-b border-hairline">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold tracking-tight">H</span>
          </div>
          <div>
            <span className="text-lg font-bold text-ink tracking-tight">HRIS</span>
            <span className="block text-[10px] text-muted font-medium -mt-0.5">Human Resources</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200',
                active
                  ? 'bg-primary-surface text-primary font-semibold'
                  : 'text-body hover:bg-primary-surface/50 hover:text-ink'
              )}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-hairline">
        <button className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-body hover:text-semantic-down hover:bg-red-50 rounded-lg transition-colors w-full">
          <LogOut size={18} strokeWidth={1.5} />
          Logout
        </button>
      </div>
    </aside>
  );
}
