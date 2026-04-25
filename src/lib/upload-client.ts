import { upload } from '@vercel/blob/client';
import type { PutBlobResult } from '@vercel/blob';

export type TicketAttachmentScope = 'tickets' | 'avatars';

export async function uploadFile(params: {
  file: File;
  scope: TicketAttachmentScope;
  userId: string;
}): Promise<PutBlobResult> {
  const safeName = params.file.name.replace(/[^\w.\-]+/g, '_');
  const pathname = `${params.scope}/${params.userId}/${safeName}`;

  return upload(pathname, params.file, {
    access: 'public',
    handleUploadUrl: '/api/files/upload-token',
  });
}
