'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { updateProfileAction } from '@/app/(user)/profile/actions';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export function ProfileForm({
  currentEmail,
  currentFirstname,
  currentLastname,
  currentMobile,
}: {
  currentEmail: string;
  currentFirstname: string | null;
  currentLastname: string | null;
  currentMobile: string | null;
}) {
  const [submitting, setSubmitting] = React.useState(false);
  const [firstname, setFirstname] = React.useState(currentFirstname ?? '');
  const [lastname, setLastname] = React.useState(currentLastname ?? '');
  const [mobile, setMobile] = React.useState(currentMobile ?? '');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [pwError, setPwError] = React.useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password && password !== confirm) {
      setPwError('Passwords do not match');
      return;
    }
    if (password && password.length < 8) {
      setPwError('Password must be at least 8 characters');
      return;
    }
    setPwError('');
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set('firstname', firstname);
      fd.set('lastname', lastname);
      fd.set('mobile', mobile);
      if (password) fd.set('password', password);
      await updateProfileAction(fd);
      toast.success('Profile updated');
      setPassword('');
      setConfirm('');
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

        <Field>
          <FieldLabel htmlFor="mobile">Mobile</FieldLabel>
          <Input
            id="mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={pwError ? true : undefined}>
            <FieldLabel htmlFor="password">New password</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Leave blank to keep current"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Field data-invalid={pwError ? true : undefined}>
            <FieldLabel htmlFor="confirm">Confirm new password</FieldLabel>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </Field>
        </div>
        {pwError ? (
          <FieldDescription role="alert" className="text-destructive">
            {pwError}
          </FieldDescription>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
