'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { deleteServiceRequestAction } from '@/app/(staff)/requests/actions';
import { Button } from '@/components/ui/button';

export function DeleteServiceRequestButton({ requestId }: { requestId: number }) {
  const [pending, setPending] = React.useState(false);

  async function onClick() {
    if (!confirm('Delete this service request? This cannot be undone.')) return;
    setPending(true);
    try {
      await deleteServiceRequestAction(requestId);
    } catch (err) {
      if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) return;
      toast.error(err instanceof Error ? err.message : 'Delete failed');
      setPending(false);
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={onClick}
    >
      {pending ? 'Deleting…' : 'Delete'}
    </Button>
  );
}
