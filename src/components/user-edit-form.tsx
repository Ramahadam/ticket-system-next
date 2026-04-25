'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { updateUserAction } from '@/app/(staff)/users/actions';
import { USER_ROLE_VALUES } from '@/lib/validation/users';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export function UserEditForm({
  userId,
  currentEmail,
  currentFirstname,
  currentLastname,
  currentMobile,
  currentRole,
  currentIsActive,
  selfEdit,
}: {
  userId: string;
  currentEmail: string;
  currentFirstname: string | null;
  currentLastname: string | null;
  currentMobile: string | null;
  currentRole: string;
  currentIsActive: boolean;
  selfEdit: boolean;
}) {
  const [submitting, setSubmitting] = React.useState(false);
  const [firstname, setFirstname] = React.useState(currentFirstname ?? '');
  const [lastname, setLastname] = React.useState(currentLastname ?? '');
  const [mobile, setMobile] = React.useState(currentMobile ?? '');
  const [userrole, setUserrole] = React.useState(currentRole);
  const [isActive, setIsActive] = React.useState(currentIsActive);
  const [password, setPassword] = React.useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      if (firstname !== (currentFirstname ?? '')) fd.set('firstname', firstname);
      if (lastname !== (currentLastname ?? '')) fd.set('lastname', lastname);
      if (mobile !== (currentMobile ?? '')) fd.set('mobile', mobile);
      if (!selfEdit) {
        if (userrole !== currentRole) fd.set('userrole', userrole);
        if (isActive !== currentIsActive) fd.set('isActive', isActive ? 'true' : 'false');
      }
      if (password) fd.set('password', password);
      await updateUserAction(userId, fd);
      toast.success('User updated');
      setPassword('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" value={currentEmail} readOnly disabled />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="firstname">First name</FieldLabel>
            <Input
              id="firstname"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="lastname">Last name</FieldLabel>
            <Input
              id="lastname"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="mobile">Mobile</FieldLabel>
            <Input
              id="mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </Field>
          {!selfEdit ? (
            <Field>
              <FieldLabel htmlFor="userrole">Role</FieldLabel>
              <select
                id="userrole"
                value={userrole}
                onChange={(e) => setUserrole(e.target.value)}
                className="border-input bg-background h-8 rounded-md border px-2 text-sm"
              >
                {USER_ROLE_VALUES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
        </div>

        {!selfEdit ? (
          <Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active
            </label>
          </Field>
        ) : null}

        <Field>
          <FieldLabel htmlFor="password">Reset password (leave blank to keep)</FieldLabel>
          <Input
            id="password"
            type="text"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </Field>

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
