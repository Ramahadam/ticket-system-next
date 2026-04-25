import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

import { requireUser } from '@/lib/auth-helpers';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ServiceRequestEditForm } from '@/components/service-request-edit-form';
import { PRIORITY_LABELS } from '@/lib/constants';
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

  return (
    <>
      <SiteHeader title={`Service request #${row.id}`} />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/my-tickets?tab=requests">Back</Link>}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2">
              <span>{row.summary}</span>
              <Badge variant="outline">{row.status}</Badge>
              <Badge variant="secondary">
                {PRIORITY_LABELS[row.priority] ?? row.priority}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Description: </span>
              <span className="whitespace-pre-wrap">{row.description}</span>
            </div>
            <Separator className="my-2" />
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div>
                <dt className="text-xs text-muted-foreground">Requester</dt>
                <dd>{row.requester}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Owner</dt>
                <dd>{row.owner ?? 'Unassigned'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Impact</dt>
                <dd>{row.impact ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Created</dt>
                <dd>{format(row.createdAt, 'PPp')}</dd>
              </div>
              {row.deadline ? (
                <div>
                  <dt className="text-xs text-muted-foreground">Deadline</dt>
                  <dd>{format(row.deadline, 'PPp')}</dd>
                </div>
              ) : null}
              {row.file ? (
                <div>
                  <dt className="text-xs text-muted-foreground">Attachment</dt>
                  <dd>
                    <a
                      href={`/api/files/service-request/${row.id}`}
                      className="text-primary underline"
                      target="_blank"
                      rel="noopener"
                    >
                      Download
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes ({notes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {notes.map((n) => (
                  <li
                    key={String(n.noteId)}
                    className="border-border rounded-md border p-3 text-sm"
                  >
                    <div className="text-muted-foreground mb-1 text-xs">
                      {n.createBy} · {format(new Date(n.createdAt), 'PPp')}
                    </div>
                    <div className="whitespace-pre-wrap">{n.noteValue}</div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update</CardTitle>
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
      </div>
    </>
  );
}
