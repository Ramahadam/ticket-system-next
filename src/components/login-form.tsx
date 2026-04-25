'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { loginSchema, type LoginFormValues } from '@/lib/validation/auth';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const router = useRouter();
  const [rootError, setRootError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setRootError(null);
    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (!result || result.error) {
      setRootError('Invalid credentials');
      toast.error('Invalid credentials');
      return;
    }

    toast.success('Welcome back');
    router.replace('/');
    router.refresh();
  });

  const emailInvalid = Boolean(errors.email);
  const passwordInvalid = Boolean(errors.password);

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={onSubmit}
      noValidate
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <Field data-invalid={emailInvalid || undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={emailInvalid || undefined}
            placeholder="m@example.com"
            {...register('email')}
          />
          {errors.email ? (
            <FieldDescription role="alert" className="text-destructive">
              {errors.email.message}
            </FieldDescription>
          ) : null}
        </Field>
        <Field data-invalid={passwordInvalid || undefined}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={passwordInvalid || undefined}
            {...register('password')}
          />
          {errors.password ? (
            <FieldDescription role="alert" className="text-destructive">
              {errors.password.message}
            </FieldDescription>
          ) : null}
        </Field>
        {rootError ? (
          <FieldDescription role="alert" className="text-destructive">
            {rootError}
          </FieldDescription>
        ) : null}
        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Login'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
