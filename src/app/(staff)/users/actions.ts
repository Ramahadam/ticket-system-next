'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/permissions';
import {
  userCreateSchema,
  userUpdateSchema,
} from '@/lib/validation/users';
import type { Prisma, UserRole } from '@/generated/prisma/client';

function formDataToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value !== 'string') continue;
    obj[key] = value;
  }
  return obj;
}

export async function createUserAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    throw new Error('Forbidden');
  }

  const parsed = userCreateSchema.parse(formDataToObject(formData));

  const existing = await prisma.user.findUnique({
    where: { email: parsed.email },
    select: { id: true },
  });
  if (existing) throw new Error('A user with that email already exists');

  const passwordHash = await bcrypt.hash(parsed.password, 12);

  const created = await prisma.user.create({
    data: {
      email: parsed.email,
      passwordHash,
      firstname: parsed.firstname ?? null,
      lastname: parsed.lastname ?? null,
      mobile: parsed.mobile ?? null,
      userrole: parsed.userrole as UserRole,
    },
    select: { id: true },
  });

  revalidatePath('/users');
  redirect(`/users/${created.id}`);
}

export async function updateUserAction(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    throw new Error('Forbidden');
  }

  const parsed = userUpdateSchema.parse(formDataToObject(formData));

  const data: Prisma.UserUpdateInput = {};
  if (parsed.firstname !== undefined) data.firstname = parsed.firstname;
  if (parsed.lastname !== undefined) data.lastname = parsed.lastname;
  if (parsed.mobile !== undefined) data.mobile = parsed.mobile;
  if (parsed.userrole !== undefined) data.userrole = parsed.userrole as UserRole;
  if (parsed.isActive !== undefined) data.isActive = parsed.isActive;
  if (parsed.password) data.passwordHash = await bcrypt.hash(parsed.password, 12);

  await prisma.user.update({ where: { id }, data });

  revalidatePath('/users');
  revalidatePath(`/users/${id}`);
}

export async function deleteUserAction(id: string) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    throw new Error('Forbidden');
  }
  if (session.user.id === id) {
    throw new Error('You cannot delete your own account');
  }

  await prisma.user.delete({ where: { id } });

  revalidatePath('/users');
  redirect('/users');
}
