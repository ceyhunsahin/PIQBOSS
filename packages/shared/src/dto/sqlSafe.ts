import { z } from 'zod';

export const SqlSafeRequestSchema = z.object({
  queryId: z.string().min(1).max(120),
  param: z.array(z.string()),
  value: z.array(z.unknown()),
  tag: z.string().optional(),
});
export type SqlSafeRequest = z.infer<typeof SqlSafeRequestSchema>;

export const SqlSafeResultSchema = z.object({
  status: z.enum(['OK', 'ERR']),
  result: z.object({
    recordset: z.array(z.record(z.unknown())).default([]),
    err: z.unknown().optional(),
  }).optional(),
  msg: z.string().optional(),
});
export type SqlSafeResult = z.infer<typeof SqlSafeResultSchema>;
