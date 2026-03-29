import { ObjectId } from 'mongodb'
import { CartType, CartItemType } from '../types/cart.type'

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
