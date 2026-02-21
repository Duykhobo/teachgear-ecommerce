import { ObjectId } from 'mongodb'
import databaseServices from '~/common/services/database.service'
import Category from '~/models/schemas/Category.schemas'
import { CreateCategoryReqBody } from './category.schema'

class CategoryService {
  async createCategory(payload: CreateCategoryReqBody) {
    const category_id = new ObjectId()
    const newCategory = new Category({
      _id: category_id,
      ...payload
    })
    await databaseServices.categories.insertOne(newCategory)
    return newCategory
  }
}

const categoryService = new CategoryService()
export default categoryService
