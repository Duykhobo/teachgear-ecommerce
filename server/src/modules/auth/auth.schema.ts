import { JwtPayload } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { TokenType } from '~/common/constants/enums'
import { USERS_MESSAGES } from '~/common/constants/messages'

// --- Common Schemas ---
const passwordSchema = z
  .string()
  .min(8, { message: USERS_MESSAGES.PASSWORD_MUST_BE_AT_LEAST_8_CHARACTERS })
  .max(50, { message: USERS_MESSAGES.PASSWORD_MUST_BE_LESS_THAN_50_CHARACTERS })

const emailSchema = z.string().email({ message: USERS_MESSAGES.INVALID_EMAIL })

// --- Body Schemas ---
export const RegisterBodySchema = z
  .object({
    name: z.string().trim().min(1, { message: USERS_MESSAGES.NAME_IS_REQUIRED }),
    email: emailSchema,
    password: passwordSchema,
    confirm_password: z.string().min(8),
    date_of_birth: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: USERS_MESSAGES.INVALID_DATE_OF_BIRTH
    })
  })
  .strict()
  .superRefine(({ confirm_password, password }, ctx) => {
    if (confirm_password !== password) {
      ctx.addIssue({
        code: 'custom',
        message: USERS_MESSAGES.CONFIRM_PASSWORD_NOT_MATCH,
        path: ['confirm_password']
      })
    }
  })

export const LoginBodySchema = z.object({
  email: emailSchema,
  password: passwordSchema
})

export const LogoutBodySchema = z.object({
  refresh_token: z.string().trim().min(1, { message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED })
})

export const RefreshTokenBodySchema = z.object({
  refresh_token: z.string().trim().min(1, { message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED })
})

export const ForgotPasswordBodySchema = z.object({
  email: emailSchema
})

export const VerifyForgotPasswordTokenBodySchema = z.object({
  forgot_password_token: z.string().trim().min(1)
})

export const ResetPasswordBodySchema = z
  .object({
    forgot_password_token: z.string().trim().min(1),
    password: passwordSchema,
    confirm_password: z.string().min(8)
  })
  .strict()
  .superRefine(({ confirm_password, password }, ctx) => {
    if (confirm_password !== password) {
      ctx.addIssue({
        code: 'custom',
        message: USERS_MESSAGES.CONFIRM_PASSWORD_NOT_MATCH,
        path: ['confirm_password']
      })
    }
  })

// --- Query Schemas ---
export const EmailVerifyQuerySchema = z.object({
  email_verify_token: z.string().trim().min(1)
})

// --- Request Schemas (for middleware) ---
export const RegisterSchema = z.object({ body: RegisterBodySchema })
export const LoginSchema = z.object({ body: LoginBodySchema })
export const LogoutSchema = z.object({ body: LogoutBodySchema })
export const RefreshTokenSchema = z.object({ body: RefreshTokenBodySchema })
export const ForgotPasswordSchema = z.object({ body: ForgotPasswordBodySchema })
export const VerifyForgotPasswordTokenSchema = z.object({ body: VerifyForgotPasswordTokenBodySchema })
export const ResetPasswordSchema = z.object({ body: ResetPasswordBodySchema })
export const EmailVerifySchema = z.object({ query: EmailVerifyQuerySchema })

// --- Types(For Service) ---
export type RegisterReqBody = z.infer<typeof RegisterBodySchema>
export type LoginReqBody = z.infer<typeof LoginBodySchema>
export type LogoutReqBody = z.infer<typeof LogoutBodySchema>
export type RefreshTokenReqBody = z.infer<typeof RefreshTokenBodySchema>
export type ForgotPasswordReqBody = z.infer<typeof ForgotPasswordBodySchema>
export type VerifyForgotPasswordTokenReqBody = z.infer<typeof VerifyForgotPasswordTokenBodySchema>
export type ResetPasswordReqBody = z.infer<typeof ResetPasswordBodySchema>
export type EmailVerifyReqBody = z.infer<typeof EmailVerifyQuerySchema>
// --- Models ---

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
}
interface RefreshTokenType {
  _id?: ObjectId
  token: string
  created_at?: Date
  user_id: ObjectId
}

export default class RefreshToken {
  _id?: ObjectId
  token: string
  created_at: Date
  user_id: ObjectId

  constructor({ _id, token, created_at, user_id }: RefreshTokenType) {
    this._id = _id
    this.token = token
    this.created_at = created_at || new Date()
    this.user_id = user_id
  }
}
