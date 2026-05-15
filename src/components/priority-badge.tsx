import { cn } from '@/lib/utils';
import { PRIORITY } from '@/lib/constants';

interface PriorityBadgeProps {
  priority: number;
  className?: string;
}

const config: Record<number, { label: string; style: React.CSSProperties }> = {
  [PRIORITY.HIGH]: {
    label: 'P1 · Critical',
    style: { color: 'var(--relay-p1)', backgroundColor: 'var(--relay-p1-soft)' },
  },
  [PRIORITY.MEDIUM]: {
    label: 'P2 · High',
    style: { color: 'var(--relay-p2)', backgroundColor: 'var(--relay-p2-soft)' },
  },
  [PRIORITY.NORMAL]: {
    label: 'P3 · Normal',
    style: { color: 'var(--relay-p3)', backgroundColor: 'var(--relay-p3-soft)' },
  },
  [PRIORITY.LOW]: {
    label: 'P4 · Low',
    style: { color: 'var(--relay-p4)', backgroundColor: 'var(--relay-p4-soft)' },
  },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const entry = config[priority];
  if (!entry) return <span className={cn('text-muted-foreground text-xs', className)}>{priority}</span>;

  return (
    <span
      style={entry.style}
      className={cn(
        'inline-flex h-5 items-center rounded-full px-2 text-xs font-medium whitespace-nowrap',
        className,
      )}
    >
      {entry.label}
    </span>
  );
}
