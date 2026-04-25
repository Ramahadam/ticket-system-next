'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const profileUpdateSchema = z.object({
  firstname: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  lastname: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  mobile: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  password: z
    .string()
    .optional()
    .transform((v) => (v && v.length >= 8 ? v : undefined)),
});

function formDataToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') obj[key] = value;
  }
  return obj;
}

export async function updateProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const parsed = profileUpdateSchema.parse(formDataToObject(formData));

  const data: Parameters<typeof prisma.user.update>[0]['data'] = {};
  if (parsed.firstname !== undefined) data.firstname = parsed.firstname;
  if (parsed.lastname !== undefined) data.lastname = parsed.lastname;
  if (parsed.mobile !== undefined) data.mobile = parsed.mobile;
  if (parsed.password) data.passwordHash = await bcrypt.hash(parsed.password, 12);

  await prisma.user.update({ where: { id: session.user.id }, data });

  revalidatePath('/profile');
}
