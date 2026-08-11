import { JwtPayload } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import {
  RegisterBodySchema,
  LoginBodySchema,
  LogoutBodySchema,
  RefreshTokenBodySchema,
  ForgotPasswordBodySchema,
  VerifyForgotPasswordTokenBodySchema,
  ResetPasswordBodySchema,
  EmailVerifyBodySchema
} from '../schemas/auth.validation'
import z from 'zod'
import { TokenType, USER_ROLE } from '~/common/constants/enums'

// --- Types(For Service) ---
export type RegisterReqBody = z.infer<typeof RegisterBodySchema>
export type LoginReqBody = z.infer<typeof LoginBodySchema>
export type LogoutReqBody = z.infer<typeof LogoutBodySchema>
export type RefreshTokenReqBody = z.infer<typeof RefreshTokenBodySchema>
export type ForgotPasswordReqBody = z.infer<typeof ForgotPasswordBodySchema>
export type VerifyForgotPasswordTokenReqBody = z.infer<typeof VerifyForgotPasswordTokenBodySchema>
export type EmailVerifyReqBody = z.infer<typeof EmailVerifyBodySchema>
export type RefreshTokenPayload = {
  user_id: string
  token_type: TokenType
  role: USER_ROLE
  exp: number
  iat: number
}
export type ResetPasswordReqBody = z.infer<typeof ResetPasswordBodySchema>

// --- Models ---

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  role: USER_ROLE
}

export interface RefreshTokenType {
  _id?: ObjectId
  token: string
  created_at?: Date
  user_id: ObjectId
}
