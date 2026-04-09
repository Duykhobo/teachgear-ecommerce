import { ObjectId } from 'mongodb'
import databaseServices from '~/common/services/database.service'
import Category, { CreateCategoryReqBody, UpdateCategoryReqBody } from './category.schema'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { ErrorWithStatus } from '~/common/models/Errors'
import { USERS_MESSAGES } from '~/common/constants/messages'

class CategoryService {
  async createCategory(payload: CreateCategoryReqBody) {
    const isSlugExist = await databaseServices.categories.findOne({ slug: payload.slug })
    if (isSlugExist) {
      throw new ErrorWithStatus({
        message: 'Category slug already exists',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    const category_id = new ObjectId()
    const newCategory = new Category({
      _id: category_id,
      ...payload
    })
    await databaseServices.categories.insertOne(newCategory)
    return newCategory
  }

  async getAllCategories() {
    return await databaseServices.categories.find({}).sort({ created_at: -1 }).toArray()
  }

  async updateCategory(id: string, payload: UpdateCategoryReqBody) {
    const objectId = new ObjectId(id)
    const result = await databaseServices.categories.findOneAndUpdate(
      { _id: objectId },
      {
        $set: {
          ...payload,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    )

    if (!result) {
      throw new ErrorWithStatus({
        message: 'Category not found',
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return result
  }

  async deleteCategory(id: string) {
    const objectId = new ObjectId(id)

    // Check if category is used in any products
    const productUsingCategory = await databaseServices.products.findOne({ category: objectId })
    if (productUsingCategory) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.CATEGORY_IS_USED_BY_PRODUCT,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const result = await databaseServices.categories.findOneAndDelete({ _id: objectId })

    if (!result) {
      throw new ErrorWithStatus({
        message: 'Category not found',
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return result
  }
}

const categoryService = new CategoryService()
export default categoryService
