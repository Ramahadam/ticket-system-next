'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { createChangeRequestAction } from '@/app/(staff)/change/actions';
import {
  changeRequestCreateSchema,
  type ChangeRequestCreateInput,
} from '@/lib/validation/change-requests';
import {
  CATEGORY_OPTIONS,
  CLASSIFICATION_SELECT_OPTIONS,
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

export function ChangeRequestCreateForm({
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
  } = useForm<ChangeRequestCreateInput>({
    resolver: zodResolver(changeRequestCreateSchema),
    defaultValues: {
      summary: '',
      description: '',
      category: 'software',
      classification: 3,
      rollback_plan: '',
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
      fd.set('category', values.category);
      fd.set('classification', String(values.classification));
      fd.set('rollback_plan', values.rollback_plan);
      if (values.owner) fd.set('owner', values.owner);
      if (uploadedUrl) fd.set('file', uploadedUrl);
      if (values.noteValue) fd.set('noteValue', values.noteValue);
      await createChangeRequestAction(fd);
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
          <Field data-invalid={errors.category ? true : undefined}>
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <select
              id="category"
              className="border-input bg-background h-8 rounded-md border px-2 text-sm"
              {...register('category')}
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {errors.category ? (
              <FieldDescription role="alert" className="text-destructive">
                {errors.category.message}
              </FieldDescription>
            ) : null}
          </Field>

          <Field data-invalid={errors.classification ? true : undefined}>
            <FieldLabel htmlFor="classification">Classification</FieldLabel>
            <select
              id="classification"
              className="border-input bg-background h-8 rounded-md border px-2 text-sm"
              {...register('classification', { valueAsNumber: true })}
            >
              {CLASSIFICATION_SELECT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {errors.classification ? (
              <FieldDescription role="alert" className="text-destructive">
                {errors.classification.message}
              </FieldDescription>
            ) : null}
          </Field>
        </div>

        <Field data-invalid={errors.rollback_plan ? true : undefined}>
          <FieldLabel htmlFor="rollback_plan">Rollback plan</FieldLabel>
          <Textarea
            id="rollback_plan"
            rows={4}
            aria-invalid={errors.rollback_plan ? true : undefined}
            {...register('rollback_plan')}
          />
          {errors.rollback_plan ? (
            <FieldDescription role="alert" className="text-destructive">
              {errors.rollback_plan.message}
            </FieldDescription>
          ) : null}
        </Field>

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
            {submitting ? 'Creating…' : 'Create change request'}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
