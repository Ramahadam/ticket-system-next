import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Please enter a valid email' }),
  password: z.string().min(5, { message: 'Password must be at least 5 characters' }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
