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

export async function getIncidentsList(
  raw: Record<string, string | string[] | undefined>,
  ctx: OwnershipContext,
) {
  const parsed = parseTicketListParams(raw, PAGE_SIZE, { sortable: SORTABLE });

  const where: Prisma.IncidentWhereInput = {};
  if (parsed.status) where.status = parsed.status as TicketStatus;
  const scoped = withOwnershipFilter(where, ctx) as Prisma.IncidentWhereInput;

  const [data, count] = await prisma.$transaction([
    prisma.incident.findMany({
      where: scoped,
      skip: parsed.skip,
      take: parsed.take,
      orderBy: parsed.orderBy as Prisma.IncidentOrderByWithRelationInput,
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
