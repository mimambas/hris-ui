'use client';

import { useState, useMemo } from 'react';
import {
  Bell, CheckCircle2, Clock, AlertTriangle, FileText, MessageCircle, Users, MoreHorizontal,
  Search, CheckCheck, X, Trash2, Eye, Settings,
} from 'lucide-react';
import ModuleHeader from '@/components/ui/ModuleHeader';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';

type Notification = {
  id: string;
  icon: typeof Bell;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  color: string;
  category: 'leave' | 'payroll' | 'alert' | 'onboarding' | 'expense' | 'document' | 'system' | 'review';
  group: 'today' | 'yesterday' | 'older';
};

const initialNotifications: Notification[] = [
  { id: '1', icon: FileText, title: 'Leave request submitted', desc: 'Budi Hartono applied for 3 days of annual leave (22-24 Sep)', time: '5 minutes ago', unread: true, color: 'bg-primary-surface text-primary', category: 'leave', group: 'today' },
  { id: '2', icon: CheckCircle2, title: 'Payroll approved', desc: 'September 2026 payroll has been processed for 478 employees', time: '1 hour ago', unread: true, color: 'bg-cta-surface text-cta-hover', category: 'payroll', group: 'today' },
  { id: '3', icon: AlertTriangle, title: 'Contract expiring soon', desc: "Andi Pratama's employment contract expires on 20 Sep 2026", time: '3 hours ago', unread: true, color: 'bg-amber-50 text-accent-yellow', category: 'alert', group: 'today' },
  { id: '4', icon: Users, title: 'New employee onboarding', desc: 'Nadia Putri started onboarding for Product Designer role', time: 'Yesterday', unread: false, color: 'bg-violet-50 text-violet-600', category: 'onboarding', group: 'yesterday' },
  { id: '5', icon: CheckCircle2, title: 'Expense claim approved', desc: "Maya Anggraeni's travel claim of Rp 1,875,000 has been approved", time: 'Yesterday', unread: false, color: 'bg-cta-surface text-cta-hover', category: 'expense', group: 'yesterday' },
  { id: '6', icon: FileText, title: 'Document uploaded', desc: 'BPJS Certificate for Dewi Lestari has been uploaded', time: '2 days ago', unread: false, color: 'bg-sky-50 text-sky-600', category: 'document', group: 'older' },
  { id: '7', icon: Bell, title: 'System maintenance', desc: 'Scheduled maintenance on Saturday, 27 Sep 2026 from 22:00 to 02:00 WIB', time: '3 days ago', unread: false, color: 'bg-surface-strong text-muted', category: 'system', group: 'older' },
  { id: '8', icon: MessageCircle, title: 'Probation review reminder', desc: "Larasati Hadi's 3-month probation review is due on 25 Sep 2026", time: '3 days ago', unread: false, color: 'bg-amber-50 text-accent-yellow', category: 'review', group: 'older' },
];

const categoryLabels: Record<string, string> = { leave: 'Leave', payroll: 'Payroll', alert: 'Alerts', onboarding: 'Onboarding', expense: 'Expenses', document: 'Documents', system: 'System', review: 'Reviews' };

