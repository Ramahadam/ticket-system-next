import { prisma } from '@/lib/prisma';
import { TicketStatus, ChangeStatus } from '@/generated/prisma/client';
import {
  buildAttentionItems,
  buildDashboardMetric,
  summarizeSlaSegments,
} from '@/lib/dashboard-presentation';

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
    openIncidentRows,
    priorityCounts,
  ] = await Promise.all([
    prisma.incident.count({ where: { status: { in: OPEN_STATUSES } } }),
    prisma.serviceRequest.count({ where: { status: { in: OPEN_STATUSES } } }),
    prisma.changeRequest.count({ where: { status: { in: OPEN_CR_STATUSES } } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.incident.findMany({
      where: { status: { in: OPEN_STATUSES } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        summary: true,
        status: true,
        priority: true,
        requester: true,
        owner: true,
        deadline: true,
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

  const now = new Date();
  const slaSegments = summarizeSlaSegments(openIncidentRows, now);
  const attentionItems = buildAttentionItems(openIncidentRows, now);

  const priorityBreakdown = PRIORITIES.map((p, i) => ({
    priority: p,
    count: priorityCounts[i],
  }));

  return {
    metrics: [
      buildDashboardMetric('Open incidents', openIncidents, '/incidents'),
      buildDashboardMetric('Open requests', openRequests, '/requests'),
      buildDashboardMetric('Open changes', openChanges, '/change'),
      buildDashboardMetric('Active users', totalUsers, '/users'),
    ],
    openIncidents,
    openRequests,
    openChanges,
    totalUsers,
    slaSummary: {
      breached: slaSegments.breached,
      dueSoon: slaSegments.dueSoon,
      onTrack: slaSegments.onTrack,
    },
    slaSegments,
    slaCompliance: slaSegments.compliance,
    attentionItems,
    priorityBreakdown,
    recentIncidents: openIncidentRows.slice(0, 6),
  };
}
