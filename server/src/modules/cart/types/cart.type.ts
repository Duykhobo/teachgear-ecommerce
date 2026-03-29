import { ObjectId } from 'mongodb'

export interface CartItemType {
  product_id: ObjectId
  quantity: number
}

export interface CartType {
  _id?: ObjectId
  user_id: ObjectId
  items: CartItemType[]
  updated_at?: Date
}

// Enriched cart item — kết quả của getCart() aggregate pipeline (sau $lookup + $project)
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
