import { z } from 'zod'
import { USERS_MESSAGES } from '~/constants/messages'

// 1. Định nghĩa riêng cái "ruột" (body)
export const RegisterBodySchema = z
  .object({
    name: z.string().trim().min(1, { message: USERS_MESSAGES.NAME_IS_REQUIRED }),
    email: z.string().email({ message: USERS_MESSAGES.INVALID_EMAIL }), // Lưu ý: dùng .string().email()
    password: z
      .string()
      .min(8, { message: USERS_MESSAGES.PASSWORD_MUST_BE_AT_LEAST_8_CHARACTERS })
      .max(50, { message: USERS_MESSAGES.PASSWORD_MUST_BE_LESS_THAN_50_CHARACTERS }),
    confirm_password: z.string().min(8),
    date_of_birth: z.string({ message: USERS_MESSAGES.INVALID_DATE_OF_BIRTH })
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

// 2. Định nghĩa Schema tổng cho middleware validate
export const RegisterSchema = z.object({
  body: RegisterBodySchema
})

// 3. Bây giờ nhét type thoải mái, không bao giờ lỗi
export type RegisterInput = z.infer<typeof RegisterBodySchema>
