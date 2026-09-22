import type { LucideIcon } from 'lucide-react';

export default function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'primary',
}: {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  tone?: 'primary' | 'green' | 'amber' | 'red';
}) {
  const tones = {
    primary: 'bg-primary-surface text-primary',
    green: 'bg-cta-surface text-cta',
    amber: 'bg-amber-50 text-accent-yellow',
    red: 'bg-red-50 text-semantic-down',
  };

  return (
    <div className="card card-hover cursor-default">
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon size={18} />
      </div>
      <p className="font-mono text-2xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
      {detail && <p className="mt-3 text-xs font-semibold text-body">{detail}</p>}
    </div>
  );
}
