import { prisma } from '@/lib/prisma';
import { isStaff } from '@/lib/permissions';
import {
  withOwnershipFilter,
  type OwnershipContext,
} from '@/lib/ticket-helpers';
import { parseQueueListParams } from '@/lib/queue-list-params';
import { TicketStatus, type Prisma } from '@/generated/prisma/client';

const CLOSED_STATUSES: TicketStatus[] = [TicketStatus.fulfilled, TicketStatus.canceled];

export async function getIncidentsList(
  raw: Record<string, string | string[] | undefined>,
  ctx: OwnershipContext,
) {
  const parsed = parseQueueListParams(raw);

  const where: Prisma.IncidentWhereInput = {};
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
  const scoped = withOwnershipFilter(where, ctx) as Prisma.IncidentWhereInput;
  const orderBy: Prisma.IncidentOrderByWithRelationInput =
    parsed.sort === 'created'
      ? { createdAt: 'desc' }
      : parsed.sort === 'deadline'
        ? { deadline: 'asc' }
        : { priority: 'asc' };

  const [data, count] = await prisma.$transaction([
    prisma.incident.findMany({
      where: scoped,
      skip: parsed.skip,
      take: parsed.take,
      orderBy,
    }),
    prisma.incident.count({ where: scoped }),
  ]);

  return { data, count, page: parsed.page, pageSize: parsed.take };
}

export async function getIncident(id: number, ctx: OwnershipContext) {
  const incident = await prisma.incident.findUnique({ where: { id } });
  if (!incident) return null;
  if (!isStaff(ctx.role) && incident.requester !== ctx.email) return null;
  return incident;
}
