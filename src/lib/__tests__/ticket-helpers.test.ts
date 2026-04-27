import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildNoteEntry,
  withOwnershipFilter,
  parseTicketListParams,
  mergeNotes,
} from '../ticket-helpers';

// ─── buildNoteEntry ──────────────────────────────────────────────────────────

describe('buildNoteEntry', () => {
  it('returns a note with the provided value and author', () => {
    const note = buildNoteEntry('Server is down', 'alice@example.com');
    expect(note.noteValue).toBe('Server is down');
    expect(note.createBy).toBe('alice@example.com');
  });

  it('generates a unique noteId each time', () => {
    const a = buildNoteEntry('Note A', 'alice@example.com');
    const b = buildNoteEntry('Note B', 'alice@example.com');
    expect(a.noteId).not.toBe(b.noteId);
  });

  it('sets createdAt to a Date instance', () => {
    const note = buildNoteEntry('Test', 'alice@example.com');
    expect(note.createdAt).toBeInstanceOf(Date);
  });
});

// ─── mergeNotes ──────────────────────────────────────────────────────────────

describe('mergeNotes', () => {
  const makeNote = (value: string) => buildNoteEntry(value, 'user@example.com');

  it('appends new note to existing list', () => {
    const existing = [makeNote('First note')];
    const incoming = makeNote('Second note');
    const result = mergeNotes(existing, incoming);
    expect(result).toHaveLength(2);
    expect(result[1].noteValue).toBe('Second note');
  });

  it('returns single-item array when existing is null', () => {
    const incoming = makeNote('Only note');
    const result = mergeNotes(null, incoming);
    expect(result).toHaveLength(1);
    expect(result[0].noteValue).toBe('Only note');
  });

  it('returns existing list unchanged when incoming is null', () => {
    const existing = [makeNote('Existing')];
    const result = mergeNotes(existing, null);
    expect(result).toHaveLength(1);
  });

  it('returns empty array when both are null/undefined', () => {
    const result = mergeNotes(null, null);
    expect(result).toEqual([]);
  });
});

// ─── withOwnershipFilter ─────────────────────────────────────────────────────

describe('withOwnershipFilter', () => {
  it('adds requester filter for standard role', () => {
    const where = { status: 'loged' };
    const result = withOwnershipFilter(where, { role: 'standard', email: 'user@example.com' });
    expect(result).toEqual({ status: 'loged', requester: 'user@example.com' });
  });

  it('does not add requester filter for analyst role', () => {
    const where = { status: 'loged' };
    const result = withOwnershipFilter(where, { role: 'analyst', email: 'staff@example.com' });
    expect(result).toEqual({ status: 'loged' });
    expect(result).not.toHaveProperty('requester');
  });

  it('does not add requester filter for admin role', () => {
    const where = {};
    const result = withOwnershipFilter(where, { role: 'admin', email: 'admin@example.com' });
    expect(result).toEqual({});
  });

  it('preserves existing where fields for standard role', () => {
    const where = { priority: 1, status: 'progress' };
    const result = withOwnershipFilter(where, { role: 'standard', email: 'user@example.com' });
    expect(result.priority).toBe(1);
    expect(result.status).toBe('progress');
    expect(result.requester).toBe('user@example.com');
  });
});

// ─── parseTicketListParams ───────────────────────────────────────────────────

describe('parseTicketListParams', () => {
  const sortable = ['status', 'priority', 'createdAt'] as const;

  it('returns page 1 defaults for empty params', () => {
    const result = parseTicketListParams({}, 10, { sortable });
    expect(result.page).toBe(1);
    expect(result.skip).toBe(0);
    expect(result.take).toBe(10);
    expect(result.status).toBeUndefined();
    expect(result.orderBy).toEqual({ createdAt: 'desc' });
  });

  it('calculates correct skip for page 3', () => {
    const result = parseTicketListParams({ page: '3' }, 10, { sortable });
    expect(result.page).toBe(3);
    expect(result.skip).toBe(20);
  });

  it('clamps page to minimum 1 for invalid input', () => {
    const result = parseTicketListParams({ page: '-5' }, 10, { sortable });
    expect(result.page).toBe(1);
    expect(result.skip).toBe(0);
  });

  it('clamps page to 1 for non-numeric input', () => {
    const result = parseTicketListParams({ page: 'abc' }, 10, { sortable });
    expect(result.page).toBe(1);
  });

  it('extracts status filter', () => {
    const result = parseTicketListParams({ status: 'progress' }, 10, { sortable });
    expect(result.status).toBe('progress');
  });

  it('returns undefined status for "all"', () => {
    const result = parseTicketListParams({ status: 'all' }, 10, { sortable });
    expect(result.status).toBeUndefined();
  });

  it('applies valid sort column and direction', () => {
    const result = parseTicketListParams({ sort: 'priority-asc' }, 10, { sortable });
    expect(result.orderBy).toEqual({ priority: 'asc' });
  });

  it('falls back to default column for unsortable column, keeps parsed direction', () => {
    // column falls back to createdAt; direction is still taken from the raw sort string
    const result = parseTicketListParams({ sort: 'unknown-asc' }, 10, { sortable });
    expect(result.orderBy).toEqual({ createdAt: 'asc' });
  });

  it('uses provided defaultSort', () => {
    const result = parseTicketListParams({}, 10, { sortable, defaultSort: 'priority-asc' });
    expect(result.orderBy).toEqual({ priority: 'asc' });
  });

  it('handles array page param by taking first value', () => {
    const result = parseTicketListParams({ page: ['2', '5'] }, 10, { sortable });
    expect(result.page).toBe(2);
  });
});
