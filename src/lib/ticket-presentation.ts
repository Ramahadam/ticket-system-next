import { CLASSIFICATION_LABELS, PRIORITY } from './constants';

export type Presentation = {
  label: string;
  className: string;
};

export type PriorityPresentation = Presentation & {
  short: string;
};

export type ClassificationPresentation = {
  label: string;
  compactLabel: string;
};

export type SlaPresentation = Presentation & {
  icon: boolean;
};

const priorityMeta = {
  [PRIORITY.HIGH]: {
    label: 'P1 · Critical',
    short: 'P1',
    className: 'bg-[color:var(--relay-p1-soft)] text-[color:var(--relay-p1)]',
  },
  [PRIORITY.MEDIUM]: {
    label: 'P2 · High',
    short: 'P2',
    className: 'bg-[color:var(--relay-p2-soft)] text-[color:var(--relay-p2)]',
  },
  [PRIORITY.NORMAL]: {
    label: 'P3 · Normal',
    short: 'P3',
    className: 'bg-[color:var(--relay-p3-soft)] text-[color:var(--relay-p3)]',
  },
  [PRIORITY.LOW]: {
    label: 'P4 · Low',
    short: 'P4',
    className: 'bg-[color:var(--relay-p4-soft)] text-[color:var(--relay-p4)]',
  },
} as const;

const statusMeta: Record<string, Presentation> = {
  loged: {
    label: 'New',
    className: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
  },
  logged: {
    label: 'New',
    className: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
  },
  requested: {
    label: 'Requested',
    className: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
  },
  progress: {
    label: 'In progress',
    className: 'bg-[color:var(--relay-accent-soft)] text-[color:var(--relay-accent-text)]',
  },
  approved: {
    label: 'Approved',
    className: 'bg-[color:var(--relay-accent-soft)] text-[color:var(--relay-accent-text)]',
  },
  hold: {
    label: 'On hold',
    className: 'bg-[color:var(--relay-warn-soft)] text-[color:var(--relay-warn)]',
  },
  'pending approval': {
    label: 'Pending review',
    className: 'bg-[color:var(--relay-warn-soft)] text-[color:var(--relay-warn)]',
  },
  pending_approval: {
    label: 'Pending review',
    className: 'bg-[color:var(--relay-warn-soft)] text-[color:var(--relay-warn)]',
  },
  fulfilled: {
    label: 'Resolved',
    className: 'bg-[color:var(--relay-good-soft)] text-[color:var(--relay-good)]',
  },
  implemented: {
    label: 'Implemented',
    className: 'bg-[color:var(--relay-good-soft)] text-[color:var(--relay-good)]',
  },
  canceled: {
    label: 'Cancelled',
    className: 'bg-[color:var(--relay-p4-soft)] text-[color:var(--relay-text-muted)]',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-[color:var(--relay-p4-soft)] text-[color:var(--relay-text-muted)]',
  },
};

const closedStatuses = ['fulfilled', 'implemented', 'canceled', 'cancelled'];

export function getPriorityPresentation(
  priority: number | string | null | undefined,
): PriorityPresentation {
  const key = Number(priority) as keyof typeof priorityMeta;
  return priorityMeta[key] ?? priorityMeta[PRIORITY.LOW];
}

export function getClassificationPresentation(
  classification: number | string | null | undefined,
): ClassificationPresentation {
  const value = Number(classification);
  const label = CLASSIFICATION_LABELS[value] ?? String(classification ?? 'Unknown');

  return {
    label,
    compactLabel: `C${value || '-'}`,
  };
}

export function getStatusPresentation(status: string | null | undefined): Presentation {
  const key = String(status ?? '').toLowerCase();

  return (
    statusMeta[key] ?? {
      label: status ? String(status) : 'Unknown',
      className: 'bg-secondary text-secondary-foreground',
    }
  );
}

function formatSlaDistance(ms: number) {
  const minutes = Math.max(0, Math.round(Math.abs(ms) / 60000));
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours < 24) return remainder ? `${hours}h ${remainder}m` : `${hours}h`;

  const days = Math.floor(hours / 24);
  const dayHours = hours % 24;
  return dayHours ? `${days}d ${dayHours}h` : `${days}d`;
}

export function getSlaPresentation(
  deadline?: Date | string | null,
  status?: string | null,
  now = new Date(),
): SlaPresentation {
  if (status && closedStatuses.includes(status)) {
    return {
      label: 'Closed',
      className: 'text-muted-foreground',
      icon: false,
    };
  }

  if (!deadline) {
    return {
      label: 'No SLA',
      className: 'text-muted-foreground',
      icon: false,
    };
  }

  const due = typeof deadline === 'string' ? new Date(deadline) : deadline;
  const ms = due.getTime() - now.getTime();
  const minutes = ms / 60000;

  if (ms < 0) {
    return {
      label: `Breached · ${formatSlaDistance(ms)}`,
      className: 'bg-[color:var(--relay-bad-soft)] text-[color:var(--relay-bad)]',
      icon: true,
    };
  }

  if (minutes < 60) {
    return {
      label: `Due in ${formatSlaDistance(ms)}`,
      className: 'bg-[color:var(--relay-bad-soft)] text-[color:var(--relay-bad)]',
      icon: true,
    };
  }

  if (minutes < 240) {
    return {
      label: `Due in ${formatSlaDistance(ms)}`,
      className: 'bg-[color:var(--relay-warn-soft)] text-[color:var(--relay-warn)]',
      icon: true,
    };
  }

  return {
    label: `Due in ${formatSlaDistance(ms)}`,
    className: 'bg-transparent text-muted-foreground',
    icon: true,
  };
}
