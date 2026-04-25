import { redirect } from 'next/navigation';
import { GalleryVerticalEndIcon } from 'lucide-react';

import { auth } from '@/auth';
import { isStaff } from '@/lib/permissions';
import { LoginForm } from '@/components/login-form';

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect(isStaff(session.user.role) ? '/dashboard' : '/my-tickets');
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <span className="flex items-center gap-2 font-medium">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEndIcon className="size-4" />
            </span>
            Ticket System
          </span>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block" />
    </div>
  );
}
