import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { USERS_MESSAGES } from '~/common/constants/messages'
import { ErrorWithStatus } from '~/common/models/Errors'
import databaseServices from '~/common/services/database.service'
import { AddToCartReqBody } from '~/modules/users/users.schema'

// Gợi ý khung code
class UsersService {
  async addToCart(user_id: string, payload: AddToCartReqBody) {
    const { product_id } = payload
    const quantity = Number(payload.quantity) // Ép khô máu nó về thành Số!
    if (isNaN(quantity) || quantity <= 0) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.INVALID_QUANTITY,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // 1. Tìm Product xem có tồn tại không và check stock
    // const product = await databaseService.products.findOne(...)
    const product = await databaseServices.products.findOne({ _id: new ObjectId(product_id) })
    // if (!product) throw new Error('Product not found');
    if (!product) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.PRODUCT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // if (quantity > product.stockQuantity) throw new Error('Out of stock');
    if (quantity > (product.stock_quantity || 0) || (product.stock_quantity || 0) === 0) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.OUT_OF_STOCK,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    // 2. Lấy User ra để kiểm tra giỏ hàng hiện tại
    // const user = await databaseService.users.findOne(...)
    const user = await databaseServices.users.findOne({
      _id: new ObjectId(user_id)
    })
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // 3. Tìm xem product_id đã nằm trong mảng user.cart chưa?
    // const existingCartItem = user.cart.find(...)
    const existingCartItem = user.cart?.find((item) => item.product_id.toString() === product_id)
    // 4 & 5. Xử lý logic cộng dồn hoặc thêm mới, rồi update vào DB
    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity
      if (newQuantity > (product.stock_quantity || 0)) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.OVER_STOCK_QUANTITY, //quá số lượng tồn kho
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      await databaseServices.users.updateOne(
        {
          _id: new ObjectId(user_id),
          'cart.product_id': new ObjectId(product_id)
        },
        {
          $inc: {
            'cart.$.quantity': quantity
          }
        }
      )
    } else {
      //    ... logic thêm mới ($push)
      await databaseServices.users.updateOne(
        { _id: new ObjectId(user_id) },
        {
          $push: {
            cart: {
              product_id: new ObjectId(product_id),
              quantity: quantity
            }
          }
        }
      )
    }
  }
  async getCart(user_id: string) {
    const result = await databaseServices.users
      .aggregate([
        //bước 1: tìm user
        {
          $match: {
            _id: new ObjectId(user_id)
          }
        },
        //bước 2:
        {
          $unwind: '$cart'
        },
        //bước 3: Sang bảng product để lấy thông tin chi tiết(JOIN)
        {
          $lookup: {
            from: 'products',
            localField: 'cart.product_id',
            foreignField: '_id',
            as: 'product_detail'
          }
        },
        //Bước 4: vì lookup trả về mảng nên ta dùng $unwind để tách ra
        {
          $unwind: {
            path: '$product_detail',
            preserveNullAndEmptyArrays: true // Keep items even if product was deleted
          }
        },
        // Bước 5: Gọt dũa kết quả trả về, handle TH Ghost Product bằng is_available
        {
          $project: {
            _id: 0, // ko trả về _id của user
            product_id: '$cart.product_id',
            quantity: '$cart.quantity',
            price: { $ifNull: ['$product_detail.price', 0] },
            name: { $ifNull: ['$product_detail.name', 'Sản phẩm đã ngừng kinh doanh'] },
            image: { $arrayElemAt: [{ $ifNull: ['$product_detail.images.url', []] }, 0] },
            item_total: { $multiply: ['$cart.quantity', { $ifNull: ['$product_detail.price', 0] }] },
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
        //bước 6: tính tổng tiền của giỏ hàng (Chỉ tính các item is_available)
        {
          $group: {
            _id: null,
            cart: { $push: '$$ROOT' },
            cart_total: {
              $sum: {
                $cond: [{ $eq: ['$is_available', true] }, '$item_total', 0]
              }
            }
          }
        },
        //bước 7: Xoá _id: null
        {
          $project: {
            _id: 0,
            cart: 1,
            cart_total: 1
          }
        }
      ])
      .toArray()
    return result[0] || { cart: [], cart_total: 0 }
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

    await databaseServices.users.updateOne(
      {
        _id: new ObjectId(user_id),
        'cart.product_id': new ObjectId(product_id)
      },
      {
        $set: {
          'cart.$.quantity': quantity
        }
      }
    )

    // Return the updated cart implicitly via a getCart call
    return this.getCart(user_id)
  }

  async removeFromCart(user_id: string, product_id: string) {
    await databaseServices.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $pull: {
          cart: { product_id: new ObjectId(product_id) }
        }
      }
    )
    return this.getCart(user_id)
  }
}

const usersService = new UsersService()
export default usersService
