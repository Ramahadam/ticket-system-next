import type { CSSProperties } from 'react';

import { requireUser } from '@/lib/auth-helpers';
import { sessionToNavUser } from '@/lib/session-display';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser();
  const navUser = sessionToNavUser(session.user);

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as CSSProperties
      }
    >
      <AppSidebar user={navUser} role={session.user.role} variant="inset" />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
