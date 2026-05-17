import { describe, expect, it } from 'vitest';

import {
  getCreateTicketBackHref,
  getCreateTicketHref,
  getCreateTicketKindLabels,
  getCreateTicketNav,
} from './create-ticket-routes';

describe('create ticket route helpers', () => {
  it('builds staff create routes from the active ticket kind', () => {
    expect(getCreateTicketHref('staff', 'incident')).toBe('/incidents/new');
    expect(getCreateTicketHref('staff', 'request')).toBe('/requests/new');
    expect(getCreateTicketHref('staff', 'change')).toBe('/change/new');
  });

  it('builds requester create routes under My Tickets', () => {
    expect(getCreateTicketHref('user', 'incident')).toBe(
      '/my-tickets/incidents/new',
    );
    expect(getCreateTicketHref('user', 'request')).toBe(
      '/my-tickets/requests/new',
    );
    expect(getCreateTicketHref('user', 'change')).toBe('/my-tickets/change/new');
  });

  it('returns the correct back target for each scope and kind', () => {
    expect(getCreateTicketBackHref('staff', 'change')).toBe('/change');
    expect(getCreateTicketBackHref('user', 'request')).toBe(
      '/my-tickets?tab=requests',
    );
  });

  it('exposes consistent labels for the create-kind selector', () => {
    const nav = getCreateTicketNav('staff');
    expect(nav.map((item) => item.kind)).toEqual([
      'incident',
      'request',
      'change',
    ]);
    expect(getCreateTicketKindLabels('change').analysisLabel).toBe(
      'Approval route',
    );
  });
});
