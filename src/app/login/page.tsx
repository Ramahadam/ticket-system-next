import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { isStaff } from '@/lib/permissions';
import { LoginForm } from '@/components/login-form';

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect(isStaff(session.user.role) ? '/dashboard' : '/my-tickets');
  }

  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-2">
      <div className="flex flex-col bg-card px-8 py-10 md:px-16">
        <div className="flex items-center gap-2">
          <span className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-foreground text-background select-none">
            <span className="absolute inset-[7px] rounded-full border border-background border-b-transparent border-r-transparent -rotate-45" />
            <span className="size-1.5 rounded-full bg-background" />
          </span>
          <span className="text-xl font-semibold tracking-normal text-foreground">
            Beacon
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>

        <p className="text-center text-xs tracking-normal text-muted-foreground">
          Internal use only. Unauthorised access is prohibited.
        </p>
      </div>

      <div className="relative hidden flex-col items-center justify-center border-l border-border bg-muted px-16 text-center lg:flex">
        <div className="max-w-sm space-y-5">
          <div className="text-xs font-semibold uppercase tracking-normal text-primary">
            Internal IT · Service Desk
          </div>
          <h2 className="text-[28px] font-semibold leading-tight tracking-normal text-foreground">
            One queue for incidents, requests, and change approvals.
          </h2>
          <p className="text-sm leading-6 tracking-normal text-muted-foreground">
            Beacon gives analysts and requesters a focused workspace for SLA-aware triage, ownership, and resolution.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-3">
            {['Incidents', 'Service requests', 'Changes', 'SLA monitoring', 'Audit trail'].map((item) => (
              <span
                key={item}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
