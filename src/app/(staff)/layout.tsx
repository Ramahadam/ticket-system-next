import type { CSSProperties } from 'react';

import { requireStaff } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { sessionToNavUser } from '@/lib/session-display';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ChangeStatus, TicketStatus } from '@/generated/prisma/client';

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireStaff();
  const navUser = sessionToNavUser(session.user);
  const [incidents, requests, change] = await prisma.$transaction([
    prisma.incident.count({
      where: { status: { notIn: [TicketStatus.fulfilled, TicketStatus.canceled] } },
    }),
    prisma.serviceRequest.count({
      where: { status: { notIn: [TicketStatus.fulfilled, TicketStatus.canceled] } },
    }),
    prisma.changeRequest.count({
      where: { status: { notIn: [ChangeStatus.implemented, ChangeStatus.cancelled] } },
    }),
  ]);

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as CSSProperties
      }
    >
      <AppSidebar
        user={navUser}
        role={session.user.role}
        counts={{ incidents, requests, change }}
        variant="inset"
      />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
