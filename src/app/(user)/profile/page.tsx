import { format } from 'date-fns';
import { MailIcon, PhoneIcon, ShieldIcon } from 'lucide-react';

import { requireUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  const name = [user.firstname, user.lastname].filter(Boolean).join(' ') || user.email;
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <SiteHeader title="Profile" />
      <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col gap-4 p-4 md:gap-5 md:p-6">
        <div className="border-b border-[color:var(--relay-border-soft)] pb-4">
          <h1 className="text-xl font-semibold text-foreground md:text-2xl">
            Profile
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Keep your account details current.
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
            <Avatar className="size-16">
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-semibold text-foreground">
                  {name}
                </h2>
                <Badge variant="outline" className="capitalize">
                  {user.userrole}
                </Badge>
              </div>
              <div className="mt-2 grid gap-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <MailIcon className="size-3.5" />
                  {user.email}
                </span>
                <span className="flex items-center gap-2">
                  <PhoneIcon className="size-3.5" />
                  {user.mobile ?? 'Mobile not set'}
                </span>
                <span className="flex items-center gap-2">
                  <ShieldIcon className="size-3.5" />
                  Member since {format(user.createdAt, 'PPP')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
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
