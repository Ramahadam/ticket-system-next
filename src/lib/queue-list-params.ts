import { PAGE_SIZE } from './constants';

export type QueueState = 'open' | 'closed' | 'all';
export type QueueOwnerFilter = 'all' | 'me' | 'unassigned';
export type QueueSort = 'priority' | 'deadline' | 'created';

export type ParsedQueueListParams = {
  page: number;
  skip: number;
  take: number;
  state: QueueState;
  q: string | undefined;
  level: number | undefined;
  owner: QueueOwnerFilter;
  sort: QueueSort;
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseQueueListParams(
  raw: Record<string, string | string[] | undefined>,
  pageSize = PAGE_SIZE,
): ParsedQueueListParams {
  const pageNum = Number(firstValue(raw.page)) || 1;
  const page = Math.max(1, pageNum);
  const stateRaw = firstValue(raw.state);
  const levelRaw = Number(firstValue(raw.level));
  const ownerRaw = firstValue(raw.owner);
  const sortRaw = firstValue(raw.sort);
  const q = firstValue(raw.q)?.trim();

  return {
    page,
    skip: (page - 1) * pageSize,
    take: pageSize,
    state: stateRaw === 'closed' || stateRaw === 'all' ? stateRaw : 'open',
    q: q || undefined,
    level: [1, 2, 3, 4].includes(levelRaw) ? levelRaw : undefined,
    owner: ownerRaw === 'me' || ownerRaw === 'unassigned' ? ownerRaw : 'all',
    sort: sortRaw === 'deadline' || sortRaw === 'created' ? sortRaw : 'priority',
  };
}
