import { z } from 'zod'
import { USERS_MESSAGES } from '~/common/constants/messages'
import { OrderStatus } from '~/common/constants/enums'

// --- Body Schemas ---
const CreateOrderBodySchema = z.object({
  address: z
    .string({
      error: (issue) => {
        if (issue.code === 'invalid_type' && issue.input === undefined) {
          return { message: USERS_MESSAGES.ADDRESS_IS_REQUIRED }
        }
        return { message: USERS_MESSAGES.ADDRESS_MUST_BE_STRING }
      }
    })
    .min(5, {
      message: USERS_MESSAGES.ADDRESS_LENGTH_MUST_BE_AT_LEAST_5_CHARACTERS
    }),
  phone_number: z
    .string({
      error: (issue) => {
        if (issue.code === 'invalid_type' && issue.input === undefined) {
          return { message: USERS_MESSAGES.PHONE_NUMBER_IS_REQUIRED }
        }
        return { message: USERS_MESSAGES.PHONE_NUMBER_MUST_BE_STRING }
      }
    })
    .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, {
      message: USERS_MESSAGES.PHONE_NUMBER_IS_INVALID
    }),
  receiver_name: z.string({
    error: (issue) => {
      if (issue.code === 'invalid_type' && issue.input === undefined) {
        return { message: USERS_MESSAGES.RECEIVER_NAME_IS_REQUIRED }
      }
      return { message: USERS_MESSAGES.RECEIVER_NAME_MUST_BE_STRING }
    }
  }),
  payment_method: z.string({
    error: (issue) => {
      if (issue.code === 'invalid_type' && issue.input === undefined) {
        return { message: USERS_MESSAGES.PAYMENT_METHOD_IS_REQUIRED }
      }
      return { message: USERS_MESSAGES.PAYMENT_METHOD_MUST_BE_STRING }
    }
  })
})

export const CreateOrderSchema = z.object({
  body: CreateOrderBodySchema
})

export type CreateOrderReqBody = z.infer<typeof CreateOrderBodySchema>

export const UpdateOrderStatusBodySchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    message: USERS_MESSAGES.INVALID_ORDER_STATUS
  })
})

export const UpdateOrderStatusSchema = z.object({
  body: UpdateOrderStatusBodySchema
})

export type UpdateOrderStatusReqBody = z.infer<typeof UpdateOrderStatusBodySchema>

export const GetOrdersAdminQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().min(1)),
  status: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.nativeEnum(OrderStatus).optional()),
  search: z.string().optional()
})

export type GetOrdersAdminReqQuery = z.infer<typeof GetOrdersAdminQuerySchema>

export const GetOrdersAdminSchema = z.object({
  query: GetOrdersAdminQuerySchema
})
