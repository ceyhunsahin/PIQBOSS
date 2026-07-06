import { z } from 'zod';

export const RestDashboardSnapshotSchema = z.object({
  orderTotal: z.number().default(0),
  orderCount: z.number().default(0),
  avgOrder: z.number().default(0),
  waitingOrders: z.number().default(0),
  completedOrders: z.number().default(0),
  occupancyRate: z.number().default(0),
  occupiedTables: z.number().default(0),
  totalTables: z.number().default(0),
  unprintedOrders: z.number().default(0),
  dailyDiscount: z.number().default(0),
  avgPerPerson: z.number().default(0),
  avgPerTable: z.number().default(0),
  openTables: z.number().default(0),
  totalGuests: z.number().default(0),
  avgServiceTime: z.number().default(0)
});
export type RestDashboardSnapshot = z.infer<typeof RestDashboardSnapshotSchema>;
