import { ObjectId } from 'mongodb'

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