const groupLabels: Record<string, string> = { today: 'Today', yesterday: 'Yesterday', older: 'Earlier' };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const { toast } = useToast();

  const filtered = useMemo(() => notifications.filter((n) => {
    const matchFilter = filter === 'all' || n.unread;
    const matchCat = categoryFilter === 'all' || n.category === categoryFilter;
    const matchSearch = search === '' || n.title.toLowerCase().includes(search.toLowerCase()) || n.desc.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchCat && matchSearch;
  }), [notifications, filter, categoryFilter, search]);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const grouped = useMemo(() => {
    const groups: Record<string, Notification[]> = { today: [], yesterday: [], older: [] };
    filtered.forEach((n) => groups[n.group]?.push(n));
    return groups;
  }, [filtered]);

  const markRead = (id: string) => setNotifications((rows) => rows.map((n) => n.id === id ? { ...n, unread: false } : n));
  const markAllRead = () => { setNotifications((rows) => rows.map((n) => ({ ...n, unread: false }))); toast('All notifications marked as read.', 'success'); };
  const markReadGroup = (group: string) => { setNotifications((rows) => rows.map((n) => n.group === group ? { ...n, unread: false } : n)); toast(`${groupLabels[group]} notifications marked as read.`, 'success'); };
  const deleteNotification = (id: string) => { setNotifications((rows) => rows.filter((n) => n.id !== id)); if (selected === id) setSelected(null); toast('Notification removed.', 'success'); };
  const selectedNotif = notifications.find((n) => n.id === selected);

  return <div>
    <ModuleHeader eyebrow="Stay informed" title="Notifications" description="Catch up on everything that's happening across your organization" action={<div className="flex gap-2"><button onClick={markAllRead} disabled={unreadCount === 0} className="btn-secondary gap-2 text-xs disabled:opacity-50"><CheckCheck size={14} /> Mark all as read</button></div>} />

    <div className="flex flex-wrap items-center gap-2 mb-6">
      <button onClick={() => setFilter('all')} className={`min-h-10 px-4 rounded-pill text-xs font-semibold transition-colors ${filter === 'all' ? 'bg-primary text-white' : 'bg-surface-strong text-muted hover:text-ink'}`}>All</button>
      <button onClick={() => setFilter('unread')} className={`min-h-10 px-4 rounded-pill text-xs font-semibold transition-colors ${filter === 'unread' ? 'bg-primary text-white' : 'bg-surface-strong text-muted hover:text-ink'}`}>
        Unread {unreadCount > 0 && <span className="ml-1.5 bg-primary-light text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
      </button>
      <div className="relative ml-2">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-soft" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search notifications" placeholder="Search notifications…" className="w-52 min-h-10 rounded-pill bg-surface-strong pl-8 pr-3 py-2 text-xs text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
      {/* Notification list */}
      <div className="lg:col-span-3 card p-0 overflow-hidden">
        {Object.entries(grouped).map(([group, items]) => {
          if (items.length === 0) return null;
          return (
            <div key={group}>
              <div className="px-5 py-2.5 border-b border-hairline-soft bg-surface-soft flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-muted uppercase tracking-wider">{groupLabels[group]}</h3>
                {items.some((n) => n.unread) && (
                  <button onClick={() => markReadGroup(group)} className="text-[11px] font-semibold text-primary hover:text-primary-hover">Mark group read</button>
                )}
              </div>
              {items.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div key={notification.id} onClick={() => { setSelected(notification.id); markRead(notification.id); }} className={`px-5 py-4 border-b border-hairline-soft last:border-0 flex items-start gap-4 hover:bg-primary-surface/20 transition-colors cursor-pointer ${notification.unread ? 'bg-indigo-50/30' : ''} ${selected === notification.id ? 'bg-primary-surface/30 ring-1 ring-primary/20' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notification.color}`}><Icon size={16} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-ink">{notification.title}</p>
                        {notification.unread && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-body mt-1 line-clamp-2">{notification.desc}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <p className="text-[11px] text-muted">{notification.time}</p>
                        <span className="text-[10px] text-muted-soft">·</span>
                        <span className="text-[10px] text-muted font-semibold">{categoryLabels[notification.category]}</span>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }} className="min-h-9 min-w-9 rounded-md hover:bg-red-50 shrink-0 flex items-center justify-center transition-colors" aria-label={`Delete notification: ${notification.title}`}>
                      <Trash2 size={14} className="text-muted-soft hover:text-semantic-down" />
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <EmptyState title="No notifications" description={filter === 'unread' ? 'All caught up! No unread notifications.' : 'No notifications match your filters.'} />
        )}
      </div>

      {/* Sidebar: category counts + detail */}
      <div className="space-y-5">
        {selectedNotif ? (
          <div className="card">
            <div className="flex items-center justify-between mb-4"><h3 className="text-xs font-bold text-ink uppercase tracking-wider">Detail</h3><button onClick={() => setSelected(null)} aria-label="Close detail" className="min-h-8 min-w-8 rounded-md hover:bg-surface-strong flex items-center justify-center"><X size={13} className="text-muted" /></button></div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${selectedNotif.color}`}><selectedNotif.icon size={20} /></div>
            <h4 className="text-sm font-bold text-ink text-center">{selectedNotif.title}</h4>
            <p className="text-xs text-body mt-2">{selectedNotif.desc}</p>
            <div className="mt-4 pt-3 border-t border-hairline-soft space-y-2">
              <div className="flex justify-between text-xs"><span className="text-muted">Time</span><span className="text-ink">{selectedNotif.time}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted">Category</span><span className="text-ink">{categoryLabels[selectedNotif.category]}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted">Status</span><span className={`font-semibold ${selectedNotif.unread ? 'text-primary' : 'text-muted'}`}>{selectedNotif.unread ? 'Unread' : 'Read'}</span></div>
            </div>
          </div>
        ) : (
          <div className="card">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-4">By category</h3>
            <div className="space-y-2">
              {Object.entries(categoryLabels).map(([key, label]) => {
                const count = notifications.filter((n) => n.category === key).length;
                const unreadCt = notifications.filter((n) => n.category === key && n.unread).length;
                return (
                  <button key={key} onClick={() => setCategoryFilter(categoryFilter === key ? 'all' : key)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-colors ${categoryFilter === key ? 'bg-primary-surface text-primary' : 'text-body hover:bg-surface-soft'}`}>
                    <span className="font-semibold">{label}</span>
                    <span className="flex items-center gap-2">
                      {unreadCt > 0 && <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">{unreadCt}</span>}
                      <span className="text-muted">{count}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="card">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-3">Quick stats</h3>
          <div className="space-y-3">
            {[{ label: 'Total notifications', value: String(notifications.length), color: 'text-ink' }, { label: 'Unread', value: String(unreadCount), color: 'text-primary' }, { label: 'Categories', value: '8', color: 'text-muted' }].map((item) => <div key={item.label} className="flex justify-between text-xs"><span className="text-muted">{item.label}</span><span className={`font-mono font-semibold ${item.color}`}>{item.value}</span></div>)}
          </div>
        </div>
      </div>
    </div>
  </div>;
}
