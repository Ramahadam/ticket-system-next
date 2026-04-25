import Link from 'next/link';
import { format } from 'date-fns';

import { requireAdmin } from '@/lib/auth-helpers';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

  return (
    <>
      <SiteHeader title="Users" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1">
            <Button
              size="sm"
              variant={currentRole === 'all' ? 'default' : 'outline'}
              render={
                <Link href={buildHref(current, { role: null, page: null })}>All</Link>
              }
            />
            {USER_ROLE_VALUES.map((role) => (
              <Button
                key={role}
                size="sm"
                variant={currentRole === role ? 'default' : 'outline'}
                render={
                  <Link href={buildHref(current, { role, page: null })}>{role}</Link>
                }
              />
            ))}
          </div>
          <div className="ml-auto">
            <Button render={<Link href="/users/new">New user</Link>} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {count} {count === 1 ? 'user' : 'users'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users match.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((u) => {
                    const name = [u.firstname, u.lastname].filter(Boolean).join(' ') || '—';
                    return (
                      <TableRow key={u.id}>
                        <TableCell>
                          <Link href={`/users/${u.id}`} className="hover:underline">
                            {u.email}
                          </Link>
                        </TableCell>
                        <TableCell>{name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{u.userrole}</Badge>
                        </TableCell>
                        <TableCell>
                          {u.isActive ? (
                            <Badge variant="secondary">active</Badge>
                          ) : (
                            <Badge variant="outline">disabled</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(u.createdAt, 'PP')}
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
