import { ObjectId } from 'mongodb'
import databaseServices from '~/common/services/database.service'
import Order, { CreateOrderReqBody } from '~/modules/orders/orders.schema'
import { ErrorWithStatus } from '~/common/models/Errors'
import { USERS_MESSAGES } from '~/common/constants/messages'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { OrderStatus } from '~/common/constants/enums'
import cartService from '../cart/cart.service'
import { CartAggregateResult, CartItemAggregate } from '../cart/cart.schema'

import { cacheData } from '~/common/utils/cache'

// State Machine: định nghĩa các transition hợp lệ cho Order Status
// Tách ra module level — không tạo lại mỗi lần gọi updateOrderStatus
export const VALID_ORDER_TRANSITIONS: Readonly<Record<OrderStatus, OrderStatus[]>> = {
  [OrderStatus.Pending]: [OrderStatus.Processing, OrderStatus.Cancelled],
  [OrderStatus.Processing]: [OrderStatus.Shipped],
  [OrderStatus.Shipped]: [OrderStatus.Delivered],
  [OrderStatus.Delivered]: [OrderStatus.Completed],
  [OrderStatus.Cancelled]: [], // terminal state
  [OrderStatus.Completed]: [] // terminal state
}

class OrdersService {
  async createOrder(user_id: string, payload: CreateOrderReqBody) {
    //1. Lấy giỏ hàng của user
    const cartData: CartAggregateResult = await cartService.getCart(user_id)
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
        const result = await databaseServices.products.findOneAndUpdate(
          {
            _id: new ObjectId(item.product_id),
            stock_quantity: { $gte: item.quantity }
          },
          {
            $inc: {
              stock_quantity: -item.quantity,
              sold_quantity: item.quantity
            }
          },
          { session, returnDocument: 'after' }
        )
        if (!result) {
          throw new ErrorWithStatus({
            message: `Product ${item.name} is out of stock`,
            status: HTTP_STATUS.BAD_REQUEST
          })
        }
      }

      // 3. Tạo Đơn hàng mới
      const orderId = new ObjectId()
      const orderData = new Order({
        _id: orderId,
        user_id: new ObjectId(user_id),
        order_items: cartData.cart.map((item: CartItemAggregate) => ({
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

      // 4. Xóa Giỏ hàng — clear items trong carts collection (giữ document, chỉ rỗng items)
      await databaseServices.carts.updateOne({ user_id: new ObjectId(user_id) }, { $set: { items: [] } }, { session })

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
          message: USERS_MESSAGES.ORDER_NOT_FOUND,
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
    // Bước 1: Lấy đơn hàng hiện tại để biết current status
    const order = await databaseServices.orders.findOne({ _id: new ObjectId(order_id) })
    if (!order) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.ORDER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Bước 2: Validate transition theo State Machine
    const allowedNext = VALID_ORDER_TRANSITIONS[order.status as OrderStatus]
    if (!allowedNext.includes(new_status)) {
      throw new ErrorWithStatus({
        message: `Invalid status transition: ${order.status} → ${new_status}. Allowed: [${allowedNext.join(', ') || 'none'}]`,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Bước 3: Atomic update — filter bằng current status để chống race condition
    const result = await databaseServices.orders.findOneAndUpdate(
      {
        _id: new ObjectId(order_id),
        status: order.status // atomic check: đảm bảo không ai đổi giữa bước 1 và bước 3
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
        message: 'Order status was changed by another request. Please retry.',
        status: HTTP_STATUS.CONFLICT
      })
    }

    return result
  }

  async getRevenue(startDate?: string, endDate?: string) {
    interface RevenueMatchStage {
      status: { $in: OrderStatus[] }
      created_at?: { $gte?: Date; $lte?: Date }
    }
    const matchStage: RevenueMatchStage = {
      status: { $in: [OrderStatus.Delivered, OrderStatus.Completed] }
    }

    if (startDate || endDate) {
      matchStage.created_at = {}
      if (startDate) matchStage.created_at.$gte = new Date(startDate)
      if (endDate) matchStage.created_at.$lte = new Date(endDate)
    }

    const result = await databaseServices.orders
      .aggregate([
        {
          $match: matchStage
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$created_at',
                timezone: 'Asia/Ho_Chi_Minh' // Fix múi giờ cho chuẩn báo cáo VN
              }
            },
            total_revenue: { $sum: '$total_amount' },
            orders_count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 } // Xếp tăng dần theo timeline
        }
      ])
      .toArray()

    return result
  }

  async getTopSellingProducts(limit: number = 5) {
    return cacheData(`top-selling:${limit}`, async () => {
      return await databaseServices.orders
        .aggregate([
          {
            $match: {
              status: { $in: [OrderStatus.Delivered, OrderStatus.Completed] }
            }
          },
          {
            $unwind: '$order_items'
          },
          {
            $group: {
              _id: '$order_items.product_id',
              total_quantity_sold: { $sum: '$order_items.quantity' },
              name: { $first: '$order_items.name' },
              image: { $first: '$order_items.image' },
              price: { $first: '$order_items.price' }
            }
          },
          {
            $sort: { total_quantity_sold: -1 }
          },
          {
            $limit: Number(limit)
          }
        ])
        .toArray()
    })
  }

  async getUserOrder(user_id: string) {
    return await databaseServices.orders
      .find({
        user_id: new ObjectId(user_id)
      })
      .sort({ created_at: -1 })
      .toArray()
  }
}

const ordersService = new OrdersService()
export default ordersService
