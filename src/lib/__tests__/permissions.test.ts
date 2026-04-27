import { describe, it, expect } from 'vitest';
import {
  isStaff,
  isAdmin,
  canUserCloseTicket,
  canUserAssign,
  canUserChangeStatus,
  canUserCreate,
  canUserUpload,
  canUserAddNote,
} from '../permissions';

describe('isStaff', () => {
  it('returns true for analyst', () => expect(isStaff('analyst')).toBe(true));
  it('returns true for admin', () => expect(isStaff('admin')).toBe(true));
  it('returns false for standard', () => expect(isStaff('standard')).toBe(false));
  it('returns false for undefined', () => expect(isStaff(undefined)).toBe(false));
});

describe('isAdmin', () => {
  it('returns true for admin', () => expect(isAdmin('admin')).toBe(true));
  it('returns false for analyst', () => expect(isAdmin('analyst')).toBe(false));
  it('returns false for standard', () => expect(isAdmin('standard')).toBe(false));
  it('returns false for undefined', () => expect(isAdmin(undefined)).toBe(false));
});

describe('canUserCloseTicket', () => {
  it('allows staff regardless of ownership', () => {
    expect(canUserCloseTicket('analyst', 'someone-else', 'me')).toBe(true);
    expect(canUserCloseTicket('admin', null, undefined)).toBe(true);
  });

  it('allows standard user who owns the ticket', () => {
    expect(canUserCloseTicket('standard', 'user-123', 'user-123')).toBe(true);
  });

  it('denies standard user who does not own the ticket', () => {
    expect(canUserCloseTicket('standard', 'owner-456', 'user-123')).toBe(false);
  });

  it('denies standard user when owner is null', () => {
    expect(canUserCloseTicket('standard', null, 'user-123')).toBe(false);
  });

  it('denies when currentUserId is undefined', () => {
    expect(canUserCloseTicket('standard', 'owner-456', undefined)).toBe(false);
  });
});

describe('canUserAssign', () => {
  it('allows analyst and admin', () => {
    expect(canUserAssign('analyst')).toBe(true);
    expect(canUserAssign('admin')).toBe(true);
  });
  it('denies standard', () => expect(canUserAssign('standard')).toBe(false));
});

describe('canUserChangeStatus', () => {
  it('allows analyst and admin', () => {
    expect(canUserChangeStatus('analyst')).toBe(true);
    expect(canUserChangeStatus('admin')).toBe(true);
  });
  it('denies standard', () => expect(canUserChangeStatus('standard')).toBe(false));
});

describe('canUserCreate', () => {
  it('allows all roles', () => {
    expect(canUserCreate('standard')).toBe(true);
    expect(canUserCreate('analyst')).toBe(true);
    expect(canUserCreate('admin')).toBe(true);
    expect(canUserCreate(undefined)).toBe(true);
  });
});

describe('canUserUpload', () => {
  it('allows all roles', () => {
    expect(canUserUpload('standard')).toBe(true);
    expect(canUserUpload('analyst')).toBe(true);
  });
});

describe('canUserAddNote', () => {
  it('allows all roles', () => {
    expect(canUserAddNote('standard')).toBe(true);
    expect(canUserAddNote('admin')).toBe(true);
  });
});
