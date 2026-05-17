'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
};

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup className="p-2">
      <SidebarGroupContent className="flex flex-col gap-1">
        <SidebarMenu className="gap-1">
          {items.map(({ title, href, icon: Icon, count }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  tooltip={title}
                  isActive={isActive}
                  className="text-sidebar-foreground data-active:[&_svg]:text-primary"
                  render={<Link href={href} />}
                >
                  <Icon />
                  <span>{title}</span>
                  {typeof count === 'number' ? (
                    <span className="ml-auto rounded-full bg-sidebar-accent px-1.5 py-0.5 text-[11px] font-medium text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                      {count}
                    </span>
                  ) : null}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
