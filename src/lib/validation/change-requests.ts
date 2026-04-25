import { z } from 'zod';

const categoryValues = ['software', 'hardware', 'network', 'servers', 'storage', 'exchange'] as const;
const statusValues = ['requested', 'pending approval', 'approved', 'cancelled', 'implemented'] as const;

export const CATEGORY_VALUES = categoryValues;
export const CR_STATUS_VALUES = statusValues;
export type ChangeCategory = (typeof categoryValues)[number];

export const changeRequestCreateSchema = z.object({
  summary: z.string().trim().min(5, { message: 'Summary must be at least 5 characters' }),
  description: z
    .string()
    .trim()
    .min(5, { message: 'Description must be at least 5 characters' }),
  category: z.enum(categoryValues, { message: 'Select a category' }),
  classification: z
    .number()
    .int()
    .min(1, { message: 'Select a classification' })
    .max(4, { message: 'Classification must be between 1 and 4' }),
  rollback_plan: z
    .string()
    .trim()
    .min(5, { message: 'Rollback plan must be at least 5 characters' }),
  owner: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  file: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  noteValue: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});

export const changeRequestUpdateSchema = z.object({
  status: z.enum(statusValues).optional(),
  category: z.enum(categoryValues).optional(),
  classification: z.number().int().min(1).max(4).optional(),
  rollback_plan: z.string().trim().min(5).optional(),
  owner: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  noteValue: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  file: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});

export type ChangeRequestCreateInput = z.input<typeof changeRequestCreateSchema>;
export type ChangeRequestUpdateInput = z.input<typeof changeRequestUpdateSchema>;
