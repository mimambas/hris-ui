import type { ReactNode } from 'react';
import { SlidersHorizontal, Download } from 'lucide-react';

export default function Toolbar({
  children,
  rightSlot,
}: {
  children: ReactNode;
  rightSlot?: ReactNode;
}) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-hairline-soft flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-1">
          {children}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {rightSlot ?? (
            <>
              <button className="btn-secondary gap-1.5 text-xs py-2 px-3 min-h-10"><SlidersHorizontal size={13} /> Filter</button>
              <button className="btn-secondary gap-1.5 text-xs py-2 px-3 min-h-10"><Download size={13} /> Export</button>
            </>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
