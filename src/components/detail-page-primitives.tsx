import { format } from 'date-fns';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeftIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { TicketActivityEvent } from '@/lib/ticket-activity';
import type { TicketNote } from '@/lib/ticket-helpers';
import { cn } from '@/lib/utils';

export function DetailPageFrame({
  children,
  rail,
}: {
  children: ReactNode;
  rail: ReactNode;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
      <div className="space-y-4">{children}</div>
      <aside className="space-y-4 xl:sticky xl:top-[calc(var(--relay-topbar-h)+24px)]">
        {rail}
      </aside>
    </div>
  );
}

export function DetailPageHeader({
  backHref,
  backLabel,
  id,
  title,
  subtitle,
  badges,
  actions,
}: {
  backHref: string;
  backLabel: string;
  id: string;
  title: string;
  subtitle: ReactNode;
  badges: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[color:var(--relay-border-soft)] pb-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <Button
          variant="ghost"
          size="sm"
          render={
            <Link href={backHref}>
              <ArrowLeftIcon className="size-3.5" />
              {backLabel}
            </Link>
          }
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm text-muted-foreground">{id}</span>
          {badges}
        </div>
        <h1 className="mt-3 max-w-4xl text-xl font-semibold text-foreground md:text-2xl">
          {title}
        </h1>
        <div className="mt-2 text-sm text-muted-foreground">{subtitle}</div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function DetailFact({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-lg border border-[color:var(--relay-border-soft)] bg-card p-3', className)}>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 min-w-0 break-words text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function DetailRailRow({
  label,
  children,
  last = false,
}: {
  label: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-[92px_minmax(0,1fr)] items-center gap-3 py-3',
        !last && 'border-b border-[color:var(--relay-border-soft)]'
      )}
    >
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-sm text-foreground">{children}</dd>
    </div>
  );
}

export function TextBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase text-muted-foreground">{title}</h3>
      <div className="rounded-lg border border-[color:var(--relay-border-soft)] bg-[color:var(--relay-bg-soft)] p-3 text-sm leading-6 whitespace-pre-wrap break-words">
        {children}
      </div>
    </section>
  );
}

export function NotesCard({ notes }: { notes: TicketNote[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes ({notes.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        ) : (
          <ol className="relative flex flex-col gap-3 before:absolute before:bottom-3 before:left-[7px] before:top-3 before:w-px before:bg-[color:var(--relay-border-soft)]">
            {notes.map((n) => (
              <li key={String(n.noteId)} className="relative pl-6 text-sm">
                <span className="absolute left-0 top-1.5 size-3.5 rounded-full border-2 border-card bg-[color:var(--relay-accent)]" />
                <div className="rounded-lg border border-[color:var(--relay-border-soft)] bg-card p-3">
                  <div className="mb-1 text-xs text-muted-foreground">
                    {n.createBy} · {format(new Date(n.createdAt), 'PPp')}
                  </div>
                  <div className="whitespace-pre-wrap">{n.noteValue}</div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

export function ActivityCard({ events }: { events: TicketActivityEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col">
          {events.map((event, index) => (
            <li
              key={event.id}
              className={cn(
                'grid grid-cols-[28px_minmax(0,1fr)] gap-3 py-3 text-sm',
                index < events.length - 1 && 'border-b border-dashed border-[color:var(--relay-border-soft)]'
              )}
            >
              <span className="flex justify-center pt-1.5">
                <span className="size-2 rounded-full bg-[color:var(--relay-border-strong)]" />
              </span>
              <span className="min-w-0">
                <span className="font-medium text-foreground">{event.actor}</span>{' '}
                <span className="text-muted-foreground">{event.label}</span>
                <span className="ml-1 text-xs text-muted-foreground">
                  · {format(event.at, 'PPp')}
                </span>
                {event.body ? (
                  <span className="mt-2 block whitespace-pre-wrap break-words rounded-lg bg-[color:var(--relay-bg-soft)] p-3 text-sm text-foreground">
                    {event.body}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
