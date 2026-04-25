import { prisma } from '@/lib/prisma';
import { PAGE_SIZE } from '@/lib/constants';
import { isStaff } from '@/lib/permissions';
import {
  parseTicketListParams,
  withOwnershipFilter,
  type OwnershipContext,
} from '@/lib/ticket-helpers';
import type { Prisma, TicketStatus } from '@/generated/prisma/client';

const SORTABLE = ['status', 'priority', 'createdAt'] as const;

export async function getServiceRequestsList(
  raw: Record<string, string | string[] | undefined>,
  ctx: OwnershipContext,
) {
  const parsed = parseTicketListParams(raw, PAGE_SIZE, { sortable: SORTABLE });

  const where: Prisma.ServiceRequestWhereInput = {};
  if (parsed.status) where.status = parsed.status as TicketStatus;
  const scoped = withOwnershipFilter(where, ctx) as Prisma.ServiceRequestWhereInput;

  const [data, count] = await prisma.$transaction([
    prisma.serviceRequest.findMany({
      where: scoped,
      skip: parsed.skip,
      take: parsed.take,
      orderBy: parsed.orderBy as Prisma.ServiceRequestOrderByWithRelationInput,
    }),
    prisma.serviceRequest.count({ where: scoped }),
  ]);

  return { data, count, page: parsed.page, pageSize: parsed.take };
}

export async function getServiceRequest(id: number, ctx: OwnershipContext) {
  const row = await prisma.serviceRequest.findUnique({ where: { id } });
  if (!row) return null;
  if (!isStaff(ctx.role) && row.requester !== ctx.email) return null;
  return row;
}
