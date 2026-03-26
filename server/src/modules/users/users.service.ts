import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { USERS_MESSAGES } from '~/common/constants/messages'
import { ErrorWithStatus } from '~/common/models/Errors'
import databaseServices from '~/common/services/database.service'
import { AddToCartReqBody, UpdateMeReqBody, CartAggregateResult } from '~/modules/users/users.schema'

// Gợi ý khung code
class UsersService {
  async addToCart(user_id: string, payload: AddToCartReqBody) {
    const { product_id } = payload
    const quantity = Number(payload.quantity)
    if (isNaN(quantity) || quantity <= 0) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.INVALID_QUANTITY,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // 1. Validate product tồn tại và còn hàng
    const product = await databaseServices.products.findOne({
      _id: new ObjectId(product_id),
      is_active: { $ne: false }
    })
    if (!product) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.PRODUCT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    if (quantity > (product.stock_quantity || 0) || (product.stock_quantity || 0) === 0) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.OUT_OF_STOCK,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // 2. Lấy cart của user từ cả carts collection
    const cart = await databaseServices.carts.findOne({ user_id: new ObjectId(user_id) })
    const existingItem = cart?.items.find((item) => item.product_id.toString() === product_id)

    if (existingItem) {
      // Cộng dồn số lượng
      const newQuantity = existingItem.quantity + quantity
      if (newQuantity > (product.stock_quantity || 0)) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.OVER_STOCK_QUANTITY,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      await databaseServices.carts.updateOne(
        { user_id: new ObjectId(user_id), 'items.product_id': new ObjectId(product_id) },
        { $inc: { 'items.$.quantity': quantity } }
      )
    } else {
      // Thêm item mới — upsert để tạo cart document nếu chưa tồn tại
      await databaseServices.carts.updateOne(
        { user_id: new ObjectId(user_id) },
        {
          $push: { items: { product_id: new ObjectId(product_id), quantity } },
          $setOnInsert: {
            _id: new ObjectId(),
            user_id: new ObjectId(user_id),
            updated_at: new Date()
          }
        },
        { upsert: true }
      )
    }
  }
  async getCart(user_id: string): Promise<CartAggregateResult> {
    const result = await databaseServices.carts
      .aggregate([
        // Bước 1: Tìm cart của user trong carts collection
        { $match: { user_id: new ObjectId(user_id) } },
        // Bước 2: Tach mảng items ra từng document
        { $unwind: { path: '$items', preserveNullAndEmptyArrays: false } },
        // Bước 3: JOIN sang products để lấy thông tin sản phẩm
        {
          $lookup: {
            from: 'products',
            localField: 'items.product_id',
            foreignField: '_id',
            as: 'product_detail'
          }
        },
        // Bước 4: Unwind kết quả lookup
        {
          $unwind: {
            path: '$product_detail',
            preserveNullAndEmptyArrays: true
          }
        },
        // Bước 5: Project + handle ghost product
        {
          $project: {
            _id: 0,
            product_id: '$items.product_id',
            quantity: '$items.quantity',
            price: { $ifNull: ['$product_detail.price', 0] },
            name: { $ifNull: ['$product_detail.name', 'Product has been discontinued'] },
            image: { $arrayElemAt: [{ $ifNull: ['$product_detail.images.url', []] }, 0] },
            item_total: { $multiply: ['$items.quantity', { $ifNull: ['$product_detail.price', 0] }] },
            is_available: {
              $cond: {
                if: {
                  $and: [
                    { $ne: [{ $type: '$product_detail' }, 'missing'] },
                    { $ne: ['$product_detail', null] },
                    { $eq: ['$product_detail.is_active', true] }
                  ]
                },
                then: true,
                else: false
              }
            }
          }
        },
        // Bước 6: Tính tổng tiền (chỉ các item is_available)
        {
          $group: {
            _id: null,
            cart: { $push: '$$ROOT' },
            cart_total: {
              $sum: { $cond: [{ $eq: ['$is_available', true] }, '$item_total', 0] }
            }
          }
        },
        { $project: { _id: 0, cart: 1, cart_total: 1 } }
      ])
      .toArray()
    return (result[0] as CartAggregateResult) || { cart: [], cart_total: 0 }
  }

  async updateCartItem(user_id: string, product_id: string, quantity: number) {
    const product = await databaseServices.products.findOne({
      _id: new ObjectId(product_id),
      is_active: { $ne: false }
    })
    if (!product) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.PRODUCT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    if (quantity > (product.stock_quantity || 0)) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.OVER_STOCK_QUANTITY,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    await databaseServices.carts.updateOne(
      { user_id: new ObjectId(user_id), 'items.product_id': new ObjectId(product_id) },
      { $set: { 'items.$.quantity': quantity } }
    )
    return this.getCart(user_id)
  }

  async removeFromCart(user_id: string, product_id: string) {
    await databaseServices.carts.updateOne(
      { user_id: new ObjectId(user_id) },
      { $pull: { items: { product_id: new ObjectId(product_id) } } }
    )
    return this.getCart(user_id)
  }
  async findUserById(user_id: string) {
    const user = await databaseServices.users.findOne({
      _id: new ObjectId(user_id)
    })
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return user
  }

  // 5. Get current user profile (strip sensitive fields)
  async getMe(user_id: string) {
    const user = await databaseServices.users.findOne(
      { _id: new ObjectId(user_id) },
      { projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } }
    )
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return user
  }

  // 6. Update current user profile
  async updateMe(user_id: string, payload: UpdateMeReqBody) {
    const { date_of_birth, ...rest } = payload
    const updatedUser = await databaseServices.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          ...rest,
          ...(date_of_birth ? { date_of_birth: new Date(date_of_birth) } : {}),
          updated_at: new Date()
        }
      },
      {
        returnDocument: 'after',
        projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 }
      }
    )
    if (!updatedUser) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return updatedUser
  }
}

const usersService = new UsersService()
export default usersService
