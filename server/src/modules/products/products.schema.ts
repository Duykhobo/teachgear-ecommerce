import { USERS_MESSAGES } from '~/common/constants/messages'
import { z } from 'zod'

export const CreateProductSchema = z.object({
  name: z.string().min(1, USERS_MESSAGES.PRODUCT_NAME_IS_REQUIRED),
  price: z.number().positive(USERS_MESSAGES.PRICE_MUST_BE_A_POSITIVE_NUMBER),
  stock_quantity: z.number().int().nonnegative(USERS_MESSAGES.STOCK_QUANTITY_MUST_BE_A_NONNEGATIVE_INTEGER),
  category_id: z.string().regex(/^[0-9a-fA-F]{24}$/, USERS_MESSAGES.INVALID_CATEGORY_ID),
  description: z.string().optional(),
  images: z.array(z.object({ url: z.string().url(USERS_MESSAGES.IMAGE_URL_MUST_BE_A_STRING) })).optional()
})

export const PaginationQuerySchema = z.object({
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
  category_id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, USERS_MESSAGES.INVALID_CATEGORY_ID)
    .optional()
})

export type PaginationReqQuery = z.infer<typeof PaginationQuerySchema>
