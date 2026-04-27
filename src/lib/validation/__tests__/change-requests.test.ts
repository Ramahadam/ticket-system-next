import { describe, it, expect } from 'vitest';
import { changeRequestCreateSchema, changeRequestUpdateSchema } from '../change-requests';

const validCreate = {
  summary: 'Upgrade database to v15',
  description: 'Postgres upgrade required for new features',
  category: 'servers' as const,
  classification: 2,
  rollback_plan: 'Restore from snapshot taken before upgrade',
};

// ─── changeRequestCreateSchema ───────────────────────────────────────────────

describe('changeRequestCreateSchema', () => {
  it('accepts valid input', () => {
    const result = changeRequestCreateSchema.safeParse(validCreate);
    expect(result.success).toBe(true);
  });

  it('rejects missing category', () => {
    const { category: _, ...rest } = validCreate;
    const result = changeRequestCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects invalid category', () => {
    const result = changeRequestCreateSchema.safeParse({ ...validCreate, category: 'cloud' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid categories', () => {
    const categories = ['software', 'hardware', 'network', 'servers', 'storage', 'exchange'];
    for (const category of categories) {
      const result = changeRequestCreateSchema.safeParse({ ...validCreate, category });
      expect(result.success, `category "${category}" should be valid`).toBe(true);
    }
  });

  it('rejects missing rollback_plan', () => {
    const { rollback_plan: _, ...rest } = validCreate;
    const result = changeRequestCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects rollback_plan shorter than 5 chars', () => {
    const result = changeRequestCreateSchema.safeParse({ ...validCreate, rollback_plan: 'N/A' });
    expect(result.success).toBe(false);
  });

  it('rejects classification out of range', () => {
    const low = changeRequestCreateSchema.safeParse({ ...validCreate, classification: 0 });
    const high = changeRequestCreateSchema.safeParse({ ...validCreate, classification: 5 });
    expect(low.success).toBe(false);
    expect(high.success).toBe(false);
  });

  it('rejects summary shorter than 5 chars', () => {
    const result = changeRequestCreateSchema.safeParse({ ...validCreate, summary: 'Fix' });
    expect(result.success).toBe(false);
  });

  it('transforms empty owner to undefined', () => {
    const result = changeRequestCreateSchema.safeParse({ ...validCreate, owner: '' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.owner).toBeUndefined();
  });

  it('keeps non-empty owner', () => {
    const result = changeRequestCreateSchema.safeParse({
      ...validCreate,
      owner: 'bob@example.com',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.owner).toBe('bob@example.com');
  });
});

// ─── changeRequestUpdateSchema ───────────────────────────────────────────────

describe('changeRequestUpdateSchema', () => {
  it('accepts empty object (all optional)', () => {
    const result = changeRequestUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts valid status', () => {
    const result = changeRequestUpdateSchema.safeParse({ status: 'approved' });
    expect(result.success).toBe(true);
  });

  it('rejects unknown status', () => {
    const result = changeRequestUpdateSchema.safeParse({ status: 'escalated' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid statuses', () => {
    const statuses = ['requested', 'pending approval', 'approved', 'cancelled', 'implemented'];
    for (const status of statuses) {
      const result = changeRequestUpdateSchema.safeParse({ status });
      expect(result.success, `status "${status}" should be valid`).toBe(true);
    }
  });

  it('accepts valid rollback_plan update', () => {
    const result = changeRequestUpdateSchema.safeParse({
      rollback_plan: 'Revert deployment via git',
    });
    expect(result.success).toBe(true);
  });

  it('rejects rollback_plan shorter than 5 chars on update', () => {
    const result = changeRequestUpdateSchema.safeParse({ rollback_plan: 'N/A' });
    expect(result.success).toBe(false);
  });

  it('transforms empty noteValue to undefined', () => {
    const result = changeRequestUpdateSchema.safeParse({ noteValue: '' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.noteValue).toBeUndefined();
  });
});
