import { ObjectId } from 'mongodb'

export interface CategoryType {
  _id?: ObjectId
  name: string
  description?: string
  slug: string
  created_at?: Date
  updated_at?: Date
}
