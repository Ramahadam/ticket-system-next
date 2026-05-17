import { describe, expect, it } from 'vitest';

import {
  buildAttentionItems,
  buildDashboardMetric,
  summarizeSlaSegments,
} from './dashboard-presentation';

const now = new Date('2026-05-16T08:00:00.000Z');

describe('dashboard presentation helpers', () => {
  it('summarizes SLA into segmented dashboard values', () => {
    const summary = summarizeSlaSegments(
      [
        { deadline: new Date('2026-05-16T07:00:00.000Z') },
        { deadline: new Date('2026-05-16T09:00:00.000Z') },
        { deadline: new Date('2026-05-16T14:00:00.000Z') },
        { deadline: null },
      ],
      now,
    );

    expect(summary).toEqual({
      breached: 1,
      dueSoon: 1,
      onTrack: 2,
      compliance: 75,
      total: 4,
    });
  });

  it('treats an empty SLA set as fully compliant', () => {
    expect(summarizeSlaSegments([], now)).toEqual({
      breached: 0,
      dueSoon: 0,
      onTrack: 0,
      compliance: 100,
      total: 0,
    });
  });

  it('ranks attention items by breach, due soon, P1, missing owner, then hold', () => {
    const items = buildAttentionItems(
      [
        {
          id: 11,
          summary: 'P1 auth outage',
          priority: 1,
          status: 'progress',
          requester: 'jane@example.com',
          owner: 'analyst@example.com',
          deadline: new Date('2026-05-16T18:00:00.000Z'),
        },
        {
          id: 12,
          summary: 'Unowned network incident',
          priority: 2,
          status: 'loged',
          requester: 'owen@example.com',
          owner: null,
          deadline: new Date('2026-05-16T18:00:00.000Z'),
        },
        {
          id: 13,
          summary: 'Past due database issue',
          priority: 3,
          status: 'progress',
          requester: 'maya@example.com',
          owner: 'dba@example.com',
          deadline: new Date('2026-05-16T07:30:00.000Z'),
        },
        {
          id: 14,
          summary: 'Blocked laptop replacement',
          priority: 4,
          status: 'hold',
          requester: 'sam@example.com',
          owner: 'desktop@example.com',
          deadline: null,
        },
        {
          id: 15,
          summary: 'Due soon VPN issue',
          priority: 3,
          status: 'progress',
          requester: 'lina@example.com',
          owner: 'network@example.com',
          deadline: new Date('2026-05-16T09:30:00.000Z'),
        },
      ],
      now,
    );

    expect(items.map((item) => [item.id, item.reason])).toEqual([
      [13, 'SLA breached'],
      [15, 'Due soon'],
      [11, 'P1 incident'],
      [12, 'Needs owner'],
      [14, 'On hold'],
    ]);
  });

  it('builds dashboard metric cards with honest trend fallbacks', () => {
    expect(buildDashboardMetric('Open incidents', 8, '/incidents')).toEqual({
      label: 'Open incidents',
      value: 8,
      href: '/incidents',
      delta: 'No trend yet',
      trend: 'neutral',
      bars: [],
    });
  });
});
