import Link from 'next/link';

import { requireUser } from '@/lib/auth-helpers';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChangeRequestCreateForm } from '@/components/change-request-create-form';

export default async function NewMyChangeRequestPage() {
  const session = await requireUser();

  return (
    <>
      <SiteHeader title="New change request" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/my-tickets?tab=change">Back</Link>}
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Log a change request</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangeRequestCreateForm
              userId={session.user.id}
              engineers={[]}
              isStaff={false}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
