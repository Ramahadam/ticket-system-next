import { PAGE_SIZE } from '@/lib/constants';
import {
  USER_ROLE_VALUES,
  type UserRoleValue,
} from '@/lib/validation/users';

const SORTABLE = new Set(['email', 'userrole', 'createdAt']);

export function parseUsersListParams(
  raw: Record<string, string | string[] | undefined>,
) {
  const pageNum = Number(Array.isArray(raw.page) ? raw.page[0] : raw.page) || 1;
  const page = Math.max(1, pageNum);

  const roleRaw = Array.isArray(raw.role) ? raw.role[0] : raw.role;
  const role = USER_ROLE_VALUES.includes(roleRaw as UserRoleValue)
    ? (roleRaw as UserRoleValue)
    : null;

  const qRaw = Array.isArray(raw.q) ? raw.q[0] : raw.q;
  const q = qRaw?.trim() ? qRaw.trim().slice(0, 120) : '';

  const sortRaw = Array.isArray(raw.sort) ? raw.sort[0] : raw.sort;
  const [col, dir] = (sortRaw ?? 'createdAt-desc').split('-');
  const column = col && SORTABLE.has(col) ? col : 'createdAt';
  const direction: 'asc' | 'desc' = dir === 'asc' ? 'asc' : 'desc';

  return {
    page,
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
    role,
    q,
    orderBy: { [column]: direction },
  };
}
