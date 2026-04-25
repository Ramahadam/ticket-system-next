'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  LayoutDashboardIcon,
  TicketIcon,
  FileTextIcon,
  ReplaceIcon,
  UsersIcon,
  UserIcon,
  InboxIcon,
  CommandIcon,
} from 'lucide-react';

import { NavMain, type NavItem } from '@/components/nav-main';
import { NavUser, type NavUserProps } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { Role } from '@/lib/constants';
import { isAdmin, isStaff } from '@/lib/permissions';

const STAFF_NAV: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboardIcon },
  { title: 'Incidents', href: '/incidents', icon: TicketIcon },
  { title: 'Service Requests', href: '/requests', icon: FileTextIcon },
  { title: 'Change Requests', href: '/change', icon: ReplaceIcon },
];

const ADMIN_NAV: NavItem[] = [{ title: 'Users', href: '/users', icon: UsersIcon }];

const USER_NAV: NavItem[] = [
  { title: 'My Tickets', href: '/my-tickets', icon: InboxIcon },
  { title: 'Profile', href: '/profile', icon: UserIcon },
];

function buildNav(role: Role): NavItem[] {
  if (isAdmin(role)) return [...STAFF_NAV, ...ADMIN_NAV];
  if (isStaff(role)) return STAFF_NAV;
  return USER_NAV;
}

export function AppSidebar({
  user,
  role,
  ...props
}: {
  user: NavUserProps;
  role: Role;
} & React.ComponentProps<typeof Sidebar>) {
  const items = React.useMemo(() => buildNav(role), [role]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/" />}
            >
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">Ticket System</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
