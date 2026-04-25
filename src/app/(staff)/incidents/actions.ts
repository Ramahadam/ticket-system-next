'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isStaff } from '@/lib/permissions';
import {
  buildNoteEntry,
  calculateDeadline,
  mergeNotes,
  type TicketNote,
} from '@/lib/ticket-helpers';
import {
  incidentCreateSchema,
  ticketUpdateSchema,
} from '@/lib/validation/tickets';
import type { Prisma, TicketStatus } from '@/generated/prisma/client';

function formDataToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value !== 'string') continue;
    if (key === 'priority') obj[key] = Number(value);
    else obj[key] = value;
  }
  return obj;
}

export async function createIncidentAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const parsed = incidentCreateSchema.parse(formDataToObject(formData));

  const deadline = calculateDeadline(parsed.priority);
  const initialNote = parsed.noteValue
    ? [buildNoteEntry(parsed.noteValue, session.user.email)]
    : undefined;

  const created = await prisma.incident.create({
    data: {
      requester: session.user.email,
      summary: parsed.summary,
      description: parsed.description,
      priority: parsed.priority,
      impact: parsed.impact,
      owner: isStaff(session.user.role) ? parsed.owner ?? null : null,
      file: parsed.file ?? null,
      deadline,
      notes: initialNote as unknown as Prisma.InputJsonValue,
    },
    select: { id: true },
  });

  revalidatePath('/incidents');
  revalidatePath('/my-tickets');
  redirect(`/incidents/${created.id}`);
}

export async function updateIncidentAction(id: number, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const parsed = ticketUpdateSchema.parse(formDataToObject(formData));

  const existing = await prisma.incident.findUnique({
    where: { id },
    select: { requester: true, notes: true },
  });
  if (!existing) throw new Error('Incident not found');
  const isOwner = existing.requester === session.user.email;
  if (!isStaff(session.user.role) && !isOwner) {
    throw new Error('Forbidden');
  }

  const data: Prisma.IncidentUpdateInput = {};
  if (parsed.status !== undefined && isStaff(session.user.role)) {
    data.status = parsed.status as TicketStatus;
  }
  if (parsed.owner !== undefined && isStaff(session.user.role)) {
    data.owner = parsed.owner ?? null;
  }
  if (parsed.priority !== undefined && isStaff(session.user.role)) {
    data.priority = parsed.priority;
    data.deadline = calculateDeadline(parsed.priority);
  }
  if (parsed.impact !== undefined && isStaff(session.user.role)) {
    data.impact = parsed.impact;
  }
  if (parsed.file !== undefined) data.file = parsed.file;
  if (parsed.noteValue) {
    const note = buildNoteEntry(parsed.noteValue, session.user.email);
    const existingNotes = (existing.notes ?? []) as unknown as TicketNote[];
    data.notes = mergeNotes(existingNotes, note) as unknown as Prisma.InputJsonValue;
  }

  await prisma.incident.update({ where: { id }, data });

  revalidatePath('/incidents');
  revalidatePath(`/incidents/${id}`);
  revalidatePath('/my-tickets');
}

export async function deleteIncidentAction(id: number) {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    throw new Error('Forbidden');
  }

  await prisma.incident.delete({ where: { id } });

  revalidatePath('/incidents');
  redirect('/incidents');
}
