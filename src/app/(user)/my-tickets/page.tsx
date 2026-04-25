import Link from 'next/link';

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CLASSIFICATION_LABELS,
  PAGE_SIZE,
  PRIORITY_LABELS,
} from '@/lib/constants';
import { getIncidentsList } from '@/app/(staff)/incidents/data';
import { getServiceRequestsList } from '@/app/(staff)/requests/data';
import { getChangeRequestsList } from '@/app/(staff)/change/data';
import type { OwnershipContext } from '@/lib/ticket-helpers';

type SP = Record<string, string | string[] | undefined>;
type Tab = 'incidents' | 'requests' | 'change';

function buildHref(current: URLSearchParams, patch: Record<string, string | null>) {
  const next = new URLSearchParams(current);
  for (const [k, v] of Object.entries(patch)) {
    if (v === null) next.delete(k);
    else next.set(k, v);
  }
  const qs = next.toString();
  return qs ? `/my-tickets?${qs}` : '/my-tickets';
}

function spToURLSearchParams(sp: SP): URLSearchParams {
  const out = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === 'string') out.set(k, v);
    else if (Array.isArray(v) && v[0]) out.set(k, v[0]);
  }
  return out;
}

export default async function MyTicketsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const session = await requireUser();
  const sp = await searchParams;
  const current = spToURLSearchParams(sp);
  const tabRaw = current.get('tab') ?? 'incidents';
  const tab: Tab =
    tabRaw === 'requests' || tabRaw === 'change' ? tabRaw : 'incidents';

  const ctx: OwnershipContext = {
    role: session.user.role,
    email: session.user.email,
  };

  const newHref: Record<Tab, string> = {
    incidents: '/my-tickets/incidents/new',
    requests: '/my-tickets/requests/new',
    change: '/my-tickets/change/new',
  };

  const tabs: { value: Tab; label: string }[] = [
    { value: 'incidents', label: 'Incidents' },
    { value: 'requests', label: 'Service Requests' },
    { value: 'change', label: 'Change Requests' },
  ];

  return (
    <>
      <SiteHeader title="My Tickets" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {tabs.map((t) => (
              <Button
                key={t.value}
                size="sm"
                variant={tab === t.value ? 'default' : 'outline'}
                render={
                  <Link href={buildHref(current, { tab: t.value, page: null })}>
                    {t.label}
                  </Link>
                }
              />
            ))}
          </div>
          <div className="ml-auto">
            <Button render={<Link href={newHref[tab]}>New ticket</Link>} />
          </div>
        </div>

        {tab === 'incidents' ? (
          <IncidentsSection ctx={ctx} sp={sp} current={current} />
        ) : tab === 'requests' ? (
          <RequestsSection ctx={ctx} sp={sp} current={current} />
        ) : (
          <ChangeSection ctx={ctx} sp={sp} current={current} />
        )}
      </div>
    </>
  );
}

async function IncidentsSection({
  ctx,
  sp,
  current,
}: {
  ctx: OwnershipContext;
  sp: SP;
  current: URLSearchParams;
}) {
  const { data, count, page } = await getIncidentsList(sp, ctx);
  const total = Math.max(1, Math.ceil(count / PAGE_SIZE));
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            {count} {count === 1 ? 'incident' : 'incidents'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No incidents yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono">
                      <Link
                        href={`/my-tickets/incidents/${t.id}`}
                        className="hover:underline"
                      >
                        #{t.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/my-tickets/incidents/${t.id}`}
                        className="hover:underline"
                      >
                        {t.summary}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{t.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {PRIORITY_LABELS[t.priority] ?? t.priority}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Pagination page={page} total={total} current={current} />
    </>
  );
}

async function RequestsSection({
  ctx,
  sp,
  current,
}: {
  ctx: OwnershipContext;
  sp: SP;
  current: URLSearchParams;
}) {
  const { data, count, page } = await getServiceRequestsList(sp, ctx);
  const total = Math.max(1, Math.ceil(count / PAGE_SIZE));
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            {count} {count === 1 ? 'service request' : 'service requests'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No service requests yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono">
                      <Link
                        href={`/my-tickets/requests/${t.id}`}
                        className="hover:underline"
                      >
                        #{t.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/my-tickets/requests/${t.id}`}
                        className="hover:underline"
                      >
                        {t.summary}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{t.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {PRIORITY_LABELS[t.priority] ?? t.priority}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Pagination page={page} total={total} current={current} />
    </>
  );
}

async function ChangeSection({
  ctx,
  sp,
  current,
}: {
  ctx: OwnershipContext;
  sp: SP;
  current: URLSearchParams;
}) {
  const { data, count, page } = await getChangeRequestsList(sp, ctx);
  const total = Math.max(1, Math.ceil(count / PAGE_SIZE));
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            {count} {count === 1 ? 'change request' : 'change requests'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No change requests yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Classification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono">
                      <Link
                        href={`/my-tickets/change/${t.id}`}
                        className="hover:underline"
                      >
                        #{t.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/my-tickets/change/${t.id}`}
                        className="hover:underline"
                      >
                        {t.summary}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{t.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {CLASSIFICATION_LABELS[t.classification] ?? t.classification}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Pagination page={page} total={total} current={current} />
    </>
  );
}

function Pagination({
  page,
  total,
  current,
}: {
  page: number;
  total: number;
  current: URLSearchParams;
}) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Page {page} of {total}
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
        {page < total ? (
          <Button
            variant="outline"
            size="sm"
            render={
              <Link href={buildHref(current, { page: String(page + 1) })}>Next</Link>
            }
          />
        ) : null}
      </div>
    </div>
  );
}
