import type { TicketNote } from './ticket-helpers';

export type TicketActivityEvent = {
  id: string;
  actor: string;
  at: Date;
  label: string;
  body?: string;
};

export function buildTicketActivity({
  createdAt,
  requester,
  notes,
}: {
  createdAt: Date;
  requester: string;
  notes: TicketNote[];
}): TicketActivityEvent[] {
  const noteEvents = notes
    .map((note) => ({
      id: `note-${String(note.noteId)}`,
      actor: note.createBy,
      at: new Date(note.createdAt),
      label: 'added a note',
      body: note.noteValue,
    }))
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  return [
    {
      id: 'created',
      actor: requester,
      at: createdAt,
      label: 'created the ticket',
      body: undefined,
    },
    ...noteEvents,
  ];
}
