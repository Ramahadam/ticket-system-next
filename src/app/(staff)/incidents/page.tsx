import Link from 'next/link';

import { requireUser } from '@/lib/auth-helpers';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PRIORITY_LABELS,
  TICKET_FILTER_OPTIONS,
  TICKET_SORT_OPTIONS,
} from '@/lib/constants';
import { isStaff } from '@/lib/permissions';
import { getIncidentsList } from './data';

type SP = Record<string, string | string[] | undefined>;

function buildHref(
  current: URLSearchParams,
  patch: Record<string, string | null>,
): string {
  const next = new URLSearchParams(current);
  for (const [k, v] of Object.entries(patch)) {
    if (v === null) next.delete(k);
    else next.set(k, v);
  }
  const qs = next.toString();
  return qs ? `/incidents?${qs}` : '/incidents';
}

function spToURLSearchParams(sp: SP): URLSearchParams {
  const out = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === 'string') out.set(k, v);
    else if (Array.isArray(v) && v[0]) out.set(k, v[0]);
  }
  return out;
}

export default async function IncidentsListPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const session = await requireUser();
  const sp = await searchParams;
  const ctx = { role: session.user.role, email: session.user.email };
  const { data, count, page, pageSize } = await getIncidentsList(sp, ctx);
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const current = spToURLSearchParams(sp);
  const currentStatus = current.get('status') ?? 'all';
  const currentSort = current.get('sort') ?? 'createdAt-desc';

  return (
    <>
      <SiteHeader title="Incidents" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1">
            <Button
              size="sm"
              variant={currentStatus === 'all' ? 'default' : 'outline'}
              render={
                <Link href={buildHref(current, { status: null, page: null })}>
                  All
                </Link>
              }
            />
            {TICKET_FILTER_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                size="sm"
                variant={currentStatus === opt.value ? 'default' : 'outline'}
                render={
                  <Link href={buildHref(current, { status: opt.value, page: null })}>
                    {opt.label}
                  </Link>
                }
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {TICKET_SORT_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                size="sm"
                variant={currentSort === opt.value ? 'default' : 'outline'}
                render={
                  <Link href={buildHref(current, { sort: opt.value, page: null })}>
                    {opt.label}
                  </Link>
                }
              />
            ))}
          </div>
          <div className="ml-auto">
            <Button render={<Link href="/incidents/new">New incident</Link>} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {count} {count === 1 ? 'incident' : 'incidents'}
              {isStaff(session.user.role) ? '' : ' (mine)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.length === 0 ? (
              <p className="text-sm text-muted-foreground">No incidents match.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Owner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono">
                        <Link href={`/incidents/${t.id}`} className="hover:underline">
                          #{t.id}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/incidents/${t.id}`} className="hover:underline">
                          {t.summary}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{t.status}</Badge>
                      </TableCell>
                      <TableCell>{PRIORITY_LABELS[t.priority] ?? t.priority}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.requester}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.owner ?? 'Unassigned'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              {page > 1 ? (
                <Button
                  variant="outline"
                  size="sm"
                  render={
                    <Link href={buildHref(current, { page: String(page - 1) })}>
                      Previous
                    </Link>
                  }
                />
              ) : null}
              {page < totalPages ? (
                <Button
                  variant="outline"
                  size="sm"
                  render={
                    <Link href={buildHref(current, { page: String(page + 1) })}>
                      Next
                    </Link>
                  }
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
