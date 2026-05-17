import { prisma } from '@/lib/prisma';
import { parseUsersListParams } from '@/lib/users-list-params';
import type { Prisma } from '@/generated/prisma/client';

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

export async function getUsersList(raw: Record<string, string | string[] | undefined>) {
  const parsed = parseUsersListParams(raw);
  const where: Prisma.UserWhereInput = {};
  if (parsed.role) where.userrole = parsed.role;
  if (parsed.q) {
    where.OR = [
      { email: { contains: parsed.q, mode: 'insensitive' } },
      { firstname: { contains: parsed.q, mode: 'insensitive' } },
      { lastname: { contains: parsed.q, mode: 'insensitive' } },
      { mobile: { contains: parsed.q, mode: 'insensitive' } },
    ];
  }

  const [data, count] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip: parsed.skip,
      take: parsed.take,
      orderBy: parsed.orderBy as Prisma.UserOrderByWithRelationInput,
      select: SELECT_SAFE,
    }),
    prisma.user.count({ where }),
  ]);

  return { data, count, page: parsed.page, pageSize: parsed.take };
}

export async function getUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: SELECT_SAFE,
  });
}
