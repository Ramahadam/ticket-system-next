import type { NavUserProps } from '@/components/nav-user';

export function sessionToNavUser(
  user: {
    email: string;
    firstname: string | null;
    lastname: string | null;
  },
): NavUserProps {
  const first = user.firstname?.trim() ?? '';
  const last = user.lastname?.trim() ?? '';
  const name = [first, last].filter(Boolean).join(' ') || user.email;
  const initials =
    ((first[0] ?? '') + (last[0] ?? '')).toUpperCase() ||
    user.email.slice(0, 2).toUpperCase();

  return { name, email: user.email, initials };
}
