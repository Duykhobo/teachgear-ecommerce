// src/models/schemas/auth.schemas.ts
import { z } from 'zod'
import { USERS_MESSAGES } from '~/constants/messages'

// Định nghĩa các trường dùng chung để không phải viết lại nhiều lần
const passwordSchema = z
  .string()
  .min(8, { message: USERS_MESSAGES.PASSWORD_MUST_BE_AT_LEAST_8_CHARACTERS })
  .max(50, { message: USERS_MESSAGES.PASSWORD_MUST_BE_LESS_THAN_50_CHARACTERS })
const emailSchema = z.string().email({ message: USERS_MESSAGES.INVALID_EMAIL })

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

// --- SCHEMAS CHO MIDDLEWARE ---

export const RegisterSchema = z.object({
  body: RegisterBodySchema
})

export const LoginSchema = z.object({
  body: LoginBodySchema
})

// Types để dùng trong Controller
export type RegisterInput = z.infer<typeof RegisterBodySchema>
export type LoginInput = z.infer<typeof LoginBodySchema>

export const LogoutBodySchema = z.object({
  refresh_token: z.string().trim().min(1)
})

export const LogoutSchema = z.object({
  body: LogoutBodySchema
})

export type LogoutInput = z.infer<typeof LogoutBodySchema>
