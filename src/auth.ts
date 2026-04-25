import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { ZodError } from 'zod';

import { authConfig } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validation/auth';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(raw) {
        try {
          const { email, password } = await loginSchema.parseAsync(raw);

          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              passwordHash: true,
              firstname: true,
              lastname: true,
              userrole: true,
              isActive: true,
            },
          });

          if (!user || !user.isActive) return null;

          const ok = bcrypt.compareSync(password, user.passwordHash);
          if (!ok) return null;

          return {
            id: user.id,
            email: user.email,
            role: user.userrole,
            firstname: user.firstname,
            lastname: user.lastname,
          };
        } catch (err) {
          if (err instanceof ZodError) return null;
          throw err;
        }
      },
    }),
  ],
});
