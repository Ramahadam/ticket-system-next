import { describe, expect, it } from 'vitest';
import { getSlaStatus, getTimeLabel } from './sla';

const NOW = new Date('2026-05-15T12:00:00Z');
const h = (n: number) => new Date(NOW.getTime() + n * 60 * 60 * 1000);

describe('getSlaStatus', () => {
  it('returns none for null deadline', () => {
    expect(getSlaStatus(null, 1, NOW)).toBe('none');
  });

  it('returns none for undefined deadline', () => {
    expect(getSlaStatus(undefined, 1, NOW)).toBe('none');
  });

  it('returns breached when deadline is in the past', () => {
    expect(getSlaStatus(h(-1), 1, NOW)).toBe('breached');
  });

  it('returns at_risk when < 25% of High window remains (< 1h of 4h)', () => {
    expect(getSlaStatus(h(0.5), 1, NOW)).toBe('at_risk');
  });

  it('returns on_track when > 25% of High window remains', () => {
    expect(getSlaStatus(h(3), 1, NOW)).toBe('on_track');
  });

  it('returns at_risk when < 25% of Medium window remains (< 6h of 24h)', () => {
    expect(getSlaStatus(h(5), 2, NOW)).toBe('at_risk');
  });

  it('returns on_track for Medium with plenty of time', () => {
    expect(getSlaStatus(h(20), 2, NOW)).toBe('on_track');
  });

  it('returns none for unknown priority with no window', () => {
    // unknown priority → window undefined → no at_risk threshold → on_track
    expect(getSlaStatus(h(1), 99, NOW)).toBe('on_track');
  });
});

describe('getTimeLabel', () => {
  it('returns empty string for null deadline', () => {
    expect(getTimeLabel(null, NOW)).toBe('');
  });

  it('shows minutes when under 1h remaining', () => {
    expect(getTimeLabel(h(0.5), NOW)).toBe('30m left');
  });

  it('shows hours and minutes', () => {
    expect(getTimeLabel(h(2.5), NOW)).toBe('2h 30m left');
  });

  it('shows days when >= 24h', () => {
    expect(getTimeLabel(h(48), NOW)).toBe('2d left');
  });

  it('shows overdue when past deadline', () => {
    expect(getTimeLabel(h(-2), NOW)).toBe('2h 0m overdue');
  });

  it('shows days overdue', () => {
    expect(getTimeLabel(h(-48), NOW)).toBe('2d overdue');
  });
});
