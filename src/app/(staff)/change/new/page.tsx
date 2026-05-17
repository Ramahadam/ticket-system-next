import { requireUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { isStaff } from '@/lib/permissions';
import { getCreateTicketBackHref } from '@/lib/create-ticket-routes';
import { SiteHeader } from '@/components/site-header';
import { CreateTicketLayout } from '@/components/create-ticket-layout';
import { ChangeRequestCreateForm } from '@/components/change-request-create-form';

export default async function NewChangeRequestPage() {
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
      <SiteHeader title="New change request" />
      <CreateTicketLayout
        scope="staff"
        kind="change"
        submitter={session.user.email}
      >
        <ChangeRequestCreateForm
          userId={session.user.id}
          engineers={options}
          isStaff={isStaff(session.user.role)}
          submitterLabel={session.user.email}
          cancelHref={getCreateTicketBackHref('staff', 'change')}
        />
      </CreateTicketLayout>
    </>
  );
}
