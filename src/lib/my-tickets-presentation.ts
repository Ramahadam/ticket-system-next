export type MyTicketsTab = 'incidents' | 'requests' | 'change';

export const MY_TICKETS_TABS: {
  value: MyTicketsTab;
  label: string;
  emptyTitle: string;
  emptyHint: string;
  newHref: string;
}[] = [
  {
    value: 'incidents',
    label: 'Incidents',
    emptyTitle: 'No incidents yet',
    emptyHint: 'Broken services, access problems, and equipment issues will appear here.',
    newHref: '/my-tickets/incidents/new',
  },
  {
    value: 'requests',
    label: 'Requests',
    emptyTitle: 'No requests yet',
    emptyHint: 'Access, software, hardware, and other service requests will appear here.',
    newHref: '/my-tickets/requests/new',
  },
  {
    value: 'change',
    label: 'Changes',
    emptyTitle: 'No changes yet',
    emptyHint: 'Planned modifications and approval-driven changes will appear here.',
    newHref: '/my-tickets/change/new',
  },
];

export function normalizeMyTicketsTab(raw: string | null): MyTicketsTab {
  return raw === 'requests' || raw === 'change' ? raw : 'incidents';
}

export function getMyTicketsTabConfig(tab: MyTicketsTab) {
  return MY_TICKETS_TABS.find((item) => item.value === tab) ?? MY_TICKETS_TABS[0];
}

export function getMyTicketDetailHref(tab: MyTicketsTab, id: number) {
  if (tab === 'change') return `/my-tickets/change/${id}`;
  if (tab === 'requests') return `/my-tickets/requests/${id}`;
  return `/my-tickets/incidents/${id}`;
}

export function isRequesterTerminalStatus(status: string) {
  return ['closed', 'fulfilled', 'implemented', 'canceled', 'cancelled'].includes(
    status.toLowerCase(),
  );
}
