import { ObjectId } from 'mongodb'
import { z } from 'zod'
import {
  CreateProductSchema,
  UpdateProductBodySchema,
  ProductParamsSchema,
  PaginationQuerySchema
} from '../schemas/product.validation'

export type CreateProductReqBody = z.infer<typeof CreateProductSchema>['body']
export type UpdateProductReqBody = z.infer<typeof UpdateProductBodySchema>['body']
export type ProductReqParams = z.infer<typeof ProductParamsSchema>['params']
export type PaginationReqQuery = z.infer<typeof PaginationQuerySchema>

// Internal DB update payload: category_id (string) → category (ObjectId), dùng thay cho `any` trong service
export type ProductUpdateDBPayload = Omit<UpdateProductReqBody, 'category_id'> & {
  category?: ObjectId
  updated_at?: Date
}

export interface CategoryType {
  _id?: ObjectId
  name: string
  description?: string
}

export interface ProductImageType {
  url: string
}

export interface ProductType {
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

export interface ProductWithCategory extends ProductType {
  category_detail?: CategoryType
}
