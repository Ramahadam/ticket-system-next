import { describe, expect, it } from 'vitest';
import { getSlaStatus, getTimeLabel } from './sla';

const NOW = new Date('2026-05-15T12:00:00Z');
const h = (n: number) => new Date(NOW.getTime() + n * 60 * 60 * 1000);
const s = (n: number) => new Date(NOW.getTime() + n * 1000);

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

  it('returns breached at exactly the deadline moment', () => {
    expect(getSlaStatus(NOW, 1, NOW)).toBe('breached');
  });

  // HIGH (priority 1) — 4h window, at_risk < 1h
  it('returns at_risk when < 25% of High window remains (0.5h of 4h = 12.5%)', () => {
    expect(getSlaStatus(h(0.5), 1, NOW)).toBe('at_risk');
  });

  it('returns on_track at exactly the 25% boundary of High (1h of 4h = 25%)', () => {
    expect(getSlaStatus(h(1), 1, NOW)).toBe('on_track');
  });

  it('returns on_track when well within High window', () => {
    expect(getSlaStatus(h(3), 1, NOW)).toBe('on_track');
  });

  // MEDIUM (priority 2) — 24h window, at_risk < 6h
  it('returns at_risk when < 25% of Medium window remains (5h of 24h ≈ 20%)', () => {
    expect(getSlaStatus(h(5), 2, NOW)).toBe('at_risk');
  });

  it('returns on_track at exactly the 25% boundary of Medium (6h of 24h = 25%)', () => {
    expect(getSlaStatus(h(6), 2, NOW)).toBe('on_track');
  });

  it('returns on_track when well within Medium window', () => {
    expect(getSlaStatus(h(20), 2, NOW)).toBe('on_track');
  });

  // NORMAL (priority 3) — 72h window, at_risk < 18h
  it('returns at_risk when < 25% of Normal window remains (17h of 72h ≈ 23.6%)', () => {
    expect(getSlaStatus(h(17), 3, NOW)).toBe('at_risk');
  });

  it('returns on_track at exactly the 25% boundary of Normal (18h of 72h = 25%)', () => {
    expect(getSlaStatus(h(18), 3, NOW)).toBe('on_track');
  });

  // LOW (priority 4) — 96h window, at_risk < 24h
  it('returns at_risk when < 25% of Low window remains (23h of 96h ≈ 24%)', () => {
    expect(getSlaStatus(h(23), 4, NOW)).toBe('at_risk');
  });

  it('returns on_track at exactly the 25% boundary of Low (24h of 96h = 25%)', () => {
    expect(getSlaStatus(h(24), 4, NOW)).toBe('on_track');
  });

  it('returns on_track for unknown priority (no window defined, threshold skipped)', () => {
    expect(getSlaStatus(h(1), 99, NOW)).toBe('on_track');
  });
});

describe('getTimeLabel', () => {
  it('returns empty string for null deadline', () => {
    expect(getTimeLabel(null, NOW)).toBe('');
  });

  it('returns 0m overdue when deadline equals now', () => {
    expect(getTimeLabel(NOW, NOW)).toBe('0m overdue');
  });

  it('returns 0m overdue when deadline was 30s ago (sub-minute overdue)', () => {
    expect(getTimeLabel(s(-30), NOW)).toBe('0m overdue');
  });

  it('shows minutes when under 1h remaining', () => {
    expect(getTimeLabel(h(0.5), NOW)).toBe('30m left');
  });

  it('shows hours and minutes', () => {
    expect(getTimeLabel(h(2.5), NOW)).toBe('2h 30m left');
  });

  it('shows days only when remainder is zero hours', () => {
    expect(getTimeLabel(h(48), NOW)).toBe('2d left');
  });

  it('shows days and residual hours', () => {
    expect(getTimeLabel(h(25), NOW)).toBe('1d 1h left');
  });

  it('shows overdue when past deadline (hours)', () => {
    expect(getTimeLabel(h(-2), NOW)).toBe('2h 0m overdue');
  });

  it('shows days overdue with no residual hours', () => {
    expect(getTimeLabel(h(-48), NOW)).toBe('2d overdue');
  });

  it('shows days and residual hours overdue', () => {
    expect(getTimeLabel(h(-25), NOW)).toBe('1d 1h overdue');
  });
});
