'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { updateChangeRequestAction } from '@/app/(staff)/change/actions';
import { uploadFile } from '@/lib/upload-client';
import {
  CATEGORY_OPTIONS,
  CLASSIFICATION_SELECT_OPTIONS,
  CR_STATUS_OPTIONS,
} from '@/lib/constants';
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

export function ChangeRequestEditForm({
  requestId,
  userId,
  isStaff,
  engineers,
  currentStatus,
  currentOwner,
  currentCategory,
  currentClassification,
  currentRollbackPlan,
}: {
  requestId: number;
  userId: string;
  isStaff: boolean;
  engineers: EngineerOption[];
  currentStatus: string;
  currentOwner: string | null;
  currentCategory: string;
  currentClassification: number;
  currentRollbackPlan: string;
}) {
  const [uploadedUrl, setUploadedUrl] = React.useState<string>('');
  const [uploading, setUploading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [note, setNote] = React.useState('');
  const [status, setStatus] = React.useState(currentStatus);
  const [owner, setOwner] = React.useState(currentOwner ?? '');
  const [category, setCategory] = React.useState(currentCategory);
  const [classification, setClassification] = React.useState(currentClassification);
  const [rollbackPlan, setRollbackPlan] = React.useState(currentRollbackPlan);

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim() && !uploadedUrl && !isStaff) {
      toast.error('Add a note or attachment');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      if (isStaff) {
        if (status !== currentStatus) fd.set('status', status);
        if ((owner || '') !== (currentOwner ?? '')) fd.set('owner', owner);
        if (category !== currentCategory) fd.set('category', category);
        if (classification !== currentClassification) fd.set('classification', String(classification));
        if (rollbackPlan !== currentRollbackPlan) fd.set('rollback_plan', rollbackPlan);
      }
      if (note.trim()) fd.set('noteValue', note.trim());
      if (uploadedUrl) fd.set('file', uploadedUrl);
      await updateChangeRequestAction(requestId, fd);
      toast.success('Updated');
      setNote('');
      setUploadedUrl('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        {isStaff ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border-input bg-background h-8 rounded-md border px-2 text-sm"
                >
                  {CR_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field>
                <FieldLabel htmlFor="owner">Owner</FieldLabel>
                <select
                  id="owner"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="border-input bg-background h-8 rounded-md border px-2 text-sm"
                >
                  <option value="">Unassigned</option>
                  {engineers.map((e) => (
                    <option key={e.id} value={e.email}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field>
                <FieldLabel htmlFor="category">Category</FieldLabel>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border-input bg-background h-8 rounded-md border px-2 text-sm"
                >
                  {CATEGORY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field>
                <FieldLabel htmlFor="classification">Classification</FieldLabel>
                <select
                  id="classification"
                  value={classification}
                  onChange={(e) => setClassification(Number(e.target.value))}
                  className="border-input bg-background h-8 rounded-md border px-2 text-sm"
                >
                  {CLASSIFICATION_SELECT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="rollback_plan">Rollback plan</FieldLabel>
              <Textarea
                id="rollback_plan"
                rows={3}
                value={rollbackPlan}
                onChange={(e) => setRollbackPlan(e.target.value)}
              />
            </Field>
          </>
        ) : null}

        <Field>
          <FieldLabel htmlFor="note">Add a note</FieldLabel>
          <Textarea
            id="note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="file">Replace attachment (optional)</FieldLabel>
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
            {submitting ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
