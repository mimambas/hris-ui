'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, Bell, Menu, X, ArrowUpRight, Users, Wallet, CalendarDays, FileText, Settings, Clock, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useMobileMenu } from '@/components/ui/MobileMenuContext';
import { useNotifications } from '@/components/ui/NotificationContext';
import { useAuthStore } from '@/lib/auth';

type SearchItem = { label: string; description: string; href: string; icon: typeof Users; keywords: string };

const searchItems: SearchItem[] = [
  { label: 'Employees', description: 'Manage employee directory and profiles', href: '/employees', icon: Users, keywords: 'people staff team roster directory' },
  { label: 'Add employee', description: 'Create a new employee record', href: '/employees/new', icon: Users, keywords: 'new employee hire onboarding' },
  { label: 'Payroll', description: 'Process and review monthly payroll', href: '/payroll', icon: Wallet, keywords: 'salary payslip compensation payment' },
  { label: 'Leave management', description: 'Review requests and balances', href: '/leave', icon: CalendarDays, keywords: 'vacation time off holiday absence' },
  { label: 'Reports', description: 'Generate insights and analytics', href: '/reports', icon: FileText, keywords: 'analytics export headcount attendance' },
  { label: 'Attendance', description: 'Track presence and working hours', href: '/attendance', icon: Clock, keywords: 'present check in late absence' },
  { label: 'Settings', description: 'Configure organization preferences', href: '/settings', icon: Settings, keywords: 'configuration preferences profile' },
];

function CommandPalette({ open, query, onQueryChange, onClose }: { open: boolean; query: string; onQueryChange: (value: string) => void; onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return searchItems;
    return searchItems.filter((item) => `${item.label} ${item.description} ${item.keywords}`.toLowerCase().includes(normalized));
  }, [query]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center p-4 sm:pt-[12vh]" role="dialog" aria-modal="true" aria-label="Global search">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-canvas border border-hairline shadow-2xl">
        <div className="flex items-center gap-3 px-4 border-b border-hairline-soft">
          <Search size={18} className="text-muted shrink-0" />
          <input ref={inputRef} value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder="Search modules, employees, reports…" className="w-full min-h-14 bg-transparent text-sm text-ink outline-none placeholder:text-muted-soft" />
          <button onClick={onClose} aria-label="Close search" className="min-h-9 min-w-9 rounded-lg hover:bg-surface-strong flex items-center justify-center"><X size={15} className="text-muted" /></button>
        </div>
        <div className="max-h-[55vh] overflow-y-auto p-2">
          {results.length === 0 ? <div className="px-4 py-10 text-center"><Search size={20} className="mx-auto text-muted-soft mb-2" /><p className="text-sm font-semibold text-ink">No results found</p><p className="text-xs text-muted mt-1">Try a different search term.</p></div> : results.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-primary-surface transition-colors group"><div className="w-9 h-9 rounded-lg bg-surface-strong group-hover:bg-canvas flex items-center justify-center shrink-0"><Icon size={16} className="text-primary" /></div><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-ink">{item.label}</p><p className="text-xs text-muted truncate">{item.description}</p></div><ArrowUpRight size={14} className="text-muted-soft group-hover:text-primary" /></Link>; })}
        </div>
        <div className="px-4 py-2.5 border-t border-hairline-soft flex items-center gap-4 text-[11px] text-muted"><span><kbd className="px-1.5 py-0.5 rounded bg-surface-strong font-mono">Esc</kbd> close</span><span>Search across HRIS modules</span></div>
      </div>
    </div>
  );
}

export default function Topbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const openSearch = () => setSearchOpen(true);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(); } };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  const closeSearch = () => { setSearchOpen(false); setQuery(''); };
  const { theme, toggleTheme } = useTheme();
  const { toggle: toggleMobile } = useMobileMenu();
  const { unreadCount } = useNotifications();
  const user = useAuthStore((state) => state.user);
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'User';
  const displayRole = user?.role ? user.role.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'User';
  const initials = displayName.split(/\s+/).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header className="h-16 bg-canvas/95 backdrop-blur-sm border-b border-hairline flex items-center justify-between px-5 lg:px-8 sticky top-0 z-20">
      <div className="flex items-center gap-3 w-full max-w-md">
        <button onClick={toggleMobile} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-primary-surface transition-colors" aria-label="Open navigation"><Menu size={20} className="text-body" /></button>
        <button onClick={openSearch} className="relative w-full max-w-sm text-left min-h-11 rounded-pill bg-surface-strong pl-10 pr-4 py-2.5 text-sm text-muted-soft hover:ring-2 hover:ring-primary/20 transition-colors"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-soft" /><span>Search employees, reports…</span><kbd className="hidden sm:inline absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-canvas text-[10px] font-mono text-muted">⌘K</kbd></button>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={toggleTheme} className="relative min-h-11 min-w-11 p-2.5 rounded-full hover:bg-primary-surface transition-colors" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark' ? <Sun size={18} className="text-body" /> : <Moon size={18} className="text-body" />}
        </button>
        <Link href="/notifications" className="relative min-h-11 min-w-11 p-2.5 rounded-full hover:bg-primary-surface transition-colors cursor-pointer flex items-center justify-center" aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}><Bell size={18} className="text-body" />{unreadCount > 0 && <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-canvas">{unreadCount > 99 ? '99+' : unreadCount}</span>}</Link><div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-hairline"><div className="w-9 h-9 rounded-full bg-primary-surface flex items-center justify-center"><span className="text-xs font-bold text-primary">{initials}</span></div><div className="hidden sm:block"><p className="text-sm font-semibold text-ink leading-none">{displayName}</p><p className="text-[11px] text-muted mt-1">{displayRole}</p></div></div></div>
      <CommandPalette open={searchOpen} query={query} onQueryChange={setQuery} onClose={closeSearch} />
    </header>
  );
}
