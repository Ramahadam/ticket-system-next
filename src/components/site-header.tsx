import { BellIcon, SearchIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function SiteHeader({ title }: { title: string }) {
  return (
    <header
      className="sticky top-0 z-10 flex h-[var(--relay-topbar-h)] shrink-0 items-center gap-2 border-b border-border bg-card transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[var(--relay-topbar-h)]"
    >
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <span className="hidden text-muted-foreground sm:inline">Workspace</span>
          <span className="hidden text-muted-foreground sm:inline">/</span>
          <h1 className="truncate text-[15px] font-semibold tracking-normal text-foreground">
            {title}
          </h1>
        </div>
        <div className="ml-auto hidden w-full max-w-[380px] items-center md:flex">
          <div className="relative w-full">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <div className="flex h-[34px] items-center rounded-lg border border-border bg-background pl-9 pr-2 text-[13px] text-muted-foreground">
              Search or type a command
              <span className="ml-auto rounded border border-border bg-card px-1.5 font-mono text-[10px] text-muted-foreground">
                ⌘K
              </span>
            </div>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative ml-auto md:ml-0"
          aria-label="Notifications"
        >
          <BellIcon />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[color:var(--relay-p1)]" />
        </Button>
      </div>
    </header>
  );
}
