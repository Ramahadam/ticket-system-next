import { NextResponse, type NextRequest } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

import { auth } from '@/auth';

export const runtime = 'nodejs';

const ALLOWED_PREFIXES = ['tickets', 'avatars'];
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB per upload
const ALLOWED_CONTENT_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
  'text/plain',
];

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const [prefix, scopeId] = pathname.split('/');
        if (!ALLOWED_PREFIXES.includes(prefix)) {
          throw new Error(`Disallowed prefix: ${prefix}`);
        }
        if (scopeId !== session.user.id) {
          throw new Error('Upload path must be scoped to current user id');
        }
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
      onUploadCompleted: async () => {
        // Intentional no-op: the URL is persisted by the Server Action
        // that owns the ticket row, not here.
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
