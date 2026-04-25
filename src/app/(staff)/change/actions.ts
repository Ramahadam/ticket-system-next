'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isStaff } from '@/lib/permissions';
import {
  buildNoteEntry,
  mergeNotes,
  type TicketNote,
} from '@/lib/ticket-helpers';
import {
  changeRequestCreateSchema,
  changeRequestUpdateSchema,
} from '@/lib/validation/change-requests';
import type { Prisma, ChangeCategory, ChangeStatus } from '@/generated/prisma/client';

function formDataToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value !== 'string') continue;
    if (key === 'classification') obj[key] = Number(value);
    else obj[key] = value;
  }
  return obj;
}

export async function createChangeRequestAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const parsed = changeRequestCreateSchema.parse(formDataToObject(formData));

  const initialNote = parsed.noteValue
    ? [buildNoteEntry(parsed.noteValue, session.user.email)]
    : undefined;

  const created = await prisma.changeRequest.create({
    data: {
      requester: session.user.email,
      summary: parsed.summary,
      description: parsed.description,
      category: parsed.category as ChangeCategory,
      classification: parsed.classification,
      rollback_plan: parsed.rollback_plan,
      owner: isStaff(session.user.role) ? parsed.owner ?? null : null,
      file: parsed.file ?? null,
      notes: initialNote as unknown as Prisma.InputJsonValue,
    },
    select: { id: true },
  });

  revalidatePath('/change');
  revalidatePath('/my-tickets');
  redirect(`/change/${created.id}`);
}

export async function updateChangeRequestAction(id: number, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const parsed = changeRequestUpdateSchema.parse(formDataToObject(formData));

  const existing = await prisma.changeRequest.findUnique({
    where: { id },
    select: { requester: true, notes: true },
  });
  if (!existing) throw new Error('Change request not found');
  const isOwner = existing.requester === session.user.email;
  if (!isStaff(session.user.role) && !isOwner) {
    throw new Error('Forbidden');
  }

  const data: Prisma.ChangeRequestUpdateInput = {};
  if (parsed.status !== undefined && isStaff(session.user.role)) {
    data.status = parsed.status as ChangeStatus;
  }
  if (parsed.owner !== undefined && isStaff(session.user.role)) {
    data.owner = parsed.owner ?? null;
  }
  if (parsed.classification !== undefined && isStaff(session.user.role)) {
    data.classification = parsed.classification;
  }
  if (parsed.category !== undefined && isStaff(session.user.role)) {
    data.category = parsed.category as ChangeCategory;
  }
  if (parsed.rollback_plan !== undefined && isStaff(session.user.role)) {
    data.rollback_plan = parsed.rollback_plan;
  }
  if (parsed.file !== undefined) data.file = parsed.file;
  if (parsed.noteValue) {
    const note = buildNoteEntry(parsed.noteValue, session.user.email);
    const existingNotes = (existing.notes ?? []) as unknown as TicketNote[];
    data.notes = mergeNotes(existingNotes, note) as unknown as Prisma.InputJsonValue;
  }

  await prisma.changeRequest.update({ where: { id }, data });

  revalidatePath('/change');
  revalidatePath(`/change/${id}`);
  revalidatePath('/my-tickets');
}

export async function deleteChangeRequestAction(id: number) {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    throw new Error('Forbidden');
  }

  await prisma.changeRequest.delete({ where: { id } });

  revalidatePath('/change');
  redirect('/change');
}
