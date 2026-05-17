import Link from 'next/link';
import { format } from 'date-fns';
import {
  AlertCircleIcon,
  ArrowUpRightIcon,
  ClipboardListIcon,
  GitPullRequestIcon,
  UsersIcon,
} from 'lucide-react';

import { requireStaff } from '@/lib/auth-helpers';
import { SiteHeader } from '@/components/site-header';
import { PriorityBadge, SlaBadge, StatusPill } from '@/components/ticket-primitives';
import {
  AttentionList,
  MetricCard,
  SegmentedSlaBar,
} from '@/components/operations-primitives';
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
import { getDashboardStats } from './data';

export default async function DashboardPage() {
  const session = await requireStaff();
  const first = session.user.firstname?.trim() || session.user.email;
  const stats = await getDashboardStats();
  const metricIcons = [
    <AlertCircleIcon key="incidents" className="size-3.5" />,
    <ClipboardListIcon key="requests" className="size-3.5" />,
    <GitPullRequestIcon key="changes" className="size-3.5" />,
    <UsersIcon key="users" className="size-3.5" />,
  ];

  return (
    <>
      <SiteHeader title="Operations" />
      <div className="mx-auto flex w-full max-w-[1480px] flex-1 flex-col gap-4 p-4 md:gap-5 md:p-6">
        <div className="flex flex-col gap-3 border-b border-[color:var(--relay-border-soft)] pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-[color:var(--relay-accent-text)]">
              Live queue
            </p>
            <h1 className="mt-1 text-xl font-semibold text-foreground md:text-2xl">
              Welcome back, {first}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {format(new Date(), 'EEEE, d MMM')} · live workload across your queue.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              render={<Link href="/incidents">View incidents</Link>}
            />
            <Button render={<Link href="/incidents/new">Log incident</Link>} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.metrics.map((metric, index) => (
            <MetricCard
              key={metric.label}
              metric={metric}
              icon={metricIcons[index]}
              accentClassName="text-muted-foreground"
            />
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>SLA compliance</CardTitle>
              <p className="text-xs text-muted-foreground">Open incidents · current queue</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                <div className="shrink-0">
                  <div className="text-4xl font-semibold leading-none tabular-nums">
                    {stats.slaCompliance}%
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">tickets within SLA</div>
                </div>
                <div className="min-w-0 flex-1">
                  <SegmentedSlaBar segments={stats.slaSegments} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Open by priority</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2.5">
                {stats.priorityBreakdown.map((row) => {
                  const max = Math.max(...stats.priorityBreakdown.map((item) => item.count), 1);

                  return (
                    <li key={row.priority} className="grid grid-cols-[62px_minmax(0,1fr)_32px] items-center gap-3">
                      <PriorityBadge priority={row.priority} compact />
                      <div className="h-2 overflow-hidden rounded-full bg-[color:var(--relay-bg-soft)]">
                        <div
                          className="h-full rounded-full bg-[color:var(--relay-accent)]"
                          style={{ width: `${(row.count / max) * 100}%` }}
                        />
                      </div>
                      <span className="text-right text-sm font-semibold tabular-nums">{row.count}</span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          <AttentionList items={stats.attentionItems} />
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Recent open incidents</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Newest first · click to open.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                render={
                  <Link href="/incidents">
                  Open queue
                  <ArrowUpRightIcon className="size-3.5" />
                  </Link>
                }
              />
            </CardHeader>
            <CardContent>
              {stats.recentIncidents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No open incidents.</p>
              ) : (
                <Table className="min-w-[760px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Summary</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>SLA</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentIncidents.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-mono">
                          <Link href={`/incidents/${t.id}`} className="hover:underline">
                            #{t.id}
                          </Link>
                        </TableCell>
                        <TableCell className="max-w-40 truncate">
                          <Link href={`/incidents/${t.id}`} className="hover:underline">
                            {t.summary}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {t.requester}
                        </TableCell>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
