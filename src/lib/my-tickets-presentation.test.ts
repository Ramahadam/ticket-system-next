import { describe, expect, it } from 'vitest';

import {
  getMyTicketDetailHref,
  getMyTicketsTabConfig,
  isRequesterTerminalStatus,
  normalizeMyTicketsTab,
} from './my-tickets-presentation';

describe('my tickets presentation helpers', () => {
  it('normalizes unknown tab values to incidents', () => {
    expect(normalizeMyTicketsTab(null)).toBe('incidents');
    expect(normalizeMyTicketsTab('bad-tab')).toBe('incidents');
    expect(normalizeMyTicketsTab('requests')).toBe('requests');
  });

  it('builds requester detail hrefs for each tab', () => {
    expect(getMyTicketDetailHref('incidents', 12)).toBe('/my-tickets/incidents/12');
    expect(getMyTicketDetailHref('requests', 12)).toBe('/my-tickets/requests/12');
    expect(getMyTicketDetailHref('change', 12)).toBe('/my-tickets/change/12');
  });

  it('identifies statuses that no longer need an SLA chip for requesters', () => {
    expect(isRequesterTerminalStatus('fulfilled')).toBe(true);
    expect(isRequesterTerminalStatus('implemented')).toBe(true);
    expect(isRequesterTerminalStatus('in_progress')).toBe(false);
  });

  it('returns empty-state copy and create href for the active tab', () => {
    const config = getMyTicketsTabConfig('change');
    expect(config.emptyTitle).toBe('No changes yet');
    expect(config.newHref).toBe('/my-tickets/change/new');
  });
});
