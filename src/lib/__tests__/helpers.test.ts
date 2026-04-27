import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateDeadline, mergeNotes } from '../helpers';
import { PRIORITY } from '../constants';

describe('calculateDeadline', () => {
  const NOW = new Date('2025-06-01T10:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sets 4-hour deadline for HIGH priority', () => {
    const deadline = calculateDeadline(PRIORITY.HIGH);
    expect(deadline).toBeDefined();
    const expected = new Date('2025-06-01T14:00:00.000Z');
    expect(deadline?.getTime()).toBe(expected.getTime());
  });

  it('sets 1-day deadline for MEDIUM priority', () => {
    const deadline = calculateDeadline(PRIORITY.MEDIUM);
    expect(deadline).toBeDefined();
    const expected = new Date('2025-06-02T10:00:00.000Z');
    expect(deadline?.getTime()).toBe(expected.getTime());
  });

  it('sets 3-day deadline for NORMAL priority', () => {
    const deadline = calculateDeadline(PRIORITY.NORMAL);
    expect(deadline).toBeDefined();
    const expected = new Date('2025-06-04T10:00:00.000Z');
    expect(deadline?.getTime()).toBe(expected.getTime());
  });

  it('sets 4-day deadline for LOW priority', () => {
    const deadline = calculateDeadline(PRIORITY.LOW);
    expect(deadline).toBeDefined();
    const expected = new Date('2025-06-05T10:00:00.000Z');
    expect(deadline?.getTime()).toBe(expected.getTime());
  });

  it('returns undefined for unknown priority', () => {
    const deadline = calculateDeadline(99);
    expect(deadline).toBeUndefined();
  });
});
