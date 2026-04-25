import { prisma } from '@/lib/prisma';
import { PAGE_SIZE } from '@/lib/constants';
import { isStaff } from '@/lib/permissions';
import {
  parseTicketListParams,
  withOwnershipFilter,
  type OwnershipContext,
} from '@/lib/ticket-helpers';
import type { Prisma, ChangeStatus } from '@/generated/prisma/client';

const SORTABLE = ['status', 'classification', 'createdAt'] as const;

export async function getChangeRequestsList(
  raw: Record<string, string | string[] | undefined>,
  ctx: OwnershipContext,
) {
  const parsed = parseTicketListParams(raw, PAGE_SIZE, { sortable: SORTABLE });

  const where: Prisma.ChangeRequestWhereInput = {};
  if (parsed.status) where.status = parsed.status as ChangeStatus;
  const scoped = withOwnershipFilter(where, ctx) as Prisma.ChangeRequestWhereInput;

  const [data, count] = await prisma.$transaction([
    prisma.changeRequest.findMany({
      where: scoped,
      skip: parsed.skip,
      take: parsed.take,
      orderBy: parsed.orderBy as Prisma.ChangeRequestOrderByWithRelationInput,
    }),
    prisma.changeRequest.count({ where: scoped }),
  ]);

  return { data, count, page: parsed.page, pageSize: parsed.take };
}

export async function getChangeRequest(id: number, ctx: OwnershipContext) {
  const row = await prisma.changeRequest.findUnique({ where: { id } });
  if (!row) return null;
  if (!isStaff(ctx.role) && row.requester !== ctx.email) return null;
  return row;
}
