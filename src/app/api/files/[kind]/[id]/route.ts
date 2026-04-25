import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isStaff } from '@/lib/permissions';

export const runtime = 'nodejs';

type TicketKind = 'incident' | 'service-request' | 'change-request';

async function loadTicket(kind: TicketKind, id: number) {
  if (kind === 'incident') {
    return prisma.incident.findUnique({
      where: { id },
      select: { id: true, file: true, requester: true },
    });
  }
  if (kind === 'service-request') {
    return prisma.serviceRequest.findUnique({
      where: { id },
      select: { id: true, file: true, requester: true },
    });
  }
  return prisma.changeRequest.findUnique({
    where: { id },
    select: { id: true, file: true, requester: true },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ kind: string; id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { kind, id } = await params;
  if (kind !== 'incident' && kind !== 'service-request' && kind !== 'change-request') {
    return NextResponse.json({ error: 'Unknown ticket kind' }, { status: 400 });
  }
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return NextResponse.json({ error: 'Invalid ticket id' }, { status: 400 });
  }

  const ticket = await loadTicket(kind, numericId);
  if (!ticket || !ticket.file) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const canAccess =
    isStaff(session.user.role) || ticket.requester === session.user.email;
  if (!canAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.redirect(ticket.file, 307);
}
