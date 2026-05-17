import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { DownloadIcon } from 'lucide-react';

import { requireUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { isStaff } from '@/lib/permissions';
import { SiteHeader } from '@/components/site-header';
import {
  ClassificationBadge,
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
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChangeRequestEditForm } from '@/components/change-request-edit-form';
import { DeleteChangeRequestButton } from '@/components/delete-change-request-button';
import { buildTicketActivity } from '@/lib/ticket-activity';
import type { TicketNote } from '@/lib/ticket-helpers';
import { getChangeRequest } from '../data';

export default async function ChangeRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUser();
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  const row = await getChangeRequest(numericId, {
    role: session.user.role,
    email: session.user.email,
  });
  if (!row) notFound();

  const staff = isStaff(session.user.role);
  const engineers = staff
    ? await prisma.user.findMany({
        where: { userrole: { in: ['analyst', 'admin'] }, isActive: true },
        select: { id: true, email: true, firstname: true, lastname: true },
        orderBy: { email: 'asc' },
      })
    : [];

  const engineerOptions = engineers.map((e) => ({
    id: e.id,
    email: e.email,
    label: [e.firstname, e.lastname].filter(Boolean).join(' ') || e.email,
  }));

  const notes = (row.notes ?? []) as unknown as TicketNote[];
  const activity = buildTicketActivity({
    createdAt: row.createdAt,
    requester: row.requester,
    notes,
  });

  return (
    <>
      <SiteHeader title={`Change request #${row.id}`} />
      <div className="mx-auto flex w-full max-w-[1480px] flex-1 flex-col gap-4 p-4 md:gap-5 md:p-6">
        <DetailPageHeader
          backHref="/change"
          backLabel="Back to changes"
          id={`#${row.id}`}
          title={row.summary}
          subtitle={`Opened ${format(row.createdAt, 'PPp')} by ${row.requester}`}
          badges={
            <>
              <StatusPill status={row.status} />
              <Badge variant="outline" className="capitalize">
                {row.category}
              </Badge>
              <ClassificationBadge classification={row.classification} />
            </>
          }
          actions={
            <>
              {row.file ? (
                <Button
                  variant="outline"
                  render={
                    <a
                      href={`/api/files/change-request/${row.id}`}
                      target="_blank"
                      rel="noopener"
                    >
                      <DownloadIcon className="size-4" />
                      Attachment
                    </a>
                  }
                />
              ) : null}
              {staff ? <DeleteChangeRequestButton requestId={row.id} /> : null}
            </>
          }
        />

        <DetailPageFrame
          rail={
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Change facts</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl>
                    <DetailRailRow label="Status">
                      <StatusPill status={row.status} />
                    </DetailRailRow>
                    <DetailRailRow label="Class">
                      <ClassificationBadge classification={row.classification} />
                    </DetailRailRow>
                    <DetailRailRow label="Category">
                      <span className="capitalize">{row.category}</span>
                    </DetailRailRow>
                    <DetailRailRow label="Owner">
                      {row.owner ?? 'Unassigned'}
                    </DetailRailRow>
                    <DetailRailRow label="Requester">
                      {row.requester}
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
                  <CardTitle>Update change</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChangeRequestEditForm
                    requestId={row.id}
                    userId={session.user.id}
                    isStaff={staff}
                    engineers={engineerOptions}
                    currentStatus={row.status}
                    currentOwner={row.owner}
                    currentCategory={row.category}
                    currentClassification={row.classification}
                    currentRollbackPlan={row.rollback_plan}
                  />
                </CardContent>
              </Card>
            </>
          }
        >
          <Card>
            <CardHeader>
              <CardTitle>Change brief</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextBlock title="Description">{row.description}</TextBlock>
              <TextBlock title="Rollback plan">{row.rollback_plan}</TextBlock>
            </CardContent>
          </Card>

          <NotesCard notes={notes} />

          <ActivityCard events={activity} />
        </DetailPageFrame>
      </div>
    </>
  );
}
