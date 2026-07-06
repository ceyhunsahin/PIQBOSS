import { z } from 'zod';

export const OffDashboardSnapshotSchema = z.object({
  orderTotal: z.number().default(0),
  orderCount: z.number().default(0),
  orderAvg: z.number().default(0),
  salesTotal: z.number().default(0),
  salesCount: z.number().default(0),
  salesAvg: z.number().default(0),
  purchaseTotal: z.number().default(0),
  purchaseCount: z.number().default(0),
  totalDebt: z.number().default(0),
  totalPaid: z.number().default(0),
  netBalance: z.number().default(0),
  encaissement: z.number().default(0),
  openSalesCount: z.number().default(0),
  openSalesRemaining: z.number().default(0),
  openPurchaseCount: z.number().default(0),
  openPurchaseRemaining: z.number().default(0),
  incompleteOrdersCount: z.number().default(0),
  incompleteOrdersQty: z.number().default(0),
  pendingOrderCount: z.number().default(0),
  pendingOrderTotal: z.number().default(0),
  activeOfferCount: z.number().default(0),
  activeOfferTotal: z.number().default(0),
  pendingShipmentCount: z.number().default(0),
  pendingShipmentTotal: z.number().default(0),
  marginSales: z.number().default(0),
  marginCost: z.number().default(0),
  marginProfit: z.number().default(0),
  marginPercent: z.number().default(0)
});
export type OffDashboardSnapshot = z.infer<typeof OffDashboardSnapshotSchema>;
