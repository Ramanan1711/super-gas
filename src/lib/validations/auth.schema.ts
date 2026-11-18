import { z } from 'zod';

export const loginSchema = z.object({
  phoneOrEmail: z.string().min(3, 'Phone number or email is required').trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().regex(/^\+?[0-9\s-]{10,15}$/, 'Invalid phone number format').optional(),
  altPhone: z.string().regex(/^\+?[0-9\s-]{10,15}$/, 'Invalid alternate phone number').nullable().optional(),
  address: z.string().min(5, 'Address is too short').optional(),
  bloodGroup: z.string().max(20).optional(),
});

export const updateDocumentPucSchema = z.object({
  docNumber: z.string().min(5, 'Valid PUC Certificate number is required').trim(),
  validUntil: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateDocumentPucInput = z.infer<typeof updateDocumentPucSchema>;
