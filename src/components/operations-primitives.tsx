import Link from 'next/link';
import type { ReactNode } from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PriorityBadge, SlaBadge, StatusPill } from '@/components/ticket-primitives';
import type { AttentionItem, DashboardMetric, SlaSegments } from '@/lib/dashboard-presentation';
import { cn } from '@/lib/utils';

export function MetricCard({
  metric,
  icon,
  accentClassName,
}: {
  metric: DashboardMetric;
  icon: ReactNode;
  accentClassName?: string;
}) {
  return (
    <Link href={metric.href}>
      <Card className="h-full cursor-pointer transition-colors hover:bg-[color:var(--relay-hover)]">
        <CardContent className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-muted-foreground">{metric.label}</div>
            <div className="mt-2 text-3xl font-semibold leading-none tabular-nums">
              {metric.value}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">{metric.delta}</div>
          </div>
          <div className={cn('flex min-h-16 shrink-0 items-start justify-end', accentClassName)}>
            {metric.bars.length > 0 ? (
              <MiniBars values={metric.bars} />
            ) : (
              <div className="flex items-center gap-1.5 rounded-md bg-[color:var(--relay-bg-soft)] px-2 py-1 text-xs text-muted-foreground">
                {icon}
                No trend
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function MiniBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);

  return (
    <div className="flex h-14 items-end gap-1">
      {values.map((value, index) => (
        <span
          key={`${value}-${index}`}
          className="w-1.5 rounded-full bg-current opacity-70"
          style={{ height: `${Math.max(15, (value / max) * 56)}px` }}
        />
      ))}
    </div>
  );
}

export function SegmentedSlaBar({ segments }: { segments: SlaSegments }) {
  const total = Math.max(segments.total, 1);
  const widths = {
    onTrack: (segments.onTrack / total) * 100,
    dueSoon: (segments.dueSoon / total) * 100,
    breached: (segments.breached / total) * 100,
  };

  return (
    <div className="space-y-3">
      <div className="flex h-3 overflow-hidden rounded-full bg-[color:var(--relay-bg-soft)]">
        <span
          className="bg-[color:var(--relay-good)]"
          style={{ width: `${widths.onTrack}%` }}
        />
        <span
          className="bg-[color:var(--relay-warn)]"
          style={{ width: `${widths.dueSoon}%` }}
        />
        <span
          className="bg-[color:var(--relay-bad)]"
          style={{ width: `${widths.breached}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <Legend color="bg-[color:var(--relay-good)]" label={`${segments.onTrack} on track`} />
        <Legend color="bg-[color:var(--relay-warn)]" label={`${segments.dueSoon} approaching`} />
        <Legend color="bg-[color:var(--relay-bad)]" label={`${segments.breached} breached`} />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('size-2 rounded-full', color)} />
      {label}
    </span>
  );
}

export function AttentionList({ items }: { items: AttentionItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attention needed</CardTitle>
        <p className="text-xs text-muted-foreground">
          Real signals from SLA, priority, owner, and hold state.
        </p>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No urgent signals right now.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/incidents/${item.id}`}
                  className="grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg p-1 transition-colors hover:bg-[color:var(--relay-hover)]"
                >
                  <RequesterInitial email={item.requester} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{item.summary}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{item.reason}</span>
                      <span>·</span>
                      <span>{item.owner ?? 'Unassigned'}</span>
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1.5">
                    <PriorityBadge priority={item.priority} compact />
                    <SlaBadge deadline={item.deadline} status={item.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function RequesterInitial({ email }: { email: string }) {
  const initial = email.trim().charAt(0).toUpperCase() || '?';

  return (
    <span className="flex size-8 items-center justify-center rounded-full bg-[color:var(--relay-accent-soft)] text-xs font-semibold text-[color:var(--relay-accent-text)]">
      {initial}
    </span>
  );
}

export function StatusSummary({
  title,
  status,
  children,
}: {
  title: string;
  status: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[color:var(--relay-border-soft)] bg-card p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        {status}
      </div>
      {children}
    </div>
  );
}

export function CompactStatus({ status }: { status: string }) {
  return <StatusPill status={status} className="max-w-full" />;
}
