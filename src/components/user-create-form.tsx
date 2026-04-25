'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { createUserAction } from '@/app/(staff)/users/actions';
import {
  userCreateSchema,
  USER_ROLE_VALUES,
  type UserCreateInput,
} from '@/lib/validation/users';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export function UserCreateForm() {
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserCreateInput>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      email: '',
      password: '',
      firstname: '',
      lastname: '',
      mobile: '',
      userrole: 'standard',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set('email', values.email);
      fd.set('password', values.password);
      if (values.firstname) fd.set('firstname', values.firstname);
      if (values.lastname) fd.set('lastname', values.lastname);
      if (values.mobile) fd.set('mobile', values.mobile);
      fd.set('userrole', values.userrole);
      await createUserAction(fd);
    } catch (err) {
      if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) return;
      toast.error(err instanceof Error ? err.message : 'Create failed');
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors.email ? true : undefined}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={errors.email ? true : undefined}
              {...register('email')}
            />
            {errors.email ? (
              <FieldDescription role="alert" className="text-destructive">
                {errors.email.message}
              </FieldDescription>
            ) : null}
          </Field>

          <Field data-invalid={errors.password ? true : undefined}>
            <FieldLabel htmlFor="password">Temporary password</FieldLabel>
            <Input
              id="password"
              type="text"
              autoComplete="new-password"
              aria-invalid={errors.password ? true : undefined}
              {...register('password')}
            />
            {errors.password ? (
              <FieldDescription role="alert" className="text-destructive">
                {errors.password.message}
              </FieldDescription>
            ) : null}
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="firstname">First name</FieldLabel>
            <Input id="firstname" {...register('firstname')} />
          </Field>
          <Field>
            <FieldLabel htmlFor="lastname">Last name</FieldLabel>
            <Input id="lastname" {...register('lastname')} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="mobile">Mobile</FieldLabel>
            <Input id="mobile" {...register('mobile')} />
          </Field>
          <Field data-invalid={errors.userrole ? true : undefined}>
            <FieldLabel htmlFor="userrole">Role</FieldLabel>
            <select
              id="userrole"
              className="border-input bg-background h-8 rounded-md border px-2 text-sm"
              {...register('userrole')}
            >
              {USER_ROLE_VALUES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {errors.userrole ? (
              <FieldDescription role="alert" className="text-destructive">
                {errors.userrole.message}
              </FieldDescription>
            ) : null}
          </Field>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create user'}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
