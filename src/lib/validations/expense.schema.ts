import { z } from 'zod';

export const createExpenseSchema = z.object({
  partnerId: z.string().optional(),
  partnerCode: z.string().optional(),
  vehicleId: z.string().optional(),
  vehicleReg: z.string().optional(),
  category: z.enum([
    'FUEL_PETROL',
    'TOLL_CHARGES',
    'VEHICLE_MAINTENANCE',
    'PARKING_CHARGES',
    'VEHICLE_REPAIR',
    'FOOD_ALLOWANCE',
    'MOBILE_DATA',
    'OTHER',
  ]),
  categoryLabel: z.string().optional(),
  amount: z.number().positive('Expense amount must be greater than zero'),
  description: z.string().min(3, 'Detailed description is required').max(500),
  receiptUrl: z.string().optional().nullable(),
  claimDate: z.string().optional(),
});

export const reviewExpenseSchema = z.object({
  expenseId: z.string().min(1, 'Expense ID is required'),
  status: z.enum(['APPROVED', 'REJECTED']),
  adminRemark: z.string().max(500).optional(),
  disbursedAmount: z.number().min(0).optional(),
  disbursementMode: z.string().optional(),
  referenceNumber: z.string().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type ReviewExpenseInput = z.infer<typeof reviewExpenseSchema>;
