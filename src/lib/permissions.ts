import type { Role } from './constants';

export function isStaff(role: Role | undefined) {
  return role === 'analyst' || role === 'admin';
}

export function canUserCloseTicket(
  role: Role | undefined,
  ticketOwnerId: string | number | null | undefined,
  currentUserId?: string | number,
) {
  if (isStaff(role)) return true;
  return Boolean(currentUserId && ticketOwnerId && currentUserId === ticketOwnerId);
}

export function canUserAssign(role: Role | undefined) {
  return isStaff(role);
}

export function canUserChangeStatus(role: Role | undefined) {
  return isStaff(role);
}

export function canUserCreate(_role: Role | undefined) {
  return true;
}

export function canUserUpload(_role: Role | undefined) {
  return true;
}

export function canUserAddNote(_role: Role | undefined) {
  return true;
}

export function isAdmin(role: Role | undefined) {
  return role === 'admin';
}
