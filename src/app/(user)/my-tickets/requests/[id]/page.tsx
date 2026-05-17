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
import { ServiceRequestEditForm } from '@/components/service-request-edit-form';
import { buildTicketActivity } from '@/lib/ticket-activity';
import type { TicketNote } from '@/lib/ticket-helpers';
import { getServiceRequest } from '@/app/(staff)/requests/data';

export default async function MyServiceRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUser();
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  const row = await getServiceRequest(numericId, {
    role: session.user.role,
    email: session.user.email,
  });
  if (!row) notFound();

  const notes = (row.notes ?? []) as unknown as TicketNote[];
  const activity = buildTicketActivity({
    createdAt: row.createdAt,
    requester: row.requester,
    notes,
  });

  return (
    <>
      <SiteHeader title={`Service request #${row.id}`} />
      <div className="mx-auto flex w-full max-w-[1480px] flex-1 flex-col gap-4 p-4 md:gap-5 md:p-6">
        <DetailPageHeader
          backHref="/my-tickets?tab=requests"
          backLabel="Back to my tickets"
          id={`#${row.id}`}
          title={row.summary}
          subtitle={`Opened ${format(row.createdAt, 'PPp')} by ${row.requester}`}
          badges={
            <>
              <PriorityBadge priority={row.priority} />
              <StatusPill status={row.status} />
              <SlaBadge deadline={row.deadline} status={row.status} />
            </>
          }
          actions={
            row.file ? (
              <Button
                variant="outline"
                render={
                  <a
                    href={`/api/files/service-request/${row.id}`}
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
                      <StatusPill status={row.status} />
                    </DetailRailRow>
                    <DetailRailRow label="Priority">
                      <PriorityBadge priority={row.priority} />
                    </DetailRailRow>
                    <DetailRailRow label="SLA">
                      <SlaBadge deadline={row.deadline} status={row.status} />
                    </DetailRailRow>
                    <DetailRailRow label="Owner">
                      {row.owner ?? 'Unassigned'}
                    </DetailRailRow>
                    <DetailRailRow label="Requester">
                      {row.requester}
                    </DetailRailRow>
                    <DetailRailRow label="Impact">
                      {row.impact ?? 'Not specified'}
                    </DetailRailRow>
                    <DetailRailRow label="Created">
                      {format(row.createdAt, 'PPp')}
                    </DetailRailRow>
                    <DetailRailRow label="Updated" last>
                      {format(row.updatedAt, 'PPp')}
                    </DetailRailRow>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Update request</CardTitle>
                </CardHeader>
                <CardContent>
                  <ServiceRequestEditForm
                    requestId={row.id}
                    userId={session.user.id}
                    isStaff={false}
                    engineers={[]}
                    currentStatus={row.status}
                    currentOwner={row.owner}
                    currentPriority={row.priority}
                    currentImpact={row.impact}
                  />
                </CardContent>
              </Card>
            </>
          }
        >
          <Card>
            <CardHeader>
              <CardTitle>Request brief</CardTitle>
            </CardHeader>
            <CardContent>
              <TextBlock title="Description">{row.description}</TextBlock>
            </CardContent>
          </Card>

          <NotesCard notes={notes} />

          <ActivityCard events={activity} />
        </DetailPageFrame>
      </div>
    </>
  );
}
