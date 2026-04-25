import Link from 'next/link';

import { requireAdmin } from '@/lib/auth-helpers';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UserCreateForm } from '@/components/user-create-form';

export default async function NewUserPage() {
  await requireAdmin();

  return (
    <>
      <SiteHeader title="New user" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/users">Back to users</Link>}
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Create a new user</CardTitle>
          </CardHeader>
          <CardContent>
            <UserCreateForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
