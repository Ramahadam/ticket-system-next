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
import { ChangeRequestEditForm } from '@/components/change-request-edit-form';
import { CLASSIFICATION_LABELS } from '@/lib/constants';
import type { TicketNote } from '@/lib/ticket-helpers';
import { getChangeRequest } from '@/app/(staff)/change/data';

export default async function MyChangeRequestDetailPage({
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

  const notes = (row.notes ?? []) as unknown as TicketNote[];

  return (
    <>
      <SiteHeader title={`Change request #${row.id}`} />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/my-tickets?tab=change">Back</Link>}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2">
              <span>{row.summary}</span>
              <Badge variant="outline">{row.status}</Badge>
              <Badge variant="secondary">
                {CLASSIFICATION_LABELS[row.classification] ?? row.classification}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Description: </span>
              <span className="whitespace-pre-wrap">{row.description}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Rollback plan: </span>
              <span className="whitespace-pre-wrap">{row.rollback_plan}</span>
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
                <dt className="text-xs text-muted-foreground">Category</dt>
                <dd className="capitalize">{row.category}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Created</dt>
                <dd>{format(row.createdAt, 'PPp')}</dd>
              </div>
              {row.file ? (
                <div>
                  <dt className="text-xs text-muted-foreground">Attachment</dt>
                  <dd>
                    <a
                      href={`/api/files/change-request/${row.id}`}
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
            <ChangeRequestEditForm
              requestId={row.id}
              userId={session.user.id}
              isStaff={false}
              engineers={[]}
              currentStatus={row.status}
              currentOwner={row.owner}
              currentCategory={row.category}
              currentClassification={row.classification}
              currentRollbackPlan={row.rollback_plan}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
