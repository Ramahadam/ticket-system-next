import { addDays, addHours, format } from 'date-fns';
import * as XLSX from 'xlsx';
import { PRIORITY, priorityToString, TICKET_STATUS } from './constants';

export function calculateDeadline(priority: number): Date | undefined {
  const now = new Date();
  if (priority === PRIORITY.HIGH) return addHours(now, 4);
  if (priority === PRIORITY.MEDIUM) return addDays(now, 1);
  if (priority === PRIORITY.NORMAL) return addDays(now, 3);
  if (priority === PRIORITY.LOW) return addDays(now, 4);
  return undefined;
}

export function convertPriorityToString(priority: number): string {
  return priorityToString(priority);
}

export type TicketNote = {
  noteId: string | number;
  noteValue: string | undefined;
  createBy: string;
  createdAt: Date;
};

export function createNotes(
  data: { notes?: string; engineer: string },
  uniqID: string | number,
): TicketNote[] {
  return [
    {
      noteId: uniqID,
      noteValue: data.notes,
      createBy: data.engineer,
      createdAt: new Date(),
    },
  ];
}

export function replaceFileFormats(str: string): string {
  return str.replace(/\b(.pdf|.jpg|.jpeg)\b/gi, '');
}

type TicketWithStatus = { status: string; owner?: string | null };

export function getTicketStatusCounts(tickets: TicketWithStatus[] | undefined | null) {
  if (!tickets || tickets.length === 0) return undefined;

  const isChangeRequest =
    tickets[0] && Object.prototype.hasOwnProperty.call(tickets[0], 'owner');

  if (!isChangeRequest) {
    const count = (s: string) => tickets.filter((t) => t.status === s).length;
    return [
      { name: 'fulfilled', total: count(TICKET_STATUS.FULFILLED) },
      { name: 'in progress', total: count(TICKET_STATUS.PROGRESS) },
      { name: 'logged', total: count(TICKET_STATUS.LOGGED) },
      { name: 'on hold', total: count(TICKET_STATUS.HOLD) },
      { name: 'canceled', total: count(TICKET_STATUS.CANCELED) },
    ];
  }

  const count = (s: string) => tickets.filter((t) => t.status === s).length;
  return [
    { name: 'requested', total: count('requested') },
    { name: 'approved', total: count('approved') },
    { name: 'canceled', total: count('cancelled') },
  ];
}

export function exportToExcel(data: Record<string, unknown>[], filename = 'Export') {
  const finalFilename = `${filename}-${format(new Date(), 'dd-MM-HH-mm-ss')}.xlsx`;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, finalFilename);
}

export function mergeNotes(
  existing: TicketNote[] | null | undefined,
  incoming: TicketNote | null | undefined,
): TicketNote[] {
  if (!incoming) return existing ?? [];
  return existing ? [...existing, incoming] : [incoming];
}
