import { requireUser } from '@/lib/auth-helpers';
import { getCreateTicketBackHref } from '@/lib/create-ticket-routes';
import { SiteHeader } from '@/components/site-header';
import { CreateTicketLayout } from '@/components/create-ticket-layout';
import { ChangeRequestCreateForm } from '@/components/change-request-create-form';

export default async function NewMyChangeRequestPage() {
  const session = await requireUser();

  return (
    <>
      <SiteHeader title="New change request" />
      <CreateTicketLayout
        scope="user"
        kind="change"
        submitter={session.user.email}
      >
        <ChangeRequestCreateForm
          userId={session.user.id}
          engineers={[]}
          isStaff={false}
          submitterLabel={session.user.email}
          cancelHref={getCreateTicketBackHref('user', 'change')}
        />
      </CreateTicketLayout>
    </>
  );
}
