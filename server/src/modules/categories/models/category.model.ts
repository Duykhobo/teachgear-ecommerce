import { ObjectId } from 'mongodb'
import { CategoryType } from '../types/category.type'

export default class Category {
  _id: ObjectId
  name: string
  description: string
  slug: string
  created_at: Date
  updated_at: Date

  constructor(category: CategoryType) {
    this._id = category._id || new ObjectId()
    this.name = category.name
    this.description = category.description || ''
    this.slug = category.slug
    this.created_at = category.created_at || new Date()
    this.updated_at = category.updated_at || new Date()
  }
}
