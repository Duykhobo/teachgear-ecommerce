import { z } from 'zod'
import { USERS_MESSAGES } from '~/common/constants/messages'

// --- Common Schemas ---
const passwordSchema = z
  .string()
  .min(8, { message: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50 })
  .max(50, { message: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50 })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/, {
    message: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
  })

const emailSchema = z.string().email({ message: USERS_MESSAGES.INVALID_EMAIL })

// --- Body Schemas ---
export const RegisterBodySchema = z
  .object({
    name: z.string().trim().min(1, { message: USERS_MESSAGES.NAME_IS_REQUIRED }),
    email: emailSchema,
    password: passwordSchema,
    confirm_password: z.string().min(8, { message: USERS_MESSAGES.PASSWORD_MUST_BE_AT_LEAST_8_CHARACTERS }),
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
  forgot_password_token: z.string().trim().min(1, { message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED })
})

export const ResetPasswordBodySchema = z
  .object({
    forgot_password_token: z.string().trim().min(1, { message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED }),
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

// --- Body Schemas ---
export const EmailVerifyBodySchema = z.object({
  email_verify_token: z.string().trim().min(1, { message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED })
})

export const GoogleLoginBodySchema = z.object({
  id_token: z.string().trim().min(1, { message: USERS_MESSAGES.INVALID_GOOGLE_TOKEN || 'Google ID Token là bắt buộc' })
})

// --- Request Schemas (for middleware) ---
export const RegisterSchema = z.object({ body: RegisterBodySchema })
export const LoginSchema = z.object({ body: LoginBodySchema })
export const GoogleLoginSchema = z.object({ body: GoogleLoginBodySchema })
export const LogoutSchema = z.object({ body: LogoutBodySchema })
export const RefreshTokenSchema = z.object({ body: RefreshTokenBodySchema })
export const ForgotPasswordSchema = z.object({ body: ForgotPasswordBodySchema })
export const VerifyForgotPasswordTokenSchema = z.object({ body: VerifyForgotPasswordTokenBodySchema })
export const ResetPasswordSchema = z.object({ body: ResetPasswordBodySchema })
export const EmailVerifySchema = z.object({ body: EmailVerifyBodySchema })
