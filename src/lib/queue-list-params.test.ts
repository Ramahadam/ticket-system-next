import { describe, expect, it } from 'vitest';

import { parseQueueListParams } from './queue-list-params';

describe('queue list params', () => {
  it('defaults to open tickets sorted by priority', () => {
    expect(parseQueueListParams({})).toEqual({
      page: 1,
      skip: 0,
      take: 10,
      state: 'open',
      q: undefined,
      level: undefined,
      owner: 'all',
      sort: 'priority',
    });
  });

  it('normalizes invalid filters to safe defaults', () => {
    expect(
      parseQueueListParams({
        page: '-4',
        state: 'nonsense',
        level: '9',
        owner: 'someone',
        sort: 'surprise',
      }),
    ).toEqual({
        page: 1,
        skip: 0,
        take: 10,
        state: 'open',
        q: undefined,
        level: undefined,
        owner: 'all',
        sort: 'priority',
    });
  });

  it('parses search, priority/classification level, owner, sort, and pagination', () => {
    expect(
      parseQueueListParams({
        page: '3',
        state: 'all',
        q: ' vpn ',
        level: '2',
        owner: 'unassigned',
        sort: 'deadline',
      }),
    ).toEqual({
        page: 3,
        skip: 20,
        take: 10,
        state: 'all',
        q: 'vpn',
        level: 2,
        owner: 'unassigned',
        sort: 'deadline',
    });
  });
});
