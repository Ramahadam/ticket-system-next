export type TicketCreateKind = 'incident' | 'request' | 'change';
export type TicketCreateScope = 'staff' | 'user';

const KIND_LABELS: Record<
  TicketCreateKind,
  {
    title: string;
    eyebrow: string;
    hint: string;
    formTitle: string;
    analysisLabel: string;
  }
> = {
  incident: {
    title: 'Incident',
    eyebrow: 'Something is broken',
    hint: 'Outage, degraded service, access problem, or failed equipment.',
    formTitle: 'Incident details',
    analysisLabel: 'Break/fix route',
  },
  request: {
    title: 'Service request',
    eyebrow: 'Something is needed',
    hint: 'Access, hardware, software, fulfilment, or standard service.',
    formTitle: 'Request details',
    analysisLabel: 'Fulfilment route',
  },
  change: {
    title: 'Change request',
    eyebrow: 'Something will change',
    hint: 'Planned modification with classification and rollback context.',
    formTitle: 'Change details',
    analysisLabel: 'Approval route',
  },
};

export function getCreateTicketHref(
  scope: TicketCreateScope,
  kind: TicketCreateKind,
) {
  if (scope === 'user') {
    const segment = kind === 'incident' ? 'incidents' : kind === 'request' ? 'requests' : 'change';
    return `/my-tickets/${segment}/new`;
  }
  if (kind === 'request') return '/requests/new';
  if (kind === 'change') return '/change/new';
  return '/incidents/new';
}

export function getCreateTicketBackHref(scope: TicketCreateScope, kind: TicketCreateKind) {
  if (scope === 'user') {
    const tab = kind === 'request' ? 'requests' : kind === 'change' ? 'change' : 'incidents';
    return `/my-tickets?tab=${tab}`;
  }
  if (kind === 'request') return '/requests';
  if (kind === 'change') return '/change';
  return '/incidents';
}

export function getCreateTicketKindLabels(kind: TicketCreateKind) {
  return KIND_LABELS[kind];
}

export function getCreateTicketNav(scope: TicketCreateScope) {
  return (Object.keys(KIND_LABELS) as TicketCreateKind[]).map((kind) => ({
    kind,
    href: getCreateTicketHref(scope, kind),
    ...KIND_LABELS[kind],
  }));
}
