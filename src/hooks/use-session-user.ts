'use client';

import { useSession } from 'next-auth/react';
import type { Role } from '@/lib/constants';
import { isStaff, isAdmin } from '@/lib/permissions';

export function useSessionUser() {
  const { data, status } = useSession();
  const user = data?.user;
  const role = user?.role as Role | undefined;

  return {
    user,
    role,
    userId: user?.id,
    email: user?.email,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    isStaff: isStaff(role),
    isAdmin: isAdmin(role),
  };
}
