import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
  SearchIcon,
  ShieldIcon,
  UsersIcon,
} from 'lucide-react';

import { requireAdmin } from '@/lib/auth-helpers';
import { SiteHeader } from '@/components/site-header';
import { FilterChip } from '@/components/ticket-primitives';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { USER_ROLE_VALUES } from '@/lib/validation/users';
import { getUsersList } from './data';

type SP = Record<string, string | string[] | undefined>;

function buildHref(current: URLSearchParams, patch: Record<string, string | null>): string {
  const next = new URLSearchParams(current);
  for (const [k, v] of Object.entries(patch)) {
    if (v === null) next.delete(k);
    else next.set(k, v);
  }
  const qs = next.toString();
  return qs ? `/users?${qs}` : '/users';
}

function spToURLSearchParams(sp: SP): URLSearchParams {
  const out = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === 'string') out.set(k, v);
    else if (Array.isArray(v) && v[0]) out.set(k, v[0]);
  }
  return out;
}

function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    standard: 'Requester',
    analyst: 'Analyst',
    admin: 'Admin',
  };

  return labels[role] ?? role;
}

export default async function UsersListPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const { data, count, page, pageSize } = await getUsersList(sp);
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const current = spToURLSearchParams(sp);
  const currentRole = current.get('role') ?? 'all';
  const currentQ = current.get('q') ?? '';

  return (
    <>
      <SiteHeader title="Users" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-5 md:p-6">
        <div className="flex flex-col gap-3 border-b border-[color:var(--relay-border-soft)] pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-[color:var(--relay-accent-text)]">
              Access directory
            </p>
            <h1 className="mt-1 text-xl font-semibold text-foreground md:text-2xl">
              {count} {count === 1 ? 'user' : 'users'}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Manage requester, analyst, and administrator access.
            </p>
          </div>
          <Button
            render={
              <Link href="/users/new">
                <PlusIcon className="size-4" />
                New user
              </Link>
            }
          />
        </div>

        <Card>
          <CardContent className="space-y-4 pt-4">
            <form action="/users" className="flex max-w-xl flex-col gap-2 sm:flex-row">
              {currentRole !== 'all' ? (
                <input type="hidden" name="role" value={currentRole} />
              ) : null}
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="q"
                  defaultValue={currentQ}
                  placeholder="Search by name or email..."
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Search</Button>
                {currentQ ? (
                  <Button
                    type="button"
                    variant="outline"
                    render={
                      <Link href={buildHref(current, { q: null, page: null })}>
                        Clear
                      </Link>
                    }
                  />
                ) : null}
              </div>
            </form>

            <div className="flex flex-wrap items-center gap-1.5">
              <div className="mr-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <ShieldIcon className="size-3.5" />
                Role
              </div>
              <FilterChip
                active={currentRole === 'all'}
                render={
                  <Link href={buildHref(current, { role: null, page: null })}>All</Link>
                }
              />
              {USER_ROLE_VALUES.map((role) => (
                <FilterChip
                  key={role}
                  active={currentRole === role}
                  render={
                    <Link href={buildHref(current, { role, page: null })}>
                      {roleLabel(role)}
                    </Link>
                  }
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Directory results</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Page {page} of {totalPages} · {pageSize} rows per page
              </p>
            </div>
            <UsersIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {data.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users match.</p>
            ) : (
              <Table className="min-w-[760px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((u) => {
                    const name = [u.firstname, u.lastname].filter(Boolean).join(' ') || 'Not set';
                    const initials = name === 'Not set'
                      ? u.email.slice(0, 2).toUpperCase()
                      : name
                          .split(' ')
                          .map((part) => part[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase();
                    return (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <Link href={`/users/${u.id}`} className="font-medium hover:underline">
                                {name}
                              </Link>
                              <div className="font-mono text-xs text-muted-foreground">
                                {u.id.slice(0, 8)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{roleLabel(u.userrole)}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {u.mobile ?? 'Not set'}
                        </TableCell>
                        <TableCell>
                          {u.isActive ? (
                            <Badge className="border-transparent bg-[color:var(--relay-good-soft)] text-[color:var(--relay-good)]">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline">Disabled</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(u.createdAt, 'PP')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            render={<Link href={`/users/${u.id}`}>Manage</Link>}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              {page > 1 ? (
                <Button
                  variant="outline"
                  size="sm"
                  render={
                    <Link href={buildHref(current, { page: String(page - 1) })}>
                      <ArrowLeftIcon className="size-3.5" />
                      Previous
                    </Link>
                  }
                />
              ) : null}
              {page < totalPages ? (
                <Button
                  variant="outline"
                  size="sm"
                  render={
                    <Link href={buildHref(current, { page: String(page + 1) })}>
                      Next
                      <ArrowRightIcon className="size-3.5" />
                    </Link>
                  }
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
