import { PRIORITY } from './constants';

// Windows must stay in sync with calculateDeadline() in helpers.ts
const WINDOW_MS: Record<number, number> = {
  [PRIORITY.HIGH]:   4  * 60 * 60 * 1000,      // 4h
  [PRIORITY.MEDIUM]: 24 * 60 * 60 * 1000,       // 1d
  [PRIORITY.NORMAL]: 3  * 24 * 60 * 60 * 1000,  // 3d
  [PRIORITY.LOW]:    4  * 24 * 60 * 60 * 1000,  // 4d
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
  // Unknown priority has no defined window so at_risk threshold cannot be computed.
  if (window && remaining / window < 0.25) return 'at_risk';
  return 'on_track';
}

export function getTimeLabel(deadline: Date | null | undefined, now = new Date()): string {
  if (!deadline) return '';
  const diff = deadline.getTime() - now.getTime();
  const abs = Math.abs(diff);
  const totalH = Math.floor(abs / (60 * 60 * 1000));
  const m = Math.floor((abs % (60 * 60 * 1000)) / (60 * 1000));

  if (totalH >= 24) {
    const d = Math.floor(totalH / 24);
    const remH = totalH % 24;
    const suffix = remH ? ` ${remH}h` : '';
    return diff < 0 ? `${d}d${suffix} overdue` : `${d}d${suffix} left`;
  }
  if (totalH > 0) return diff < 0 ? `${totalH}h ${m}m overdue` : `${totalH}h ${m}m left`;
  return diff < 0 ? `${m}m overdue` : `${m}m left`;
}
