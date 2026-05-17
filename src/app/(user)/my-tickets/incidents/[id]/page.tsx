import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { DownloadIcon } from 'lucide-react';

import { requireUser } from '@/lib/auth-helpers';
import { SiteHeader } from '@/components/site-header';
import {
  PriorityBadge,
  SlaBadge,
  StatusPill,
} from '@/components/ticket-primitives';
import {
  ActivityCard,
  DetailPageFrame,
  DetailPageHeader,
  DetailRailRow,
  NotesCard,
  TextBlock,
} from '@/components/detail-page-primitives';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { IncidentEditForm } from '@/components/incident-edit-form';
import { buildTicketActivity } from '@/lib/ticket-activity';
import type { TicketNote } from '@/lib/ticket-helpers';
import { getIncident } from '@/app/(staff)/incidents/data';

export default async function MyIncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUser();
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  const incident = await getIncident(numericId, {
    role: session.user.role,
    email: session.user.email,
  });
  if (!incident) notFound();

  const notes = (incident.notes ?? []) as unknown as TicketNote[];
  const activity = buildTicketActivity({
    createdAt: incident.createdAt,
    requester: incident.requester,
    notes,
  });

  return (
    <>
      <SiteHeader title={`Incident #${incident.id}`} />
      <div className="mx-auto flex w-full max-w-[1480px] flex-1 flex-col gap-4 p-4 md:gap-5 md:p-6">
        <DetailPageHeader
          backHref="/my-tickets?tab=incidents"
          backLabel="Back to my tickets"
          id={`#${incident.id}`}
          title={incident.summary}
          subtitle={`Opened ${format(incident.createdAt, 'PPp')} by ${incident.requester}`}
          badges={
            <>
              <PriorityBadge priority={incident.priority} />
              <StatusPill status={incident.status} />
              <SlaBadge deadline={incident.deadline} status={incident.status} />
            </>
          }
          actions={
            incident.file ? (
              <Button
                variant="outline"
                render={
                  <a
                    href={`/api/files/incident/${incident.id}`}
                    target="_blank"
                    rel="noopener"
                  >
                    <DownloadIcon className="size-4" />
                    Attachment
                  </a>
                }
              />
            ) : null
          }
        />

        <DetailPageFrame
          rail={
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Ticket facts</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl>
                    <DetailRailRow label="Status">
                      <StatusPill status={incident.status} />
                    </DetailRailRow>
                    <DetailRailRow label="Priority">
                      <PriorityBadge priority={incident.priority} />
                    </DetailRailRow>
                    <DetailRailRow label="SLA">
                      <SlaBadge deadline={incident.deadline} status={incident.status} />
                    </DetailRailRow>
                    <DetailRailRow label="Owner">
                      {incident.owner ?? 'Unassigned'}
                    </DetailRailRow>
                    <DetailRailRow label="Requester">
                      {incident.requester}
                    </DetailRailRow>
                    <DetailRailRow label="Impact">{incident.impact}</DetailRailRow>
                    <DetailRailRow label="Created">
                      {format(incident.createdAt, 'PPp')}
                    </DetailRailRow>
                    <DetailRailRow label="Updated" last>
                      {format(incident.updatedAt, 'PPp')}
                    </DetailRailRow>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Update incident</CardTitle>
                </CardHeader>
                <CardContent>
                  <IncidentEditForm
                    incidentId={incident.id}
                    userId={session.user.id}
                    isStaff={false}
                    engineers={[]}
                    currentStatus={incident.status}
                    currentOwner={incident.owner}
                    currentPriority={incident.priority}
                    currentImpact={incident.impact}
                  />
                </CardContent>
              </Card>
            </>
          }
        >
          <Card>
            <CardHeader>
              <CardTitle>Incident brief</CardTitle>
            </CardHeader>
            <CardContent>
              <TextBlock title="Description">{incident.description}</TextBlock>
            </CardContent>
          </Card>

          <NotesCard notes={notes} />

          <ActivityCard events={activity} />
        </DetailPageFrame>
      </div>
    </>
  );
}
