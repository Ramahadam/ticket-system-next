import { z } from 'zod';

const roleValues = ['standard', 'analyst', 'admin'] as const;

export const USER_ROLE_VALUES = roleValues;
export type UserRoleValue = (typeof roleValues)[number];

export const userCreateSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: 'Enter a valid email' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  firstname: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  lastname: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  mobile: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  userrole: z.enum(roleValues, { message: 'Select a role' }),
});

export const userUpdateSchema = z.object({
  password: z
    .string()
    .optional()
    .transform((v) => (v && v.length >= 8 ? v : undefined)),
  firstname: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  lastname: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  mobile: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  userrole: z.enum(roleValues).optional(),
  isActive: z
    .union([z.boolean(), z.literal('true'), z.literal('false')])
    .optional()
    .transform((v) => (typeof v === 'string' ? v === 'true' : v)),
});

export type UserCreateInput = z.input<typeof userCreateSchema>;
export type UserUpdateInput = z.input<typeof userUpdateSchema>;
