import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { isStaff, isAdmin } from '@/lib/permissions';

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  return session;
}

export async function requireStaff() {
  const session = await requireUser();
  if (!isStaff(session.user.role)) redirect('/my-tickets');
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (!isAdmin(session.user.role)) redirect('/dashboard');
  return session;
}
