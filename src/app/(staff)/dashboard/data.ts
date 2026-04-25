import { prisma } from '@/lib/prisma';
import { PRIORITY_LABELS } from '@/lib/constants';
import { TicketStatus, ChangeStatus } from '@/generated/prisma/client';

const OPEN_STATUSES: TicketStatus[] = [
  TicketStatus.loged,
  TicketStatus.progress,
  TicketStatus.hold,
];

const OPEN_CR_STATUSES: ChangeStatus[] = [
  ChangeStatus.requested,
  ChangeStatus.pending_approval,
  ChangeStatus.approved,
];

export async function getDashboardStats() {
  const PRIORITIES = [1, 2, 3, 4] as const;

  const [
    openIncidents,
    openRequests,
    openChanges,
    totalUsers,
    recentIncidents,
    priorityCounts,
  ] = await Promise.all([
    prisma.incident.count({ where: { status: { in: OPEN_STATUSES } } }),
    prisma.serviceRequest.count({ where: { status: { in: OPEN_STATUSES } } }),
    prisma.changeRequest.count({ where: { status: { in: OPEN_CR_STATUSES } } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.incident.findMany({
      where: { status: { in: OPEN_STATUSES } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        summary: true,
        status: true,
        priority: true,
        requester: true,
        createdAt: true,
      },
    }),
    Promise.all(
      PRIORITIES.map((p) =>
        prisma.incident.count({
          where: { status: { in: OPEN_STATUSES }, priority: p },
        }),
      ),
    ),
  ]);

  const priorityBreakdown = PRIORITIES.map((p, i) => ({
    label: PRIORITY_LABELS[p] ?? String(p),
    count: priorityCounts[i],
  })).filter((row) => row.count > 0);

  return {
    openIncidents,
    openRequests,
    openChanges,
    totalUsers,
    priorityBreakdown,
    recentIncidents,
  };
}
