import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'Nothing to show', description = 'Try changing your filters or search terms.' }: { title?: string; description?: string }) {
  return (
    <div className="py-16 px-6 text-center" role="status">
      <div className="mx-auto w-12 h-12 rounded-full bg-surface-strong flex items-center justify-center mb-4"><Inbox size={22} className="text-muted" /></div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="text-xs text-muted mt-1">{description}</p>
    </div>
  );
}
