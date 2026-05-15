// SLA windows match calculateDeadline() in helpers.ts
const WINDOW_MS: Record<number, number> = {
  1: 4 * 60 * 60 * 1000,       // High: 4h
  2: 24 * 60 * 60 * 1000,      // Medium: 1d
  3: 3 * 24 * 60 * 60 * 1000,  // Normal: 3d
  4: 4 * 24 * 60 * 60 * 1000,  // Low: 4d
};

export type SlaStatus = 'none' | 'on_track' | 'at_risk' | 'breached';

export function getSlaStatus(
  deadline: Date | null | undefined,
  priority: number,
  now = new Date(),
): SlaStatus {
  if (!deadline) return 'none';
  const remaining = deadline.getTime() - now.getTime();
  if (remaining <= 0) return 'breached';
  const window = WINDOW_MS[priority];
  if (window && remaining / window <= 0.25) return 'at_risk';
  return 'on_track';
}

export function getTimeLabel(deadline: Date | null | undefined, now = new Date()): string {
  if (!deadline) return '';
  const diff = deadline.getTime() - now.getTime();
  const abs = Math.abs(diff);
  const h = Math.floor(abs / (60 * 60 * 1000));
  const m = Math.floor((abs % (60 * 60 * 1000)) / (60 * 1000));

  if (h >= 24) {
    const d = Math.floor(h / 24);
    return diff < 0 ? `${d}d overdue` : `${d}d left`;
  }
  if (h > 0) return diff < 0 ? `${h}h ${m}m overdue` : `${h}h ${m}m left`;
  return diff < 0 ? `${m}m overdue` : `${m}m left`;
}
