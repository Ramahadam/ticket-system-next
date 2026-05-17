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
  SearchIcon,
} from 'lucide-react';

import { NavMain, type NavItem } from '@/components/nav-main';
import { NavUser, type NavUserProps } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInput,
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

export type AppSidebarCounts = {
  incidents?: number;
  requests?: number;
  change?: number;
};

export function AppSidebar({
  user,
  role,
  counts,
  ...props
}: {
  user: NavUserProps;
  role: Role;
  counts?: AppSidebarCounts;
} & React.ComponentProps<typeof Sidebar>) {
  const items = React.useMemo(
    () =>
      buildNav(role).map((item) => {
        if (item.href === '/incidents') return { ...item, count: counts?.incidents };
        if (item.href === '/requests') return { ...item, count: counts?.requests };
        if (item.href === '/change') return { ...item, count: counts?.change };
        return item;
      }),
    [counts?.change, counts?.incidents, counts?.requests, role],
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="gap-3 border-b border-sidebar-border px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-9 data-[slot=sidebar-menu-button]:px-2! hover:bg-sidebar-accent"
              render={<Link href="/" />}
            >
              <span className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-foreground text-background select-none">
                <span className="absolute inset-[7px] rounded-full border border-background border-b-transparent border-r-transparent -rotate-45" />
                <span className="size-1.5 rounded-full bg-background" />
              </span>
              <span className="text-[15px] font-semibold tracking-normal text-foreground">
                Beacon
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="relative group-data-[collapsible=icon]:hidden">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <SidebarInput
            aria-label="Search tickets"
            placeholder="Search tickets..."
            className="pl-8 pr-12"
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-card px-1.5 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-1 py-3">
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
