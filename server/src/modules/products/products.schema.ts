import { USERS_MESSAGES } from '~/common/constants/messages'
import { z } from 'zod'
import { ObjectId } from 'mongodb'

export const CreateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, USERS_MESSAGES.PRODUCT_NAME_IS_REQUIRED),
    price: z.number().positive(USERS_MESSAGES.PRICE_MUST_BE_A_POSITIVE_NUMBER),
    stock_quantity: z.number().int().nonnegative(USERS_MESSAGES.STOCK_QUANTITY_MUST_BE_A_NONNEGATIVE_INTEGER),
    category_id: z.string().regex(/^[0-9a-fA-F]{24}$/, USERS_MESSAGES.INVALID_CATEGORY_ID),
    description: z.string().optional(),
    images: z.array(z.object({ url: z.string().url(USERS_MESSAGES.IMAGE_URL_MUST_BE_A_STRING) })).optional()
  })
})

export const UpdateProductBodySchema = z.object({
  body: z.object({
    name: z.string().min(1, USERS_MESSAGES.PRODUCT_NAME_IS_REQUIRED).optional(),
    price: z.number().positive(USERS_MESSAGES.PRICE_MUST_BE_A_POSITIVE_NUMBER).optional(),
    stock_quantity: z
      .number()
      .int()
      .nonnegative(USERS_MESSAGES.STOCK_QUANTITY_MUST_BE_A_NONNEGATIVE_INTEGER)
      .optional(),
    category_id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, USERS_MESSAGES.INVALID_CATEGORY_ID)
      .optional(),
    description: z.string().optional(),
    images: z.array(z.object({ url: z.string().url(USERS_MESSAGES.IMAGE_URL_MUST_BE_A_STRING) })).optional()
  })
})

export const ProductParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, USERS_MESSAGES.INVALID_PRODUCT_ID)
  })
})

export type CreateProductReqBody = z.infer<typeof CreateProductSchema>['body']
export type UpdateProductReqBody = z.infer<typeof UpdateProductBodySchema>['body']
export type ProductReqParams = z.infer<typeof ProductParamsSchema>['params']

// Internal DB update payload: category_id (string) → category (ObjectId), dùng thay cho `any` trong service
export type ProductUpdateDBPayload = Omit<UpdateProductReqBody, 'category_id'> & {
  category?: ObjectId
  updated_at?: Date
}

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
    .optional(),
  name: z.string().optional(),
  sort_by: z.enum(['created_at', 'price']).optional(),
  order: z.enum(['asc', 'desc']).optional()
})

export type PaginationReqQuery = z.infer<typeof PaginationQuerySchema>

interface CategoryType {
  _id?: ObjectId
  name: string
  description?: string
}

interface ProductImageType {
  url: string
}

interface ProductType {
  _id?: ObjectId
  name: string
  price: number
  description?: string
  stock_quantity?: number
  category: CategoryType['_id']
  sold_quantity?: number
  images?: ProductImageType[]
  is_active?: boolean
}

export default class Product {
  _id: ObjectId
  name: string
  price: number
  description?: string
  stock_quantity?: number
  category: CategoryType['_id']
  sold_quantity?: number
  images?: ProductImageType[]
  is_active: boolean

  constructor(product: ProductType) {
    this._id = product._id || new ObjectId()
    this.name = product.name
    this.price = product.price
    this.description = product.description || undefined
    this.stock_quantity = product.stock_quantity || 0
    this.category = product.category
    this.sold_quantity = product.sold_quantity || 0
    this.images = product.images || []
    this.is_active = product.is_active !== undefined ? product.is_active : true
    this.is_active = product.is_active || true
  }
}
