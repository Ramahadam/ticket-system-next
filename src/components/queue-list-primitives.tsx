import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ListFilterIcon,
  PlusIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  UserRoundIcon,
} from 'lucide-react';

import { FilterChip } from '@/components/ticket-primitives';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { QueueOwnerFilter, QueueSort, QueueState } from '@/lib/queue-list-params';

type HrefFor = (patch: Record<string, string | null>) => string;

export function QueuePageHeader({
  eyebrow,
  title,
  subtitle,
  newHref,
  newLabel,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  newHref: string;
  newLabel: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[color:var(--relay-border-soft)] pb-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase text-[color:var(--relay-accent-text)]">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-xl font-semibold text-foreground md:text-2xl">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <Button
        render={
          <Link href={newHref}>
            <PlusIcon className="size-4" />
            {newLabel}
          </Link>
        }
      />
    </div>
  );
}

export function QueueFilterPanel({
  currentState,
  currentLevel,
  currentOwner,
  currentSort,
  currentSearch,
  hrefFor,
  action,
  levelLabel,
  levelOptions,
  showDeadlineSort = true,
}: {
  currentState: QueueState;
  currentLevel?: number;
  currentOwner: QueueOwnerFilter;
  currentSort: QueueSort;
  currentSearch?: string;
  hrefFor: HrefFor;
  action: string;
  levelLabel: string;
  levelOptions: { value: string; label: string }[];
  showDeadlineSort?: boolean;
}) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-4">
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: 'open', label: 'Open' },
            { value: 'closed', label: 'Closed' },
            { value: 'all', label: 'All' },
          ].map((tab) => (
            <FilterChip
              key={tab.value}
              active={currentState === tab.value}
              render={
                <Link href={hrefFor({ state: tab.value, page: null })}>
                  {tab.label}
                </Link>
              }
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form action={action} className="relative min-w-64 flex-1 sm:max-w-sm">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input type="hidden" name="state" value={currentState} />
            <input type="hidden" name="owner" value={currentOwner} />
            <input type="hidden" name="sort" value={currentSort} />
            {currentLevel ? <input type="hidden" name="level" value={String(currentLevel)} /> : null}
            <input
              name="q"
              defaultValue={currentSearch ?? ''}
              placeholder="Search by ID or summary..."
              className="h-[34px] w-full rounded-lg border border-border bg-card pl-9 pr-3 text-[13px] outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20"
            />
          </form>

          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <ListFilterIcon className="size-3.5" />
              {levelLabel}
            </div>
            <FilterChip
              active={!currentLevel}
              render={<Link href={hrefFor({ level: null, page: null })}>All</Link>}
            />
            {levelOptions.map((option) => (
              <FilterChip
                key={option.value}
                active={String(currentLevel ?? '') === option.value}
                render={
                  <Link href={hrefFor({ level: option.value, page: null })}>
                    {option.label}
                  </Link>
                }
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <UserRoundIcon className="size-3.5" />
              Owner
            </div>
            {[
              { value: 'all', label: 'All owners' },
              { value: 'me', label: 'Assigned to me' },
              { value: 'unassigned', label: 'Unassigned' },
            ].map((option) => (
              <FilterChip
                key={option.value}
                active={currentOwner === option.value}
                render={
                  <Link
                    href={hrefFor({
                      owner: option.value === 'all' ? null : option.value,
                      page: null,
                    })}
                  >
                    {option.label}
                  </Link>
                }
              />
            ))}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <SlidersHorizontalIcon className="size-3.5" />
              Sort
            </div>
            {[
              { value: 'priority', label: levelLabel },
              ...(showDeadlineSort ? [{ value: 'deadline', label: 'SLA deadline' }] : []),
              { value: 'created', label: 'Most recent' },
            ].map((option) => (
              <FilterChip
                key={option.value}
                active={currentSort === option.value}
                render={
                  <Link href={hrefFor({ sort: option.value, page: null })}>
                    {option.label}
                  </Link>
                }
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function QueueResultsCard({
  title,
  count,
  totalPages,
  page,
  pageSize,
  empty,
  children,
}: {
  title: string;
  count: number;
  totalPages: number;
  page: number;
  pageSize: number;
  empty: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Showing {count} {count === 1 ? 'ticket' : 'tickets'} · Page {page} of {totalPages} · {pageSize} rows per page
          </p>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {count === 0 ? <p className="text-sm text-muted-foreground">{empty}</p> : children}
      </CardContent>
    </Card>
  );
}

export function QueuePagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: HrefFor;
}) {
  if (totalPages <= 1) return null;

  return (
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
              <Link href={hrefFor({ page: String(page - 1) })}>
                <ArrowLeftIcon className="size-3.5" />
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
              <Link href={hrefFor({ page: String(page + 1) })}>
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
