import { cn } from '@/lib/utils';

interface StatusPillProps {
  status: string;
  className?: string;
}

type Tone = 'violet' | 'indigo' | 'amber' | 'emerald' | 'slate';

const config: Record<string, { label: string; tone: Tone }> = {
  // TicketStatus
  loged:            { label: 'New',          tone: 'violet'  },
  progress:         { label: 'In progress',  tone: 'indigo'  },
  hold:             { label: 'On hold',       tone: 'amber'   },
  fulfilled:        { label: 'Resolved',      tone: 'emerald' },
  canceled:         { label: 'Cancelled',     tone: 'slate'   },
  // ChangeStatus
  requested:        { label: 'Requested',     tone: 'violet'  },
  'pending approval': { label: 'Pending review', tone: 'amber' },
  pending_approval: { label: 'Pending review', tone: 'amber'  },
  approved:         { label: 'Approved',      tone: 'indigo'  },
  implemented:      { label: 'Implemented',   tone: 'emerald' },
  cancelled:        { label: 'Cancelled',     tone: 'slate'   },
};

const toneClasses: Record<Tone, string> = {
  violet:  'bg-violet-100  text-violet-700  dark:bg-violet-900/30  dark:text-violet-400',
  indigo:  'bg-indigo-100  text-indigo-700  dark:bg-indigo-900/30  dark:text-indigo-400',
  amber:   'bg-amber-100   text-amber-700   dark:bg-amber-900/30   dark:text-amber-400',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  slate:   'bg-slate-100   text-slate-600   dark:bg-slate-800      dark:text-slate-400',
};

export function StatusPill({ status, className }: StatusPillProps) {
  const entry = config[status];
  const label = entry?.label ?? status;
  const tone = entry?.tone ?? 'slate';

  return (
    <span
      className={cn(
        'inline-flex h-5 items-center rounded-full px-2 text-xs font-medium whitespace-nowrap',
        toneClasses[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
