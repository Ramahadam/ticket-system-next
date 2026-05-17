import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeftIcon } from 'lucide-react';

import { requireAdmin } from '@/lib/auth-helpers';
import { SiteHeader } from '@/components/site-header';
import { DetailFact } from '@/components/detail-page-primitives';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UserEditForm } from '@/components/user-edit-form';
import { DeleteUserButton } from '@/components/delete-user-button';
import { getUser } from '../data';

function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    standard: 'Requester',
    analyst: 'Analyst',
    admin: 'Admin',
  };

  return labels[role] ?? role;
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdmin();
  const { id } = await params;

  const user = await getUser(id);
  if (!user) notFound();

  const selfEdit = session.user.id === user.id;
  const name = [user.firstname, user.lastname].filter(Boolean).join(' ') || 'No name set';

  return (
    <>
      <SiteHeader title={user.email} />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-5 md:p-6">
        <div className="flex flex-col gap-3 border-b border-[color:var(--relay-border-soft)] pb-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <Button
              variant="ghost"
              size="sm"
              render={
                <Link href="/users">
                  <ArrowLeftIcon className="size-3.5" />
                  Back to users
                </Link>
              }
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{roleLabel(user.userrole)}</Badge>
              {user.isActive ? (
                <Badge className="border-transparent bg-[color:var(--relay-good-soft)] text-[color:var(--relay-good)]">
                  Active
                </Badge>
              ) : (
                <Badge variant="outline">Disabled</Badge>
              )}
              {selfEdit ? <Badge variant="secondary">Current session</Badge> : null}
            </div>
            <h1 className="mt-3 max-w-4xl text-xl font-semibold text-foreground md:text-2xl">
              {user.email}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{name}</p>
          </div>
          {!selfEdit ? <DeleteUserButton userId={user.id} /> : null}
        </div>

        <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>User facts</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-2">
                <DetailFact label="First name" value={user.firstname ?? 'Not set'} />
                <DetailFact label="Last name" value={user.lastname ?? 'Not set'} />
                <DetailFact label="Mobile" value={user.mobile ?? 'Not set'} />
                <DetailFact label="Created" value={format(user.createdAt, 'PPp')} />
                <DetailFact label="Updated" value={format(user.updatedAt, 'PPp')} />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Update user</CardTitle>
            </CardHeader>
            <CardContent>
              <UserEditForm
                userId={user.id}
                currentEmail={user.email}
                currentFirstname={user.firstname}
                currentLastname={user.lastname}
                currentMobile={user.mobile}
                currentRole={user.userrole}
                currentIsActive={user.isActive}
                selfEdit={selfEdit}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
