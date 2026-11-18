import { z } from 'zod';

export const createCustomerSchema = z.object({
  customerCode: z.string().min(3).optional(),
  name: z.string().min(2, 'Customer name is required'),
  businessName: z.string().min(2, 'Business name is required'),
  contactPerson: z.string().optional(),
  phone: z.string().regex(/^\+?[0-9\s-]{10,15}$/, 'Invalid phone number format'),
  altPhone: z.string().optional(),
  address: z.string().min(5, 'Address is too short'),
  customerType: z.enum(['COMMERCIAL', 'DOMESTIC', 'INDUSTRIAL']).default('COMMERCIAL'),
  creditDays: z.number().int().min(0).default(0),
  creditLimit: z.number().min(0).default(0),
  route: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const updateCustomerBalanceSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  amount: z.number(),
  type: z.enum(['INVOICE', 'PAYMENT', 'DEPOSIT_HOLD', 'ADJUSTMENT', 'RETURN_CREDIT']),
  referenceNumber: z.string().min(1, 'Reference number is required'),
  notes: z.string().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerBalanceInput = z.infer<typeof updateCustomerBalanceSchema>;
