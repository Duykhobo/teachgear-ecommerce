import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { USERS_MESSAGES } from '~/common/constants/messages'
import { ErrorWithStatus } from '~/common/models/Errors'
import databaseServices from '~/common/services/database.service'
import { PaginationReqQuery, CreateProductReqBody } from '~/modules/products/products.schema'
import Product from '~/models/schemas/Product.shemas'

class ProductsService {
  async getProduct(product_id: string) {
    const products = await databaseServices.products
      .aggregate([
        {
          $match: {
            _id: new ObjectId(product_id),
            is_active: { $ne: false }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category_detail'
          }
        },
        {
          $unwind: {
            path: '$category_detail',
            preserveNullAndEmptyArrays: true
          }
        }
      ])
      .toArray()
    const product = products[0]
    if (!product) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.PRODUCT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return product
  }

  async getAllProducts(query: PaginationReqQuery) {
    const { page, limit, category_id } = query

    const matchStage: any = {
      is_active: { $ne: false }
    }

    if (category_id) {
      matchStage.category = new ObjectId(category_id)
    }

    const result = await databaseServices.products
      .aggregate([
        {
          $match: matchStage
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category_detail'
          }
        },
        {
          $unwind: {
            path: '$category_detail',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $sort: { created_at: -1 }
        },
        {
          $facet: {
            metadata: [{ $count: 'total_items' }, { $addFields: { page: page, limit: limit } }],
            data: [{ $skip: (page - 1) * limit }, { $limit: limit }]
          }
        }
      ])
      .toArray()

    const products = result[0].data
    const total_items = result[0].metadata[0]?.total_items || 0
    const total_pages = Math.ceil(total_items / limit)

    return {
      products,
      pagination: {
        page,
        limit,
        total_items,
        total_pages
      }
    }
  }

  async createProduct(payload: CreateProductReqBody) {
    const categoryExists = await databaseServices.categories.findOne({ _id: new ObjectId(payload.category_id) })

    if (!categoryExists) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.CATEGORY_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND // HTTP_STATUS.BAD_REQUEST is also good here
      })
    }

    const newProduct = new Product({
      ...payload,
      category: new ObjectId(payload.category_id)
    })

    await databaseServices.products.insertOne(newProduct)
    return newProduct
  }

  async deleteProduct(product_id: string) {
    const result = await databaseServices.products.findOneAndUpdate(
      { _id: new ObjectId(product_id), is_active: { $ne: false } }, // Ensure we don't 'delete' an already deleted item
      { $set: { is_active: false, updated_at: new Date() } },
      { returnDocument: 'after' }
    )
    if (!result) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.PRODUCT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return result
  }
}

const productsService = new ProductsService()
export default productsService
