import { z } from 'zod';

export const createHandoverEventSchema = z.object({
  partnerId: z.string().optional(),
  partnerCode: z.string().optional(),
  amount: z.number().positive('Handover cash amount must be greater than zero'),
  dropType: z.enum(['AFTERNOON_DROP', 'EVENING_VAULT', 'END_OF_SHIFT']).default('EVENING_VAULT'),
  receivedByName: z.string().min(2, 'Admin name is required').default('S. Raman (Admin)'),
  stampNumber: z.string().optional(),
  handoverTime: z.string().datetime().optional(),
});

export const auditSettlementSchema = z.object({
  settlementId: z.string().min(1, 'Settlement ID is required'),
  status: z.enum(['VERIFIED', 'PENDING_VERIFICATION', 'PARTIALLY_HANDED_OVER', 'DIFFERENCE_FOUND']),
  auditRemarks: z.string().max(500).optional(),
  shortfallAmount: z.number().min(0).default(0),
});

export type CreateHandoverEventInput = z.infer<typeof createHandoverEventSchema>;
export type AuditSettlementInput = z.infer<typeof auditSettlementSchema>;
