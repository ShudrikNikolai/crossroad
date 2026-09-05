import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(64, 'Email must not exceed 64 characters')
    .toLowerCase()
    .transform((email) => email.toLowerCase().trim()),

  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(64, 'Username must not exceed 64 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores and hyphens',
    ),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(64, 'Password must not exceed 64 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      'Password must contain at least one special character',
    ),

  authMethod: z.enum(['oauth', 'email']).default('email'),
});

export type TCreateUserSchema = z.infer<typeof CreateUserSchema>;
