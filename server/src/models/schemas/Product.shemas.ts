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
  stockQuantity?: number
  category: CategoryType['_id']
  soldQuantity?: number
  images?: ProductImageType[]
}

export default class Product {
  _id: ObjectId
  name: string
  price: number
  description?: string
  stockQuantity?: number
  category: CategoryType['_id']
  soldQuantity?: number
  images?: ProductImageType[]

  constructor(product: ProductType) {
    this._id = product._id || new ObjectId()
    this.name = product.name
    this.price = product.price
    this.description = product.description || undefined
    this.stockQuantity = product.stockQuantity || 0
    this.category = product.category
    this.soldQuantity = product.soldQuantity || 0
    this.images = product.images || []
  }
}
