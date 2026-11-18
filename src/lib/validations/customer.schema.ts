import { z } from 'zod';

export const createCustomerSchema = z.object({
  customerCode: z.string().min(3).optional(),
  name: z.string().min(2, 'Customer name is required'),
  businessName: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().min(8, 'Phone number must be at least 8 digits'),
  altPhone: z.string().optional(),
  address: z.string().min(2, 'Address is required'),
  customerType: z.enum([
    'COMMERCIAL',
    'DOMESTIC',
    'INDUSTRIAL',
    'Residential',
    'Commercial',
    'B2B',
  ]).default('COMMERCIAL'),
  creditDays: z.number().int().min(0).default(0).optional(),
  creditLimit: z.number().min(0).default(0).optional(),
  route: z.string().optional(),
  notes: z.string().max(500).optional(),
  deliveryPartnerName: z.string().optional(),
  deliveryPartnerCode: z.string().optional(),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(2).optional(),
  businessName: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().min(8).optional(),
  altPhone: z.string().optional(),
  address: z.string().min(2).optional(),
  customerType: z.enum([
    'COMMERCIAL',
    'DOMESTIC',
    'INDUSTRIAL',
    'Residential',
    'Commercial',
    'B2B',
  ]).optional(),
  creditDays: z.number().int().min(0).optional(),
  creditLimit: z.number().min(0).optional(),
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
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type UpdateCustomerBalanceInput = z.infer<typeof updateCustomerBalanceSchema>;
