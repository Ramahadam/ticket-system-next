import { prisma } from '@/lib/prisma';
import { isStaff } from '@/lib/permissions';
import {
  withOwnershipFilter,
  type OwnershipContext,
} from '@/lib/ticket-helpers';
import { parseQueueListParams } from '@/lib/queue-list-params';
import { TicketStatus, type Prisma } from '@/generated/prisma/client';

const CLOSED_STATUSES: TicketStatus[] = [TicketStatus.fulfilled, TicketStatus.canceled];

export async function getServiceRequestsList(
  raw: Record<string, string | string[] | undefined>,
  ctx: OwnershipContext,
) {
  const parsed = parseQueueListParams(raw);

  const where: Prisma.ServiceRequestWhereInput = {};
  if (parsed.state === 'open') where.status = { notIn: CLOSED_STATUSES };
  if (parsed.state === 'closed') where.status = { in: CLOSED_STATUSES };
  if (parsed.level) where.priority = parsed.level;
  if (parsed.owner === 'me') where.owner = ctx.email;
  if (parsed.owner === 'unassigned') where.owner = null;
  if (parsed.q) {
    const id = Number(parsed.q.replace(/^#/, ''));
    where.OR = [
      { summary: { contains: parsed.q, mode: 'insensitive' } },
      ...(Number.isInteger(id) ? [{ id }] : []),
    ];
  }
  const scoped = withOwnershipFilter(where, ctx) as Prisma.ServiceRequestWhereInput;
  const orderBy: Prisma.ServiceRequestOrderByWithRelationInput =
    parsed.sort === 'created'
      ? { createdAt: 'desc' }
      : parsed.sort === 'deadline'
        ? { deadline: 'asc' }
        : { priority: 'asc' };

  const [data, count] = await prisma.$transaction([
    prisma.serviceRequest.findMany({
      where: scoped,
      skip: parsed.skip,
      take: parsed.take,
      orderBy,
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
