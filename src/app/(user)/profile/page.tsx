import { format } from 'date-fns';

import { requireUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ProfileForm } from '@/components/profile-form';

export default async function ProfilePage() {
  const session = await requireUser();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      firstname: true,
      lastname: true,
      mobile: true,
      userrole: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  return (
    <>
      <SiteHeader title="Profile" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {user.email}
              <Badge variant="outline">{user.userrole}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Member since {format(user.createdAt, 'PPP')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm
              currentEmail={user.email}
              currentFirstname={user.firstname}
              currentLastname={user.lastname}
              currentMobile={user.mobile}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
