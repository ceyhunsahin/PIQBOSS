import { z } from 'zod';

export const ParamRowSchema = z.object({
  GUID: z.string().optional(),
  TYPE: z.number().optional(),
  ID: z.string(),
  VALUE: z.string().optional(),
  SPECIAL: z.string().optional(),
  USERS: z.string().optional(),
  PAGE: z.string().optional(),
  ELEMENT: z.string().optional(),
  APP: z.string().optional(),
});
export type ParamRow = z.infer<typeof ParamRowSchema>;

export const AccessRowSchema = z.object({
  GUID: z.string().optional(),
  ID: z.string(),
  VALUE: z.string().optional(),
  SPECIAL: z.string().optional(),
  USERS: z.string().optional(),
  PAGE: z.string().optional(),
  ELEMENT: z.string().optional(),
  APP: z.string().optional(),
});
export type AccessRow = z.infer<typeof AccessRowSchema>;
