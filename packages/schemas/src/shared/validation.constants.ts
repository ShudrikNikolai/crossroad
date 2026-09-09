import z from 'zod';

export const PASSWORD_VALIDATION = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(64, 'Password must not exceed 64 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    'Password must contain at least one special character',
  );

export const EMAIL_VALIDATION = z
  .string()
  .email('Invalid email format')
  .max(255, 'Email must not exceed 255 characters');

export const URL_VALIDATION = z.string().url('Invalid URL format').max(255);

export const USERNAME_VALIDATION = z
  .string()
  .min(3, 'Username must be at least 3 characters long')
  .max(64, 'Username must not exceed 64 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, underscores and hyphens',
  )

export const OBJECTID_VALIDATION = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')

export const PHONE_VALIDATION = z
  .string()
  .regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format');
