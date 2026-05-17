import Link from 'next/link';
import { format } from 'date-fns';

import { requireUser } from '@/lib/auth-helpers';
import { SiteHeader } from '@/components/site-header';
import {
  QueueFilterPanel,
  QueuePageHeader,
  QueuePagination,
  QueueResultsCard,
} from '@/components/queue-list-primitives';
import {
  PriorityBadge,
  SlaBadge,
  StatusPill,
} from '@/components/ticket-primitives';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { parseQueueListParams } from '@/lib/queue-list-params';
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
  const parsed = parseQueueListParams(sp);
  const hrefFor = (patch: Record<string, string | null>) => buildHref(current, patch);

  return (
    <>
      <SiteHeader title="Incidents" />
      <div className="mx-auto flex w-full max-w-[1480px] flex-1 flex-col gap-4 p-4 md:gap-5 md:p-6">
        <QueuePageHeader
          eyebrow="Incident queue"
          title="Incidents"
          subtitle="Things that broke. Triage and resolve."
          newHref="/incidents/new"
          newLabel="New incident"
        />

        <QueueFilterPanel
          currentState={parsed.state}
          currentLevel={parsed.level}
          currentOwner={parsed.owner}
          currentSort={parsed.sort}
          currentSearch={parsed.q}
          hrefFor={hrefFor}
          action="/incidents"
          levelLabel="Priority"
          levelOptions={[
            { value: '1', label: 'P1 · Critical' },
            { value: '2', label: 'P2 · High' },
            { value: '3', label: 'P3 · Normal' },
            { value: '4', label: 'P4 · Low' },
          ]}
        />

        <QueueResultsCard
          title="Queue results"
          count={count}
          totalPages={totalPages}
          page={page}
          pageSize={pageSize}
          empty="No incidents match. Try clearing filters or changing the search term."
        >
          <Table className="min-w-[980px]">
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
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
                  <TableCell className="max-w-[360px]">
                    <Link href={`/incidents/${t.id}`} className="line-clamp-1 font-medium hover:underline">
                      {t.summary}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{t.requester}</TableCell>
                  <TableCell>
                    <PriorityBadge priority={t.priority} compact />
                  </TableCell>
                  <TableCell>
                    <SlaBadge deadline={t.deadline} status={t.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.owner ?? 'Unassigned'}
                  </TableCell>
                  <TableCell>
                    <StatusPill status={t.status} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(t.updatedAt, 'PP')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </QueueResultsCard>

        <QueuePagination page={page} totalPages={totalPages} hrefFor={hrefFor} />
      </div>
    </>
  );
}
