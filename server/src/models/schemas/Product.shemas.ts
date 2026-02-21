import { ObjectId } from 'mongodb'

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
