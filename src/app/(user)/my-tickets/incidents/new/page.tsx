import { requireUser } from '@/lib/auth-helpers';
import { getCreateTicketBackHref } from '@/lib/create-ticket-routes';
import { SiteHeader } from '@/components/site-header';
import { CreateTicketLayout } from '@/components/create-ticket-layout';
import { IncidentCreateForm } from '@/components/incident-create-form';

export default async function NewMyIncidentPage() {
  const session = await requireUser();

  return (
    <>
      <SiteHeader title="New incident" />
      <CreateTicketLayout
        scope="user"
        kind="incident"
        submitter={session.user.email}
      >
        <IncidentCreateForm
          userId={session.user.id}
          engineers={[]}
          isStaff={false}
          submitterLabel={session.user.email}
          cancelHref={getCreateTicketBackHref('user', 'incident')}
        />
      </CreateTicketLayout>
    </>
  );
}
