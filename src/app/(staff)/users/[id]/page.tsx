import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

import { requireAdmin } from '@/lib/auth-helpers';
import { SiteHeader } from '@/components/site-header';
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

  return (
    <>
      <SiteHeader title={user.email} />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/users">Back</Link>}
          />
          {!selfEdit ? (
            <div className="ml-auto">
              <DeleteUserButton userId={user.id} />
            </div>
          ) : null}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Created {format(user.createdAt, 'PPp')} · Updated{' '}
            {format(user.updatedAt, 'PPp')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update</CardTitle>
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
    </>
  );
}
