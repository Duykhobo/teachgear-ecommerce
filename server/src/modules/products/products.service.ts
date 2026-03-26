import { Filter, ObjectId } from 'mongodb'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { USERS_MESSAGES } from '~/common/constants/messages'
import { ErrorWithStatus } from '~/common/models/Errors'
import databaseServices from '~/common/services/database.service'
import Product, {
  PaginationReqQuery,
  CreateProductReqBody,
  UpdateProductReqBody,
  ProductUpdateDBPayload
} from '~/modules/products/products.schema'
import { redisConnection } from '~/common/configs/redis.config'
import logger from '~/common/utils/logger'

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
    const { page, limit, category_id, name, sort_by, order } = query

    const matchStage: Filter<Product> = {
      is_active: { $ne: false }
    }

    if (category_id) {
      matchStage.category = new ObjectId(category_id)
    }

    if (name) {
      matchStage.name = { $regex: name, $options: 'i' }
    }

    const sortStage: Record<string, 1 | -1> = sort_by
      ? { [sort_by]: order === 'asc' ? 1 : -1 }
      : { created_at: -1 }

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
          $sort: sortStage
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

  async updateProduct(product_id: string, payload: UpdateProductReqBody) {
    const objectId = new ObjectId(product_id)

    // If category_id is being updated, verify it exists
    if (payload.category_id) {
      const categoryExists = await databaseServices.categories.findOne({ _id: new ObjectId(payload.category_id) })
      if (!categoryExists) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.CATEGORY_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
    }

    // Prepare update payload
    const { category_id, ...rest } = payload
    const updatePayload: ProductUpdateDBPayload = { ...rest }
    if (category_id) {
      updatePayload.category = new ObjectId(category_id)
    }

    const result = await databaseServices.products.findOneAndUpdate(
      { _id: objectId, is_active: { $ne: false } },
      {
        $set: {
          ...updatePayload,
          updated_at: new Date()
        }
      },
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

  async getTopSellingProducts(limit: number = 10) {
    const cacheKey = `top_selling_products_${limit}`

    // 1. Thử lấy từ Redis
    try {
      const cachedData = await redisConnection.get(cacheKey)
      if (cachedData) {
        logger.info('Cache HIT: Top Selling Products retrieved from Redis', { cacheKey })
        return JSON.parse(cachedData)
      }
    } catch (error: any) {
      logger.warn('Redis error during cache GET, falling back to MongoDB', { error: error.message })
    }

    // 2. Cache MISS hoặc Redis sập -> Query MongoDB
    logger.info('Cache MISS: Fetching Top Selling Products from MongoDB')
    const products = await databaseServices.products
      .aggregate([
        {
          $match: { is_active: { $ne: false } }
        },
        {
          $sort: { sold_quantity: -1 }
        },
        {
          $limit: limit
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

    // 3. Lưu vào Redis cho lần sau (TTL 5 phút = 300s)
    try {
      if (products.length > 0) {
        await redisConnection.setex(cacheKey, 300, JSON.stringify(products))
        logger.info('Cache UPDATED: Top Selling Products stored in Redis', { cacheKey, ttl: 300 })
      }
    } catch (error: any) {
      logger.warn('Redis error during cache SET', { error: error.message })
    }

    return products
  }
}

const productsService = new ProductsService()
export default productsService
