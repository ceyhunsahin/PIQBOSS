import { z } from 'zod';

/** Tüm sorgularda ortak: tarih aralığı (3M satır problemi aralığa göre ölçeklenir). */
export const DateRangeSchema = z
  .object({
    from: z.string().date(),
    to: z.string().date(),
  })
  .refine((v) => v.from <= v.to, { message: 'from <= to olmalı' });
export type DateRange = z.infer<typeof DateRangeSchema>;

/** Boyut filtreleri (rollup tablolarındaki indexli kolonlarla eşleşir). */
export const DimensionFilterSchema = z.object({
  groupId: z.string().max(50).optional(),
  depotId: z.string().max(50).optional(),
  deviceId: z.string().max(50).optional(),
});
export type DimensionFilter = z.infer<typeof DimensionFilterSchema>;

/** Keyset/cursor pagination — offset yerine (index'siz kaynakta offset pahalı). */
export const CursorPageSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(200).default(50),
});
export type CursorPage = z.infer<typeof CursorPageSchema>;

export const PagedResultSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    nextCursor: z.string().nullable(),
  });
export type PagedResult<T> = { items: T[]; nextCursor: string | null };

export const ApiErrorSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  code: z.string().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
