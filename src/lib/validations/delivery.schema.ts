import { z } from 'zod';

export const deliveryItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  filledDelivered: z.number().int().min(0, 'Delivered count cannot be negative'),
  emptyCollected: z.number().int().min(0, 'Empty collected count cannot be negative'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
});

export const completeDeliverySchema = z.object({
  taskId: z.string().min(1, 'Delivery Task ID is required'),
  items: z.array(deliveryItemInputSchema).min(1, 'At least one cylinder item must be delivered'),
  paymentMethod: z.enum(['CASH', 'UPI_QR', 'BANK_TRANSFER', 'CREDIT_TERMS']),
  amountCollected: z.number().min(0, 'Collected amount cannot be negative'),
  paymentReference: z.string().optional(),
  customerSignatureOrOtp: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const rescheduleDeliverySchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  reason: z.string().min(3, 'Reschedule reason is required'),
  rescheduleDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
});

export type DeliveryItemInput = z.infer<typeof deliveryItemInputSchema>;
export type CompleteDeliveryInput = z.infer<typeof completeDeliverySchema>;
export type RescheduleDeliveryInput = z.infer<typeof rescheduleDeliverySchema>;
