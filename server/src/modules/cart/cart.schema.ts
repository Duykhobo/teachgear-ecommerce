import { ObjectId } from 'mongodb'
import z from 'zod'

// --- Body Schemas ---
export const AddToCartBodySchema = z.object({
  product_id: z.string().trim().min(1),
  quantity: z.number().int().positive()
})

// --- Request Schemas (for middleware) ---
export const UpdateCartReqBodySchema = z.object({
  quantity: z.number().int().positive()
})

export const AddToCartSchema = z.object({ body: AddToCartBodySchema })

// --- Types ---
export type AddToCartReqBody = z.infer<typeof AddToCartBodySchema>
export type UpdateCartReqBody = z.infer<typeof UpdateCartReqBodySchema>

export interface CartItemType {
  product_id: ObjectId
  quantity: number
}

interface CartType {
  _id?: ObjectId
  user_id: ObjectId
  items: CartItemType[]
  updated_at?: Date
}

// Enriched cart item — kết quả của getCart() aggregate pipeline (sau $lookup + $project)
// Dùng thay cho `(item: any)` trong orders.service.ts khi map cart → order_items
export interface CartItemAggregate {
  product_id: ObjectId
  quantity: number
  price: number
  name: string
  image: string
  item_total: number
  is_available: boolean
}

// Toàn bộ giá trị trả về của getCart()
export interface CartAggregateResult {
  cart: CartItemAggregate[]
  cart_total: number
}

export default class Cart {
  _id: ObjectId
  user_id: ObjectId
  items: CartItemType[]
  updated_at: Date

  constructor(cart: CartType) {
    this._id = cart._id || new ObjectId()
    this.user_id = cart.user_id
    this.items = cart.items || []
    this.updated_at = cart.updated_at || new Date()
  }
}
