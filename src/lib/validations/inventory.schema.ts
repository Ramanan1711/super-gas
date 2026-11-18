import { z } from 'zod';

export const stockTransferItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  filledQuantity: z.number().int().min(0).default(0),
  emptyQuantity: z.number().int().min(0).default(0),
  damagedQuantity: z.number().int().min(0).default(0),
});

export const stockTransferSchema = z.object({
  depotId: z.string().min(1, 'Depot ID is required'),
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  partnerId: z.string().optional(),
  transferType: z.enum(['LOAD_VEHICLE', 'UNLOAD_VEHICLE', 'DEPOT_REFILL']),
  notes: z.string().max(500).optional(),
  items: z.array(stockTransferItemInputSchema).min(1, 'At least one product item is required'),
});

export type StockTransferItemInput = z.infer<typeof stockTransferItemInputSchema>;
export type StockTransferInput = z.infer<typeof stockTransferSchema>;
