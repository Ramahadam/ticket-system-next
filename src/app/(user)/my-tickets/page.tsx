import Link from 'next/link';
import type { ReactNode } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  InboxIcon,
  PlusIcon,
} from 'lucide-react';

import { requireUser } from '@/lib/auth-helpers';
import { SiteHeader } from '@/components/site-header';
import {
  ClassificationBadge,
  FilterChip,
  PriorityBadge,
  SlaBadge,
  StatusPill,
} from '@/components/ticket-primitives';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PAGE_SIZE } from '@/lib/constants';
import {
  getMyTicketDetailHref,
  getMyTicketsTabConfig,
  isRequesterTerminalStatus,
  MY_TICKETS_TABS,
  normalizeMyTicketsTab,
  type MyTicketsTab,
} from '@/lib/my-tickets-presentation';
import { getIncidentsList } from '@/app/(staff)/incidents/data';
import { getServiceRequestsList } from '@/app/(staff)/requests/data';
import { getChangeRequestsList } from '@/app/(staff)/change/data';
import type { OwnershipContext } from '@/lib/ticket-helpers';

type SP = Record<string, string | string[] | undefined>;
type IncidentTicket = Awaited<ReturnType<typeof getIncidentsList>>['data'][number];
type RequestTicket = Awaited<ReturnType<typeof getServiceRequestsList>>['data'][number];
type ChangeTicket = Awaited<ReturnType<typeof getChangeRequestsList>>['data'][number];

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
  const tab = normalizeMyTicketsTab(current.get('tab'));
  const activeConfig = getMyTicketsTabConfig(tab);

  const ctx: OwnershipContext = {
    role: session.user.role,
    email: session.user.email,
  };

  const [incidents, requests, changes] = await Promise.all([
    getIncidentsList(sp, ctx),
    getServiceRequestsList(sp, ctx),
    getChangeRequestsList(sp, ctx),
  ]);

  const counts: Record<MyTicketsTab, number> = {
    incidents: incidents.count,
    requests: requests.count,
    change: changes.count,
  };
  const active =
    tab === 'incidents' ? incidents : tab === 'requests' ? requests : changes;
  const total = Math.max(1, Math.ceil(active.count / PAGE_SIZE));

  return (
    <>
      <SiteHeader title="My tickets" />
      <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col gap-4 p-4 md:gap-5 md:p-6">
        <div className="flex flex-col gap-3 border-b border-[color:var(--relay-border-soft)] pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground md:text-2xl">
              My tickets
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Everything you have raised with IT.
            </p>
          </div>
          <Button
            render={
              <Link href={activeConfig.newHref}>
                <PlusIcon className="size-4" />
                New ticket
              </Link>
            }
          />
        </div>

        <Card>
          <CardContent className="flex flex-wrap gap-1.5 pt-4">
            {MY_TICKETS_TABS.map((item) => (
              <FilterChip
                key={item.value}
                active={tab === item.value}
                render={
                  <Link
                    href={buildHref(current, { tab: item.value, page: null })}
                    className="gap-2"
                  >
                    <span>{item.label}</span>
                    <span className="rounded-full bg-[color:var(--relay-bg-soft)] px-2 py-0.5 text-xs">
                      {counts[item.value]}
                    </span>
                  </Link>
                }
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>{activeConfig.label}</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {active.count} {active.count === 1 ? 'ticket' : 'tickets'} · Page{' '}
                {active.page} of {total}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {active.count === 0 ? (
              <EmptyTicketsState config={activeConfig} />
            ) : tab === 'incidents' ? (
              <TicketCardList>
                {incidents.data.map((ticket) => (
                  <IncidentTicketCard key={ticket.id} ticket={ticket} />
                ))}
              </TicketCardList>
            ) : tab === 'requests' ? (
              <TicketCardList>
                {requests.data.map((ticket) => (
                  <RequestTicketCard key={ticket.id} ticket={ticket} />
                ))}
              </TicketCardList>
            ) : (
              <TicketCardList>
                {changes.data.map((ticket) => (
                  <ChangeTicketCard key={ticket.id} ticket={ticket} />
                ))}
              </TicketCardList>
            )}
          </CardContent>
        </Card>

        <Pagination page={active.page} total={total} current={current} />
      </div>
    </>
  );
}

function TicketCardList({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}

function IncidentTicketCard({ ticket }: { ticket: IncidentTicket }) {
  return (
    <RequesterTicketCard
      href={getMyTicketDetailHref('incidents', ticket.id)}
      id={`#${ticket.id}`}
      summary={ticket.summary}
      status={<StatusPill status={ticket.status} />}
      badge={<PriorityBadge priority={ticket.priority} compact />}
      createdAt={ticket.createdAt}
      updatedAt={ticket.updatedAt}
      owner={ticket.owner}
      side={
        isRequesterTerminalStatus(ticket.status) ? null : (
          <SlaBadge deadline={ticket.deadline} status={ticket.status} />
        )
      }
    />
  );
}

function RequestTicketCard({ ticket }: { ticket: RequestTicket }) {
  return (
    <RequesterTicketCard
      href={getMyTicketDetailHref('requests', ticket.id)}
      id={`#${ticket.id}`}
      summary={ticket.summary}
      status={<StatusPill status={ticket.status} />}
      badge={<PriorityBadge priority={ticket.priority} compact />}
      createdAt={ticket.createdAt}
      updatedAt={ticket.updatedAt}
      owner={ticket.owner}
      side={
        isRequesterTerminalStatus(ticket.status) ? null : (
          <SlaBadge deadline={ticket.deadline} status={ticket.status} />
        )
      }
    />
  );
}

function ChangeTicketCard({ ticket }: { ticket: ChangeTicket }) {
  return (
    <RequesterTicketCard
      href={getMyTicketDetailHref('change', ticket.id)}
      id={`#${ticket.id}`}
      summary={ticket.summary}
      status={<StatusPill status={ticket.status} />}
      badge={<ClassificationBadge classification={ticket.classification} />}
      createdAt={ticket.createdAt}
      updatedAt={ticket.updatedAt}
      owner={ticket.owner}
      side={
        <span className="text-xs font-medium capitalize text-muted-foreground">
          {ticket.category}
        </span>
      }
    />
  );
}

function RequesterTicketCard({
  href,
  id,
  summary,
  status,
  badge,
  createdAt,
  updatedAt,
  owner,
  side,
}: {
  href: string;
  id: string;
  summary: string;
  status: ReactNode;
  badge: ReactNode;
  createdAt: Date;
  updatedAt: Date;
  owner: string | null;
  side: ReactNode;
}) {
  return (
    <Link href={href} className="group block">
      <Card className="transition group-hover:border-[color:var(--relay-border-strong)]">
        <CardContent className="flex gap-4 p-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-muted-foreground">
                {id}
              </span>
              {status}
              {badge}
            </div>
            <h2 className="line-clamp-2 text-sm font-semibold text-foreground">
              {summary}
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Raised {formatDistanceToNow(createdAt, { addSuffix: true })}
              {owner ? (
                <>
                  {' '}
                  · being looked at by{' '}
                  <span className="font-medium text-foreground">{owner}</span>
                </>
              ) : (
                ' · waiting to be assigned'
              )}
              {' '}· updated {format(updatedAt, 'PP')}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end justify-between gap-2">
            {side}
            <ChevronRightIcon className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyTicketsState({
  config,
}: {
  config: ReturnType<typeof getMyTicketsTabConfig>;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-[color:var(--relay-bg-soft)] text-muted-foreground">
        <InboxIcon className="size-5" />
      </span>
      <div>
        <h2 className="text-sm font-semibold text-foreground">{config.emptyTitle}</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{config.emptyHint}</p>
      </div>
      <Button
        render={
          <Link href={config.newHref}>
            <PlusIcon className="size-4" />
            Raise a ticket
          </Link>
        }
      />
    </div>
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
                <ArrowLeftIcon className="size-3.5" />
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
              <Link href={buildHref(current, { page: String(page + 1) })}>
                Next
                <ArrowRightIcon className="size-3.5" />
              </Link>
            }
          />
        ) : null}
      </div>
    </div>
  );
}
