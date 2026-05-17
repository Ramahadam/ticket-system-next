import { prisma } from '@/lib/prisma';
import { isStaff } from '@/lib/permissions';
import {
  withOwnershipFilter,
  type OwnershipContext,
} from '@/lib/ticket-helpers';
import { parseQueueListParams } from '@/lib/queue-list-params';
import { ChangeStatus, type Prisma } from '@/generated/prisma/client';

const CLOSED_STATUSES: ChangeStatus[] = [ChangeStatus.implemented, ChangeStatus.cancelled];

export async function getChangeRequestsList(
  raw: Record<string, string | string[] | undefined>,
  ctx: OwnershipContext,
) {
  const parsed = parseQueueListParams(raw);

  const where: Prisma.ChangeRequestWhereInput = {};
  if (parsed.state === 'open') where.status = { notIn: CLOSED_STATUSES };
  if (parsed.state === 'closed') where.status = { in: CLOSED_STATUSES };
  if (parsed.level) where.classification = parsed.level;
  if (parsed.owner === 'me') where.owner = ctx.email;
  if (parsed.owner === 'unassigned') where.owner = null;
  if (parsed.q) {
    const id = Number(parsed.q.replace(/^#/, ''));
    where.OR = [
      { summary: { contains: parsed.q, mode: 'insensitive' } },
      ...(Number.isInteger(id) ? [{ id }] : []),
    ];
  }
  const scoped = withOwnershipFilter(where, ctx) as Prisma.ChangeRequestWhereInput;
  const orderBy: Prisma.ChangeRequestOrderByWithRelationInput =
    parsed.sort === 'created' ? { createdAt: 'desc' } : { classification: 'asc' };

  const [data, count] = await prisma.$transaction([
    prisma.changeRequest.findMany({
      where: scoped,
      skip: parsed.skip,
      take: parsed.take,
      orderBy,
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
