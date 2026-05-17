import { describe, expect, it } from 'vitest';

import {
  getClassificationPresentation,
  getPriorityPresentation,
  getSlaPresentation,
  getStatusPresentation,
} from './ticket-presentation';

describe('ticket presentation helpers', () => {
  it('maps numeric priorities to operational P labels', () => {
    expect(getPriorityPresentation(1).label).toBe('P1 · Critical');
    expect(getPriorityPresentation('2').short).toBe('P2');
    expect(getPriorityPresentation(3).label).toBe('P3 · Normal');
    expect(getPriorityPresentation(4).short).toBe('P4');
  });

  it('falls back unknown priorities to P4 low risk styling', () => {
    const presentation = getPriorityPresentation(null);

    expect(presentation.label).toBe('P4 · Low');
    expect(presentation.className).toMatch(/--relay-p4-soft/);
  });

  it('normalizes ticket and change statuses to user-facing labels', () => {
    expect(getStatusPresentation('loged').label).toBe('New');
    expect(getStatusPresentation('pending_approval').label).toBe('Pending review');
    expect(getStatusPresentation('pending approval').label).toBe('Pending review');
    expect(getStatusPresentation('fulfilled').label).toBe('Resolved');
  });

  it('preserves unknown statuses instead of hiding them', () => {
    const presentation = getStatusPresentation('waiting_vendor');

    expect(presentation.label).toBe('waiting_vendor');
    expect(presentation.className).toBe('bg-secondary text-secondary-foreground');
  });

  it('formats SLA states from a fixed clock', () => {
    const now = new Date('2026-05-16T08:00:00.000Z');

    expect(
      getSlaPresentation(new Date('2026-05-16T07:15:00.000Z'), 'progress', now),
    ).toEqual({
        label: 'Breached · 45m',
        className: 'bg-[color:var(--relay-bad-soft)] text-[color:var(--relay-bad)]',
        icon: true,
    });
    expect(
      getSlaPresentation(new Date('2026-05-16T08:45:00.000Z'), 'progress', now).label,
    ).toBe('Due in 45m');
    expect(
      getSlaPresentation(new Date('2026-05-16T11:30:00.000Z'), 'progress', now).className,
    ).toMatch(/--relay-warn-soft/);
    expect(
      getSlaPresentation(new Date('2026-05-17T10:00:00.000Z'), 'progress', now).label,
    ).toBe('Due in 1d 2h');
  });

  it('uses terminal SLA labels for closed or missing deadlines', () => {
    expect(getSlaPresentation(null, 'progress')).toEqual({
      label: 'No SLA',
      className: 'text-muted-foreground',
      icon: false,
    });
    expect(getSlaPresentation(new Date(), 'implemented')).toEqual({
      label: 'Closed',
      className: 'text-muted-foreground',
      icon: false,
    });
  });

  it('formats classification labels and compact labels', () => {
    expect(getClassificationPresentation(1).label).toBe('Major');
    expect(getClassificationPresentation('3').compactLabel).toBe('C3');
    expect(getClassificationPresentation(undefined).label).toBe('Unknown');
  });
});
