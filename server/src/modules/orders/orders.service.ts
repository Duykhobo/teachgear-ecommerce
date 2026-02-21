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

  async cancelOrder(user_id: string, order_id: string) {
    const session = databaseServices.client.startSession()
    try {
      session.startTransaction()

      // 1. Tìm order (phải của current user và trạng thái Pending)
      const order = await databaseServices.orders.findOne(
        { _id: new ObjectId(order_id), user_id: new ObjectId(user_id) },
        { session }
      )

      if (!order) {
        throw new ErrorWithStatus({
          message: 'Order not found',
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      if (order.status !== OrderStatus.Pending) {
        throw new ErrorWithStatus({
          message: 'Only pending orders can be cancelled',
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      // 2. Chuyển trạng thái sang Cancelled
      const result = await databaseServices.orders.findOneAndUpdate(
        { _id: new ObjectId(order_id), status: OrderStatus.Pending }, // Atomic check again
        { $set: { status: OrderStatus.Cancelled, updated_at: new Date() } },
        { session, returnDocument: 'after' }
      )

      if (!result) {
        // Race condition happens here if status changed just now
        throw new ErrorWithStatus({
          message: 'Order status changed, cannot cancel',
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      // 3. Restore Stock (Cộng lại kho + trừ lượt bán)
      for (const item of order.order_items) {
        await databaseServices.products.updateOne(
          { _id: new ObjectId(item.product_id) },
          {
            $inc: {
              stock_quantity: item.quantity,
              sold_quantity: -item.quantity
            }
          },
          { session }
        )
      }

      await session.commitTransaction()
      return result
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  }

  async updateOrderStatus(order_id: string, new_status: OrderStatus) {
    // Note: This does not need a transaction unless you want to log history, but atomic updating is critical
    const result = await databaseServices.orders.findOneAndUpdate(
      {
        _id: new ObjectId(order_id),
        status: { $in: [OrderStatus.Pending, OrderStatus.Processing, OrderStatus.Shipped] } // cannot update if cancelled or already delivered
      },
      {
        $set: {
          status: new_status,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    )

    if (!result) {
      throw new ErrorWithStatus({
        message: 'Order not found or status cannot be changed',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    return result
  }
}

const ordersService = new OrdersService()
export default ordersService
