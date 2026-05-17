import { describe, expect, it } from 'vitest';

import { buildTicketActivity } from './ticket-activity';

describe('ticket activity presentation', () => {
  it('starts with the ticket-created event', () => {
    const events = buildTicketActivity({
      createdAt: new Date('2026-05-16T08:00:00.000Z'),
      requester: 'sam@example.com',
      notes: [],
    });

    expect(events).toEqual([
      {
        id: 'created',
        actor: 'sam@example.com',
        at: new Date('2026-05-16T08:00:00.000Z'),
        label: 'created the ticket',
        body: undefined,
      },
    ]);
  });

  it('maps notes into chronological activity events after creation', () => {
    const events = buildTicketActivity({
      createdAt: new Date('2026-05-16T08:00:00.000Z'),
      requester: 'sam@example.com',
      notes: [
        {
          noteId: 'n2',
          noteValue: 'Second update',
          createBy: 'analyst@example.com',
          createdAt: new Date('2026-05-16T10:00:00.000Z'),
        },
        {
          noteId: 'n1',
          noteValue: 'First update',
          createBy: 'sam@example.com',
          createdAt: new Date('2026-05-16T09:00:00.000Z'),
        },
      ],
    });

    expect(
      events.map((event) => [event.id, event.actor, event.label, event.body]),
    ).toEqual([
      ['created', 'sam@example.com', 'created the ticket', undefined],
      ['note-n1', 'sam@example.com', 'added a note', 'First update'],
      ['note-n2', 'analyst@example.com', 'added a note', 'Second update'],
    ]);
  });
});
