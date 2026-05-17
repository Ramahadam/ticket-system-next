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
        <div className="mb-2 flex flex-col gap-1">
          <h1 className="text-[26px] font-semibold leading-tight tracking-normal text-foreground">
            Welcome back
          </h1>
          <p className="text-sm leading-6 tracking-normal text-muted-foreground">
            Sign in to manage your IT tickets.
          </p>
        </div>

        <Field data-invalid={emailInvalid || undefined}>
          <FieldLabel htmlFor="email" className="text-xs font-medium tracking-normal text-foreground">
            Work email
          </FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={emailInvalid || undefined}
            placeholder="you@example.com"
            className="h-10 rounded-lg border-border bg-card px-3 text-[13.5px] tracking-normal"
            {...register('email')}
          />
          {errors.email ? (
            <FieldDescription role="alert" className="text-xs text-destructive">
              {errors.email.message}
            </FieldDescription>
          ) : null}
        </Field>

        <Field data-invalid={passwordInvalid || undefined}>
          <FieldLabel htmlFor="password" className="text-xs font-medium tracking-normal text-foreground">
            Password
          </FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={passwordInvalid || undefined}
            className="h-10 rounded-lg border-border bg-card px-3 text-[13.5px] tracking-normal"
            {...register('password')}
          />
          {errors.password ? (
            <FieldDescription role="alert" className="text-xs text-destructive">
              {errors.password.message}
            </FieldDescription>
          ) : null}
        </Field>

        {rootError ? (
          <FieldDescription
            role="alert"
            className="rounded-lg border border-[color:var(--relay-bad)] bg-[color:var(--relay-bad-soft)] px-3 py-2 text-xs text-[color:var(--relay-bad)]"
          >
            {rootError}
          </FieldDescription>
        ) : null}

        <Field className="mt-2">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
