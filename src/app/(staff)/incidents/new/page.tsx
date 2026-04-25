import Link from 'next/link';

import { requireUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { isStaff } from '@/lib/permissions';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { IncidentCreateForm } from '@/components/incident-create-form';

export default async function NewIncidentPage() {
  const session = await requireUser();

  const engineers = await prisma.user.findMany({
    where: { userrole: { in: ['analyst', 'admin'] }, isActive: true },
    select: { id: true, email: true, firstname: true, lastname: true },
    orderBy: { email: 'asc' },
  });

  const options = engineers.map((e) => ({
    id: e.id,
    email: e.email,
    label: [e.firstname, e.lastname].filter(Boolean).join(' ') || e.email,
  }));

  return (
    <>
      <SiteHeader title="New incident" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/incidents">Back to incidents</Link>}
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Log a new incident</CardTitle>
          </CardHeader>
          <CardContent>
            <IncidentCreateForm
              userId={session.user.id}
              engineers={options}
              isStaff={isStaff(session.user.role)}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
