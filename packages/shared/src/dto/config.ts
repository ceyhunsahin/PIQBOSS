import { z } from 'zod';

/** prm.js → DB-backed parametre. Eski şekil {TYPE, ID, VALUE, APP, VIEW} korunur. */
export const ParamSchema = z.object({
  type: z.string(),
  id: z.string(),
  value: z.string(),
  app: z.string(),
  view: z.string().optional(),
});
export type Param = z.infer<typeof ParamSchema>;

/** acs.js → DB-backed erişim/yetki tanımı. */
export const AccessSchema = z.object({
  type: z.string(),
  id: z.string(),
  value: z.string(),
  app: z.string(),
  view: z.string().optional(),
});
export type Access = z.infer<typeof AccessSchema>;

/** Uygulama açılışında telefona inen config paketi (tenant'a göre). */
export const ConfigBundleSchema = z.object({
  app: z.string(),
  params: z.array(ParamSchema),
  access: z.array(AccessSchema),
  /** İstemci cache invalidation için sürüm/etag. */
  version: z.string(),
});
export type ConfigBundle = z.infer<typeof ConfigBundleSchema>;

/** Tipli lookup (depot, group vb.). */
export const LookupItemSchema = z.object({
  id: z.string(),
  label: z.string(),
});
export type LookupItem = z.infer<typeof LookupItemSchema>;
