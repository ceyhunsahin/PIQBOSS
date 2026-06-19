import { z } from 'zod';
import { DateRangeSchema, DimensionFilterSchema } from './common.js';

/** Satış raporu isteği — rollup'tan ANLIK hesaplanır (aralığa göre 365 satır toplanır). */
export const SalesReportQuerySchema = DateRangeSchema.and(DimensionFilterSchema);
export type SalesReportQuery = z.infer<typeof SalesReportQuerySchema>;

/** Toplanabilir (additive) metrikler — günlük rollup satırları doğrudan toplanır. */
export const SalesKpiSchema = z.object({
  totalAmount: z.number(),
  totalQty: z.number(),
  ticketCount: z.number(),
  discountAmount: z.number(),
});
export type SalesKpi = z.infer<typeof SalesKpiSchema>;

/** Toplanamaz (non-additive) metrikler — bileşenlerinden okurken türetilir. */
export const SalesDerivedSchema = z.object({
  avgTicket: z.number(),
  marginPct: z.number(),
});
export type SalesDerived = z.infer<typeof SalesDerivedSchema>;

/** Grafik için günlük seri (FlashList/victory-native). */
export const DailyPointSchema = z.object({
  date: z.string().date(),
  amount: z.number(),
  qty: z.number(),
});
export type DailyPoint = z.infer<typeof DailyPointSchema>;

export const SalesReportResultSchema = z.object({
  range: DateRangeSchema,
  kpi: SalesKpiSchema,
  derived: SalesDerivedSchema,
  series: z.array(DailyPointSchema),
});
export type SalesReportResult = z.infer<typeof SalesReportResultSchema>;
