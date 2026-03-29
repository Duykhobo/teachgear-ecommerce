import { ObjectId } from 'mongodb'
import { ProductType } from '../types/product.types'

export default class Product {
  _id: ObjectId
  name: string
  price: number
  description?: string
  stock_quantity?: number
  category: ObjectId
  sold_quantity?: number
  images?: { url: string }[]
  is_active: boolean

  constructor(product: ProductType) {
    this._id = product._id || new ObjectId()
    this.name = product.name
    this.price = product.price
    this.description = product.description || undefined
    this.stock_quantity = product.stock_quantity || 0
    this.category = product.category as ObjectId
    this.sold_quantity = product.sold_quantity || 0
    this.images = product.images || []
    this.is_active = product.is_active !== undefined ? product.is_active : true
  }
}
