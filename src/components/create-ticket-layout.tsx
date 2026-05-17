import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  ClipboardListIcon,
  GitPullRequestArrowIcon,
  PaperclipIcon,
  RouteIcon,
} from 'lucide-react';

import {
  getCreateTicketBackHref,
  getCreateTicketKindLabels,
  getCreateTicketNav,
  type TicketCreateKind,
  type TicketCreateScope,
} from '@/lib/create-ticket-routes';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const KIND_ICONS = {
  incident: AlertTriangleIcon,
  request: ClipboardListIcon,
  change: GitPullRequestArrowIcon,
} satisfies Record<TicketCreateKind, typeof AlertTriangleIcon>;

export function CreateTicketLayout({
  scope,
  kind,
  submitter,
  children,
}: {
  scope: TicketCreateScope;
  kind: TicketCreateKind;
  submitter: string;
  children: ReactNode;
}) {
  const labels = getCreateTicketKindLabels(kind);
  const backHref = getCreateTicketBackHref(scope, kind);
  const backLabel = scope === 'user' ? 'Back to my tickets' : `Back to ${kind === 'change' ? 'changes' : kind === 'request' ? 'requests' : 'incidents'}`;

  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-1 flex-col gap-5 p-4 md:p-6">
      <div className="flex flex-col gap-3 border-b border-[color:var(--relay-border-soft)] pb-4">
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
        <div>
          <h1 className="text-xl font-semibold text-foreground md:text-2xl">
            Raise a ticket
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {labels.eyebrow}
          </p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <div className="space-y-4">
          <CreateKindSwitcher scope={scope} activeKind={kind} />

          <Card>
            <CardHeader>
              <CardTitle>{labels.formTitle}</CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-[calc(var(--relay-topbar-h)+24px)]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RouteIcon className="size-4 text-muted-foreground" />
                Routing analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl>
                <CreateRailRow label="Queue">{labels.title}</CreateRailRow>
                <CreateRailRow label="Route">
                  <Badge variant="secondary">{labels.analysisLabel}</Badge>
                </CreateRailRow>
                <CreateRailRow label="Requester">{submitter}</CreateRailRow>
                <CreateRailRow label="Evidence" last>
                  Summary, description, classification fields
                </CreateRailRow>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PaperclipIcon className="size-4 text-muted-foreground" />
                Submission package
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl>
                <CreateRailRow label="Primary">Summary and description</CreateRailRow>
                <CreateRailRow label="Optional">Initial note</CreateRailRow>
                <CreateRailRow label="Files" last>
                  PNG, JPG, WebP, PDF, or text
                </CreateRailRow>
              </dl>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function CreateKindSwitcher({
  scope,
  activeKind,
}: {
  scope: TicketCreateScope;
  activeKind: TicketCreateKind;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-3">
          {getCreateTicketNav(scope).map((item) => {
            const Icon = KIND_ICONS[item.kind];
            const active = item.kind === activeKind;
            return (
              <Link
                key={item.kind}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'min-h-[112px] rounded-lg border border-[color:var(--relay-border-soft)] bg-card p-4 text-left transition hover:border-[color:var(--relay-border-strong)]',
                  active && 'border-[color:var(--relay-accent)] bg-[color:var(--relay-accent-soft)] shadow-[0_0_0_3px_var(--relay-accent-soft)]'
                )}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Icon className={cn('size-4 text-muted-foreground', active && 'text-[color:var(--relay-accent)]')} />
                  {item.title}
                </span>
                <span className="mt-2 block text-xs font-medium text-muted-foreground">
                  {item.eyebrow}
                </span>
                <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                  {item.hint}
                </span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function CreateRailRow({
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
        'grid grid-cols-[86px_minmax(0,1fr)] items-center gap-3 py-3',
        !last && 'border-b border-[color:var(--relay-border-soft)]'
      )}
    >
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-sm text-foreground">{children}</dd>
    </div>
  );
}
