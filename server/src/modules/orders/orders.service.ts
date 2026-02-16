import { ObjectId } from 'mongodb'
import databaseServices from '~/common/services/database.service'
import { CreateOrderReqBody } from '~/modules/orders/orders.schema'
import { ErrorWithStatus } from '~/common/models/Errors'
import { USERS_MESSAGES } from '~/common/constants/messages'
import HTTP_STATUS from '~/common/constants/httpStatus'
import Order from '~/models/schemas/Order.schemas'
import { OrderStatus } from '~/common/constants/enums'
import usersService from '~/modules/users/users.service'

class OrdersService {
  async createOrder(user_id: string, payload: CreateOrderReqBody) {
    //1. Lấy giỏ hàng của user
    const cartData = await usersService.getCart(user_id)
    //2. Chặn nếu giỏ hàng rỗng
    if (cartData.cart.length === 0) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.CART_IS_EMPTY,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // --- BẮT ĐẦU SETUP TRANSACTION ---
    const session = databaseServices.client.startSession()
    try {
      session.startTransaction()
      for (const item of cartData.cart) {
        const product = await databaseServices.products.findOne({ _id: item.product_id }, { session })
        if (!product) {
          throw new ErrorWithStatus({
            message: `Product ${item.product_id} out of stock`,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        if (item.quantity > (product.stock_quantity || 0)) {
          throw new ErrorWithStatus({
            message: `Product ${item.product_id} over stock quantity`,
            status: HTTP_STATUS.BAD_REQUEST
          })
        }
        await databaseServices.products.updateOne(
          { _id: item.product_id },
          {
            $inc: {
              stock_quantity: -item.quantity,
              sold_quantity: item.quantity
            }
          },
          { session }
        )
      }

      // 3. Tạo Đơn hàng mới
      const orderId = new ObjectId()
      const orderData = new Order({
        _id: orderId,
        user_id: new ObjectId(user_id),
        order_items: cartData.cart.map((item: any) => ({
          product_id: item.product_id,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          price: item.price
        })),
        total_amount: cartData.cart_total,
        status: OrderStatus.Pending,
        payment: {
          payment_method: payload.payment_method,
          payment_status: 'Pending',
          payment_id: ''
        },
        delivery: {
          delivery_method: 'Standard',
          delivery_status: 'Pending',
          address: payload.address,
          phone_number: payload.phone_number,
          receiver_name: payload.receiver_name
        }
      })

      await databaseServices.orders.insertOne(orderData, { session })

      // 4. Xóa Giỏ hàng (Có session)
      await databaseServices.users.updateOne(
        { _id: new ObjectId(user_id) },
        {
          $set: {
            cart: []
          }
        },
        { session }
      )

      await session.commitTransaction()
      return {
        message: USERS_MESSAGES.CREATE_ORDER_SUCCESS,
        data: orderData
      }
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  }
}

const ordersService = new OrdersService()
export default ordersService
