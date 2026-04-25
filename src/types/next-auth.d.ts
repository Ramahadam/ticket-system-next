import type { DefaultSession } from 'next-auth';
import type { UserRole } from '@/generated/prisma/enums';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: UserRole;
      firstname: string | null;
      lastname: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    email?: string | null;
    role?: UserRole;
    firstname?: string | null;
    lastname?: string | null;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    email: string;
    role: UserRole;
    firstname: string | null;
    lastname: string | null;
  }
}
