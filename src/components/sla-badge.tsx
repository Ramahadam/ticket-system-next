'use client';

import { cn } from '@/lib/utils';
import { getSlaStatus, getTimeLabel } from '@/lib/sla';

interface SlaBadgeProps {
  deadline: Date | null | undefined;
  priority: number;
  className?: string;
}

const styles: Record<string, string> = {
  none: 'bg-muted text-muted-foreground border-transparent',
  on_track: 'bg-green-100 text-green-800 border-transparent dark:bg-green-900/30 dark:text-green-400',
  at_risk: 'bg-yellow-100 text-yellow-800 border-transparent dark:bg-yellow-900/30 dark:text-yellow-400',
  breached: 'bg-destructive/10 text-destructive border-transparent dark:bg-destructive/20',
};

const labels: Record<string, string> = {
  none: 'No SLA',
  on_track: 'On Track',
  at_risk: 'At Risk',
  breached: 'Breached',
};

export function SlaBadge({ deadline, priority, className }: SlaBadgeProps) {
  const status = getSlaStatus(deadline, priority);
  const timeLabel = getTimeLabel(deadline);

  return (
    <span
      className={cn(
        'inline-flex h-5 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        styles[status],
        className,
      )}
    >
      {labels[status]}
      {timeLabel && <span className="opacity-75">· {timeLabel}</span>}
    </span>
  );
}
