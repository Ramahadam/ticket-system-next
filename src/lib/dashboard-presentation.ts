export type SlaInput = {
  deadline: Date | string | null;
};

export type SlaSegments = {
  breached: number;
  dueSoon: number;
  onTrack: number;
  compliance: number;
  total: number;
};

export type AttentionInput = {
  id: number;
  summary: string;
  priority: number;
  status: string;
  requester: string;
  owner: string | null;
  deadline: Date | string | null;
};

export type AttentionItem = AttentionInput & {
  reason: 'SLA breached' | 'Due soon' | 'P1 incident' | 'Needs owner' | 'On hold';
  score: number;
};

export type DashboardMetric = {
  label: string;
  value: number;
  href: string;
  delta: string;
  trend: 'up' | 'down' | 'neutral';
  bars: number[];
};

function minutesUntil(deadline: Date | string, now: Date) {
  const due = typeof deadline === 'string' ? new Date(deadline) : deadline;
  return (due.getTime() - now.getTime()) / 60000;
}

export function summarizeSlaSegments(rows: SlaInput[], now = new Date()): SlaSegments {
  const summary = rows.reduce(
    (acc, row) => {
      if (!row.deadline) {
        acc.onTrack += 1;
        return acc;
      }

      const minutes = minutesUntil(row.deadline, now);
      if (minutes < 0) acc.breached += 1;
      else if (minutes < 240) acc.dueSoon += 1;
      else acc.onTrack += 1;

      return acc;
    },
    { breached: 0, dueSoon: 0, onTrack: 0 },
  );

  const total = rows.length;
  const compliance =
    total === 0 ? 100 : Math.max(0, Math.round(((total - summary.breached) / total) * 100));

  return {
    ...summary,
    compliance,
    total,
  };
}

function attentionFor(row: AttentionInput, now: Date): Pick<AttentionItem, 'reason' | 'score'> | null {
  if (row.deadline) {
    const minutes = minutesUntil(row.deadline, now);
    if (minutes < 0) return { reason: 'SLA breached', score: 500 - Math.min(row.priority, 4) };
    if (minutes < 240) return { reason: 'Due soon', score: 400 - Math.min(row.priority, 4) };
  }

  if (row.priority === 1) return { reason: 'P1 incident', score: 300 };
  if (!row.owner && row.priority <= 2) return { reason: 'Needs owner', score: 200 - row.priority };
  if (row.status === 'hold') return { reason: 'On hold', score: 100 - Math.min(row.priority, 4) };

  return null;
}

export function buildAttentionItems(rows: AttentionInput[], now = new Date(), limit = 5): AttentionItem[] {
  return rows
    .map((row) => {
      const attention = attentionFor(row, now);
      return attention ? { ...row, ...attention } : null;
    })
    .filter((item): item is AttentionItem => Boolean(item))
    .sort((a, b) => b.score - a.score || a.priority - b.priority || a.id - b.id)
    .slice(0, limit);
}

export function buildDashboardMetric(
  label: string,
  value: number,
  href: string,
  delta = 'No trend yet',
): DashboardMetric {
  return {
    label,
    value,
    href,
    delta,
    trend: 'neutral',
    bars: [],
  };
}
