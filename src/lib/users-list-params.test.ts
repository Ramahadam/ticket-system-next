import { describe, expect, it } from 'vitest';

import { PAGE_SIZE } from '@/lib/constants';
import { parseUsersListParams } from './users-list-params';

describe('users list params', () => {
  it('defaults to the first page and newest users', () => {
    expect(parseUsersListParams({})).toEqual({
      page: 1,
      take: PAGE_SIZE,
      skip: 0,
      role: null,
      q: '',
      orderBy: { createdAt: 'desc' },
    });
  });

  it('normalizes role, search, sort, and pagination', () => {
    expect(
      parseUsersListParams({
        role: 'analyst',
        q: '  priya@example.com  ',
        sort: 'email-asc',
        page: '3',
      }),
    ).toEqual({
        page: 3,
        take: PAGE_SIZE,
        skip: PAGE_SIZE * 2,
        role: 'analyst',
        q: 'priya@example.com',
        orderBy: { email: 'asc' },
    });
  });

  it('rejects invalid filters safely', () => {
    const parsed = parseUsersListParams({
      role: 'owner',
      sort: 'password-asc',
      page: '-9',
    });
    expect(parsed.role).toBe(null);
    expect(parsed.page).toBe(1);
    expect(parsed.orderBy).toEqual({ createdAt: 'asc' });
  });
});
