import { z } from 'zod';

export const LoginRequestSchema = z.object({
  tenant: z.string().min(1).max(50),
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

/** access token RAM'de tutulur; refresh token cihazda expo-secure-store'da saklanır. */
export const TokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int(),
});
export type TokenPair = z.infer<typeof TokenPairSchema>;

export const RefreshRequestSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshRequest = z.infer<typeof RefreshRequestSchema>;

export const AuthUserSchema = z.object({
  userId: z.string(),
  tenant: z.string(),
  username: z.string(),
  displayName: z.string().optional(),
  roles: z.array(z.string()).default([]),
});
export type AuthUser = z.infer<typeof AuthUserSchema>;

export const LoginResponseSchema = z.object({
  user: AuthUserSchema,
  tokens: TokenPairSchema,
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

/** JWT payload (access token içeriği). */
export const JwtPayloadSchema = z.object({
  sub: z.string(),
  tenant: z.string(),
  roles: z.array(z.string()),
});
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
