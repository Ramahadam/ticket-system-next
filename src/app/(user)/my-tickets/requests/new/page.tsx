import { requireUser } from '@/lib/auth-helpers';
import { getCreateTicketBackHref } from '@/lib/create-ticket-routes';
import { SiteHeader } from '@/components/site-header';
import { CreateTicketLayout } from '@/components/create-ticket-layout';
import { ServiceRequestCreateForm } from '@/components/service-request-create-form';

export default async function NewMyServiceRequestPage() {
  const session = await requireUser();

  return (
    <>
      <SiteHeader title="New service request" />
      <CreateTicketLayout
        scope="user"
        kind="request"
        submitter={session.user.email}
      >
        <ServiceRequestCreateForm
          userId={session.user.id}
          engineers={[]}
          isStaff={false}
          submitterLabel={session.user.email}
          cancelHref={getCreateTicketBackHref('user', 'request')}
        />
      </CreateTicketLayout>
    </>
  );
}
