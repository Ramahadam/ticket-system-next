import { describe, it, expect } from 'vitest';
import {
  incidentCreateSchema,
  serviceRequestCreateSchema,
  ticketUpdateSchema,
  buildTicketCreateSchema,
} from '../tickets';

const validBase = {
  summary: 'Login page is broken',
  description: 'Users cannot log in since the deploy',
  priority: 2,
};

// ─── incidentCreateSchema ────────────────────────────────────────────────────

describe('incidentCreateSchema', () => {
  it('accepts valid input', () => {
    const result = incidentCreateSchema.safeParse({ ...validBase, impact: 'one' });
    expect(result.success).toBe(true);
  });

  it('rejects missing impact', () => {
    const result = incidentCreateSchema.safeParse(validBase);
    expect(result.success).toBe(false);
  });

  it('rejects invalid impact value', () => {
    const result = incidentCreateSchema.safeParse({ ...validBase, impact: 'zero' });
    expect(result.success).toBe(false);
  });

  it('rejects summary shorter than 5 chars', () => {
    const result = incidentCreateSchema.safeParse({ ...validBase, impact: 'one', summary: 'Hi' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Summary must be at least 5 characters');
    }
  });

  it('rejects description shorter than 5 chars', () => {
    const result = incidentCreateSchema.safeParse({
      ...validBase,
      impact: 'one',
      description: 'bad',
    });
    expect(result.success).toBe(false);
  });

  it('rejects priority out of range', () => {
    const low = incidentCreateSchema.safeParse({ ...validBase, impact: 'one', priority: 5 });
    const high = incidentCreateSchema.safeParse({ ...validBase, impact: 'one', priority: 0 });
    expect(low.success).toBe(false);
    expect(high.success).toBe(false);
  });

  it('trims whitespace from summary and description', () => {
    const result = incidentCreateSchema.safeParse({
      ...validBase,
      summary: '  Login page is broken  ',
      description: '  Users cannot log in  ',
      impact: 'one',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.summary).toBe('Login page is broken');
      expect(result.data.description).toBe('Users cannot log in');
    }
  });

  it('transforms empty owner to undefined', () => {
    const result = incidentCreateSchema.safeParse({ ...validBase, impact: 'one', owner: '' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.owner).toBeUndefined();
  });

  it('keeps non-empty owner as string', () => {
    const result = incidentCreateSchema.safeParse({
      ...validBase,
      impact: 'one',
      owner: 'alice@example.com',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.owner).toBe('alice@example.com');
  });
});

// ─── serviceRequestCreateSchema ─────────────────────────────────────────────

describe('serviceRequestCreateSchema', () => {
  it('accepts valid input without impact', () => {
    const result = serviceRequestCreateSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it('accepts valid input with impact', () => {
    const result = serviceRequestCreateSchema.safeParse({ ...validBase, impact: 'many' });
    expect(result.success).toBe(true);
  });

  it('transforms empty impact string to undefined', () => {
    const result = serviceRequestCreateSchema.safeParse({ ...validBase, impact: '' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.impact).toBeUndefined();
  });

  it('rejects invalid impact value', () => {
    const result = serviceRequestCreateSchema.safeParse({ ...validBase, impact: 'critical' });
    expect(result.success).toBe(false);
  });

  it('rejects summary shorter than 5 chars', () => {
    const result = serviceRequestCreateSchema.safeParse({ ...validBase, summary: 'Fix' });
    expect(result.success).toBe(false);
  });
});

// ─── ticketUpdateSchema ──────────────────────────────────────────────────────

describe('ticketUpdateSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    const result = ticketUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts valid status', () => {
    const result = ticketUpdateSchema.safeParse({ status: 'loged' });
    expect(result.success).toBe(true);
  });

  it('rejects unknown status', () => {
    const result = ticketUpdateSchema.safeParse({ status: 'unknown-status' });
    expect(result.success).toBe(false);
  });

  it('accepts priority within range', () => {
    const result = ticketUpdateSchema.safeParse({ priority: 3 });
    expect(result.success).toBe(true);
  });

  it('rejects priority out of range', () => {
    const result = ticketUpdateSchema.safeParse({ priority: 10 });
    expect(result.success).toBe(false);
  });

  it('transforms empty noteValue to undefined', () => {
    const result = ticketUpdateSchema.safeParse({ noteValue: '   ' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.noteValue).toBeUndefined();
  });
});

// ─── buildTicketCreateSchema ─────────────────────────────────────────────────

describe('buildTicketCreateSchema', () => {
  it('returns incidentCreateSchema for incident kind', () => {
    const schema = buildTicketCreateSchema('incident');
    const result = schema.safeParse({ ...validBase, impact: 'two' });
    expect(result.success).toBe(true);
  });

  it('returns serviceRequestCreateSchema for serviceRequest kind', () => {
    const schema = buildTicketCreateSchema('serviceRequest');
    const result = schema.safeParse(validBase);
    expect(result.success).toBe(true);
  });
});
