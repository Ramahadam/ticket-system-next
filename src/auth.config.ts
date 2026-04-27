import type { NextAuthConfig } from 'next-auth';

const STAFF_PREFIXES = ['/dashboard', '/incidents', '/requests', '/change', '/users'];
const USER_PREFIXES = ['/my-tickets', '/profile'];
const AUTH_PREFIXES = ['/login'];

function isStaffRole(role: string | undefined): boolean {
  return role === 'admin' || role === 'analyst';
}

function startsWithAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    // authorized() This runs in middleware it decides: whether the request will continue or not? This does NOT replace backend checks. i's first layer only
    authorized({ auth, request }) { 

      const { pathname } = request.nextUrl;
      const isLoggedIn = Boolean(auth?.user);
      const role = auth?.user?.role;

      // Rule 1: Allow Auth system routes e.g /login, /logout and session APIS
      if (pathname.startsWith('/api/auth')) return true;

      // Rule 2: Protect ALL API routes
      if (pathname.startsWith('/api/')) {
        if (!isLoggedIn) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return true;
      }

      // Rule 3: AUTH pages (login)
      if (startsWithAny(pathname, AUTH_PREFIXES)) {
        if (isLoggedIn) {
          const target = isStaffRole(role) ? '/dashboard' : '/my-tickets';
          return Response.redirect(new URL(target, request.nextUrl));
        }
        return true;
      }

       // Rule 4: STAFF routes
      if (startsWithAny(pathname, STAFF_PREFIXES)) {
        if (!isLoggedIn) return false;
        if (pathname.startsWith('/users') && role !== 'admin') {
          return Response.redirect(new URL('/dashboard', request.nextUrl));
        }
        if (!isStaffRole(role)) {
          return Response.redirect(new URL('/my-tickets', request.nextUrl));
        }
        return true;
      }

      // Rule 5: USER routes
      if (startsWithAny(pathname, USER_PREFIXES)) {
        if (!isLoggedIn) return false;
        return true;
      }

      // Rule 6: Default -> Public routes allowed
      return true;
    },
    // Happens ONLY after login this runs after login AND on every request.
    async jwt({ token, user }) {
      if (user) {
        // Keep these values across requests
        token.id = user.id ?? token.id;
        token.email = user.email ?? token.email;
        token.role = user.role ?? token.role;
        token.firstname = user.firstname ?? token.firstname ?? null;
        token.lastname = user.lastname ?? token.lastname ?? null;
      }
      return token;
    },
    // Map token → session Why? JWT is internal Session is what the app uses: this runs after login AND on every request.
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.firstname = token.firstname;
        session.user.lastname = token.lastname;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
