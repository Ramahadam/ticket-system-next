import type { Role } from './constants';
import type { TicketNote } from './helpers';

export { mergeNotes, calculateDeadline, type TicketNote } from './helpers';

export function buildNoteEntry(value: string, author: string): TicketNote {
  return {
    noteId: `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    noteValue: value,
    createBy: author,
    createdAt: new Date(),
  };
}

export type OwnershipContext = {
  role: Role;
  email: string;
};

export function withOwnershipFilter<T extends Record<string, unknown>>(
  where: T,
  ctx: OwnershipContext,
): T & { requester?: string } {
  if (ctx.role === 'standard') return { ...where, requester: ctx.email };
  return where;
}

export type ParsedListParams = {
  page: number;
  skip: number;
  take: number;
  status: string | undefined;
  orderBy: Record<string, 'asc' | 'desc'>;
};

export type ParseListParamsOptions = {
  sortable: readonly string[];
  defaultSort?: string;
};

export function parseTicketListParams(
  raw: Record<string, string | string[] | undefined>,
  pageSize: number,
  options: ParseListParamsOptions,
): ParsedListParams {
  const pageNum = Number(Array.isArray(raw.page) ? raw.page[0] : raw.page) || 1;
  const page = Math.max(1, pageNum);
  const skip = (page - 1) * pageSize;

  const statusRaw = Array.isArray(raw.status) ? raw.status[0] : raw.status;
  const status = statusRaw && statusRaw !== 'all' ? statusRaw : undefined;

  const sortRaw = Array.isArray(raw.sort) ? raw.sort[0] : raw.sort;
  const defaultSort = options.defaultSort ?? 'createdAt-desc';
  const [col, dir] = (sortRaw ?? defaultSort).split('-');
  const allowed = new Set(options.sortable);
  const column = col && allowed.has(col) ? col : (defaultSort.split('-')[0] ?? 'createdAt');
  const direction = dir === 'asc' ? 'asc' : 'desc';

  return {
    page,
    skip,
    take: pageSize,
    status,
    orderBy: { [column]: direction },
  };
}
