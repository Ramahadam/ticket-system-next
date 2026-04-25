import { z } from 'zod';
import { TICKET_STATUS } from '../constants';

const statusValues = Object.values(TICKET_STATUS) as [string, ...string[]];
const impactValues = ['one', 'two', 'many'] as const;

export const IMPACT_VALUES = impactValues;
export type Impact = (typeof impactValues)[number];

const baseCreate = z.object({
  summary: z.string().trim().min(5, { message: 'Summary must be at least 5 characters' }),
  description: z
    .string()
    .trim()
    .min(5, { message: 'Description must be at least 5 characters' }),
  priority: z
    .number()
    .int()
    .min(1, { message: 'Select a priority' })
    .max(4, { message: 'Priority must be between 1 and 4' }),
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

export const incidentCreateSchema = baseCreate.extend({
  impact: z.enum(impactValues, { message: 'Select an impact' }),
});

export const serviceRequestCreateSchema = baseCreate.extend({
  impact: z
    .enum(impactValues)
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export type IncidentCreateInput = z.input<typeof incidentCreateSchema>;
export type IncidentCreateOutput = z.output<typeof incidentCreateSchema>;
export type ServiceRequestCreateInput = z.input<typeof serviceRequestCreateSchema>;
export type ServiceRequestCreateOutput = z.output<typeof serviceRequestCreateSchema>;

export type TicketKind = 'incident' | 'serviceRequest';

export function buildTicketCreateSchema(kind: TicketKind) {
  return kind === 'incident' ? incidentCreateSchema : serviceRequestCreateSchema;
}

export const ticketUpdateSchema = z.object({
  status: z.enum(statusValues).optional(),
  owner: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  priority: z.number().int().min(1).max(4).optional(),
  impact: z.enum(impactValues).optional(),
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

export type TicketUpdateInput = z.input<typeof ticketUpdateSchema>;
export type TicketUpdateOutput = z.output<typeof ticketUpdateSchema>;
