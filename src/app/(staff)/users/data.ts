import { prisma } from '@/lib/prisma';
import { PAGE_SIZE } from '@/lib/constants';
import type { Prisma, UserRole } from '@/generated/prisma/client';

const SELECT_SAFE = {
  id: true,
  email: true,
  firstname: true,
  lastname: true,
  mobile: true,
  userrole: true,
  isActive: true,
  file: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const SORTABLE = new Set(['email', 'userrole', 'createdAt']);

export async function getUsersList(raw: Record<string, string | string[] | undefined>) {
  const pageNum = Number(Array.isArray(raw.page) ? raw.page[0] : raw.page) || 1;
  const page = Math.max(1, pageNum);
  const skip = (page - 1) * PAGE_SIZE;

  const roleRaw = Array.isArray(raw.role) ? raw.role[0] : raw.role;
  const where: Prisma.UserWhereInput = {};
  if (roleRaw && roleRaw !== 'all') where.userrole = roleRaw as UserRole;

  const sortRaw = Array.isArray(raw.sort) ? raw.sort[0] : raw.sort;
  const [col, dir] = (sortRaw ?? 'createdAt-desc').split('-');
  const column = col && SORTABLE.has(col) ? col : 'createdAt';
  const direction: 'asc' | 'desc' = dir === 'asc' ? 'asc' : 'desc';

  const [data, count] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: { [column]: direction } as Prisma.UserOrderByWithRelationInput,
      select: SELECT_SAFE,
    }),
    prisma.user.count({ where }),
  ]);

  return { data, count, page, pageSize: PAGE_SIZE };
}

export async function getUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: SELECT_SAFE,
  });
}
