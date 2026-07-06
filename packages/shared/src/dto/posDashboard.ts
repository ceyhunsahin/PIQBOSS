import { z } from 'zod';
import { DateRangeSchema } from './common.js';

export const PosDashboardSnapshotSchema = z.object({
  dailySalesTotal: z.number().default(0),
  dailySalesCount: z.number().default(0),
  salesAvg: z.number().default(0),
  dailyRebateTicket: z.number().default(0),
  dailyRebateTotal: z.number().default(0),
  dailyCustomerTicket: z.number().default(0),
  dailyUseLoyalty: z.number().default(0),
  useDiscount: z.number().default(0),
  useDiscountTicket: z.number().default(0),
  dailyPriceChange: z.number().default(0),
  dailyRowDelete: z.number().default(0),
  dailyFullDelete: z.number().default(0),
  purchaseTotal: z.number().default(0),
  purchasePrice: z.number().default(0),
  salePrice: z.number().default(0),
  purchasePriceDown: z.number().default(0),
  purchasePriceUp: z.number().default(0),
  salePriceDown: z.number().default(0),
  salePriceUp: z.number().default(0),
  balanceTicketCreated: z.number().default(0),
  balanceTicketUnchecked: z.number().default(0),
  balanceTicketNonTraite: z.number().default(0),
  balanceTicketSupprime: z.number().default(0),
  balanceTicketConfirme: z.number().default(0),
  allItemGroups: z.number().default(0),
  unsoldItemGroups: z.number().default(0),
  totalItemGroups: z.number().default(0)
});
export type PosDashboardSnapshot = z.infer<typeof PosDashboardSnapshotSchema>;

export const SalesTrendRowSchema = z.object({
  date: z.string(),
  amount: z.number()
});
export type SalesTrendRow = z.infer<typeof SalesTrendRowSchema>;

export const TopGroupRowSchema = z.object({
  name: z.string(),
  amount: z.number()
});
export type TopGroupRow = z.infer<typeof TopGroupRowSchema>;

export const TopProductRowSchema = z.object({
  name: z.string(),
  groupName: z.string().optional(),
  qty: z.number().default(0),
  amount: z.number().default(0)
});
export type TopProductRow = z.infer<typeof TopProductRowSchema>;

export const PaymentTypeRowSchema = z.object({
  name: z.string(),
  quantity: z.number()
});
export type PaymentTypeRow = z.infer<typeof PaymentTypeRowSchema>;

export const DevicePaymentRowSchema = z.object({
  device: z.string(),
  amount: z.number()
});
export type DevicePaymentRow = z.infer<typeof DevicePaymentRowSchema>;

export const VatRateRowSchema = z.object({
  rate: z.number(),
  vat: z.number(),
  amount: z.number(),
  total: z.number()
});
export type VatRateRow = z.infer<typeof VatRateRowSchema>;

export const MarginGroupRowSchema = z.object({
  name: z.string(),
  sales: z.number().default(0),
  margin: z.number().default(0),
  marginRate: z.number().default(0),
  cost: z.number().default(0),
  qty: z.number().default(0)
});
export type MarginGroupRow = z.infer<typeof MarginGroupRowSchema>;

export const PromoMarginSchema = z.object({
  sales: z.number().default(0),
  margin: z.number().default(0),
  marginRate: z.number().default(0),
  cost: z.number().default(0),
  qty: z.number().default(0)
});
export type PromoMargin = z.infer<typeof PromoMarginSchema>;

export const MonthlyGroupRowSchema = z.object({
  code: z.string(),
  name: z.string(),
  amount: z.number(),
  qty: z.number(),
  itemCount: z.number()
});
export type MonthlyGroupRow = z.infer<typeof MonthlyGroupRowSchema>;

export const ButcherRowSchema = z.object({
  name: z.string(),
  weigher: z.string(),
  unchecked: z.number(),
  amount: z.number(),
  discount: z.number(),
  deleted: z.number(),
  changeCount: z.number()
});
export type ButcherRow = z.infer<typeof ButcherRowSchema>;

export const LossItemRowSchema = z.object({
  code: z.string(),
  name: z.string(),
  margin: z.number(),
  marginRate: z.number(),
  sales: z.number()
});
export type LossItemRow = z.infer<typeof LossItemRowSchema>;

export const ComparisonSideSchema = z.object({
  total: z.number(),
  count: z.number(),
  avg: z.number()
});
export type ComparisonSide = z.infer<typeof ComparisonSideSchema>;

export const ComparisonResultSchema = z.object({
  rangeA: DateRangeSchema,
  rangeB: DateRangeSchema,
  sideA: ComparisonSideSchema,
  sideB: ComparisonSideSchema
});
export type ComparisonResult = z.infer<typeof ComparisonResultSchema>;
