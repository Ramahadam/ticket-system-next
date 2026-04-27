import { redirect } from 'next/navigation';
import { auth  } from '@/auth';
import { isStaff } from '@/lib/permissions';

export default async function RootPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  redirect(isStaff(session.user.role) ? '/dashboard' : '/my-tickets');
}
