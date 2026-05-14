import { z } from 'zod'

// --- Request DTOs ---

export const RegisterDtoSchema = z.object({
  email: z.string().email('Invalid email address').max(254, 'Email must be at most 254 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
})

export type RegisterDto = z.infer<typeof RegisterDtoSchema>

export const LoginDtoSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type LoginDto = z.infer<typeof LoginDtoSchema>

export const RefreshTokenDtoSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

export type RefreshTokenDto = z.infer<typeof RefreshTokenDtoSchema>

// --- Response Types ---

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
})

export type User = z.infer<typeof UserSchema>

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.literal('Bearer'),
  expiresIn: z.string(),
  user: UserSchema,
})

export type AuthResponse = z.infer<typeof AuthResponseSchema>

export const TokenRefreshResponseSchema = z.object({
  accessToken: z.string(),
  tokenType: z.literal('Bearer'),
  expiresIn: z.string(),
})

export type TokenRefreshResponse = z.infer<typeof TokenRefreshResponseSchema>

export const ApiErrorSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  error: z.string().optional(),
})

export type ApiError = z.infer<typeof ApiErrorSchema>
