'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { createServiceRequestAction } from '@/app/(staff)/requests/actions';
import {
  serviceRequestCreateSchema,
  type ServiceRequestCreateInput,
} from '@/lib/validation/tickets';
import {
  IMPACT_OPTIONS,
  PRIORITY_SELECT_OPTIONS,
} from '@/lib/constants';
import { uploadFile } from '@/lib/upload-client';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type EngineerOption = { id: string; label: string; email: string };

export function ServiceRequestCreateForm({
  userId,
  engineers,
  isStaff,
}: {
  userId: string;
  engineers: EngineerOption[];
  isStaff: boolean;
}) {
  const [uploadedUrl, setUploadedUrl] = React.useState<string>('');
  const [uploading, setUploading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceRequestCreateInput>({
    resolver: zodResolver(serviceRequestCreateSchema),
    defaultValues: {
      summary: '',
      description: '',
      priority: 3,
      impact: undefined,
      owner: '',
      noteValue: '',
    },
  });

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadFile({ file, scope: 'tickets', userId });
      setUploadedUrl(result.url);
      toast.success('Attachment uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set('summary', values.summary);
      fd.set('description', values.description);
      fd.set('priority', String(values.priority));
      if (values.impact) fd.set('impact', values.impact);
      if (values.owner) fd.set('owner', values.owner);
      if (uploadedUrl) fd.set('file', uploadedUrl);
      if (values.noteValue) fd.set('noteValue', values.noteValue);
      await createServiceRequestAction(fd);
    } catch (err) {
      if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) return;
      toast.error(err instanceof Error ? err.message : 'Create failed');
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={errors.summary ? true : undefined}>
          <FieldLabel htmlFor="summary">Summary</FieldLabel>
          <Input
            id="summary"
            aria-invalid={errors.summary ? true : undefined}
            {...register('summary')}
          />
          {errors.summary ? (
            <FieldDescription role="alert" className="text-destructive">
              {errors.summary.message}
            </FieldDescription>
          ) : null}
        </Field>

        <Field data-invalid={errors.description ? true : undefined}>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            rows={5}
            aria-invalid={errors.description ? true : undefined}
            {...register('description')}
          />
          {errors.description ? (
            <FieldDescription role="alert" className="text-destructive">
              {errors.description.message}
            </FieldDescription>
          ) : null}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors.priority ? true : undefined}>
            <FieldLabel htmlFor="priority">Priority</FieldLabel>
            <select
              id="priority"
              className="border-input bg-background h-8 rounded-md border px-2 text-sm"
              {...register('priority', { valueAsNumber: true })}
            >
              {PRIORITY_SELECT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {errors.priority ? (
              <FieldDescription role="alert" className="text-destructive">
                {errors.priority.message}
              </FieldDescription>
            ) : null}
          </Field>

          <Field>
            <FieldLabel htmlFor="impact">Impact (optional)</FieldLabel>
            <select
              id="impact"
              className="border-input bg-background h-8 rounded-md border px-2 text-sm"
              {...register('impact')}
            >
              <option value="">—</option>
              {IMPACT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {isStaff ? (
          <Field>
            <FieldLabel htmlFor="owner">Assign to</FieldLabel>
            <select
              id="owner"
              className="border-input bg-background h-8 rounded-md border px-2 text-sm"
              {...register('owner')}
            >
              <option value="">Unassigned</option>
              {engineers.map((e) => (
                <option key={e.id} value={e.email}>
                  {e.label}
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        <Field>
          <FieldLabel htmlFor="noteValue">Initial note (optional)</FieldLabel>
          <Textarea id="noteValue" rows={3} {...register('noteValue')} />
        </Field>

        <Field>
          <FieldLabel htmlFor="file">Attachment (optional, up to 25 MB)</FieldLabel>
          <Input
            id="file"
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf,text/plain"
            onChange={onFileChange}
            disabled={uploading}
          />
          {uploading ? (
            <FieldDescription>Uploading…</FieldDescription>
          ) : uploadedUrl ? (
            <FieldDescription>Attached.</FieldDescription>
          ) : null}
        </Field>

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting || uploading}>
            {submitting ? 'Creating…' : 'Create service request'}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
