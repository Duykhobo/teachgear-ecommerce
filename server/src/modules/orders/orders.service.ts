import { ObjectId, Filter } from 'mongodb'
import databaseServices from '~/common/services/database.service'
import Order from './models/orders.model'
import { CreateOrderReqBody, GetOrdersAdminReqQuery } from './schemas/orders.schema'
import { ErrorWithStatus } from '~/common/models/Errors'
import { USERS_MESSAGES } from '~/common/constants/messages'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { OrderStatus, DeliveryMethod, DeliveryStatus, PaymentMethod, PaymentStatus } from '~/common/constants/enums'
import cartService from '../cart/cart.service'
import { CartAggregateResult, CartItemAggregate } from '../cart/types/cart.type'

import { cacheData } from '~/common/utils/cache'
import { stripe } from '~/common/configs/stripe.config'
import { envConfig } from '~/common/configs/configs'
import { enqueueEmailJob } from '~/common/queues/email.queue'
import logger from '~/common/utils/logger'

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
    const orderId = new ObjectId()
    let orderData: Order | null = null

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
              stock_quantity: -item.quantity
              // Không tăng sold ở đây, đợi Webhook báo Paid mới tăng
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
      orderData = new Order({
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
          payment_method: payload.payment_method as any as PaymentMethod,
          payment_status: PaymentStatus.Pending,
          payment_id: ''
        },
        delivery: {
          delivery_method: DeliveryMethod.Standard,
          delivery_status: DeliveryStatus.Pending,
          address: payload.address,
          phone_number: payload.phone_number,
          receiver_name: payload.receiver_name
        }
      })

      await databaseServices.orders.insertOne(orderData, { session })

      // 4. Xóa Giỏ hàng — clear items trong carts collection (giữ document, chỉ rỗng items)
      await databaseServices.carts.updateOne({ user_id: new ObjectId(user_id) }, { $set: { items: [] } }, { session })

      await session.commitTransaction()
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }

    // Tạo Stripe Checkout Session NGOÀI transaction — để lỗi Stripe hiện rõ
    let checkout_url: string | null = null
    if (payload.payment_method === PaymentMethod.Stripe) {
      try {
        const line_items = cartData.cart.map((item: CartItemAggregate) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              images: item.image ? [item.image] : []
            },
            unit_amount: Math.round(item.price * 100) // Stripe expects cents
          },
          quantity: item.quantity
        }))

        const stripeSession = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          success_url: envConfig.STRIPE_SUCCESS_URL,
          cancel_url: envConfig.STRIPE_CANCEL_URL,
          client_reference_id: user_id.toString(),
          metadata: {
            order_id: orderId.toString()
          },
          line_items
        })

        checkout_url = stripeSession.url
      } catch (stripeError: unknown) {
        const msg = stripeError instanceof Error ? stripeError.message : String(stripeError)
        logger.error(`[STRIPE CHECKOUT ERROR] Order ${orderId}: ${msg}`)
      }
    }

    return {
      message: USERS_MESSAGES.CREATE_ORDER_SUCCESS,
      data: {
        ...orderData,
        ...(checkout_url && { checkout_url })
      }
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

      // 3. Restore Stock (Luôn cộng lại kho khi hủy)
      for (const item of order.order_items) {
        await databaseServices.products.updateOne(
          { _id: new ObjectId(item.product_id) },
          {
            $inc: {
              stock_quantity: item.quantity
              // sold_quantity: sẽ được trừ ở bước Refund bên dưới nếu đơn đã trả tiền
            }
          },
          { session }
        )
      }

      await session.commitTransaction()

      // 4. Stripe Refund & Restore Sold quantity
      if (
        order.payment.payment_method === PaymentMethod.Stripe &&
        order.payment.payment_status === PaymentStatus.Paid &&
        order.payment.payment_id
      ) {
        try {
          await stripe.refunds.create({
            payment_intent: order.payment.payment_id,
            reason: 'requested_by_customer'
          })
          logger.info(`[STRIPE REFUND] Refunded payment_intent ${order.payment.payment_id} for order ${order_id}`)

          // Nếu đơn đã Paid -> Trừ lại số lượng đã bán (sold) vì thực tế là trả hàng
          for (const item of order.order_items) {
            await databaseServices.products.updateOne(
              { _id: new ObjectId(item.product_id) },
              { $inc: { sold_quantity: -item.quantity } }
            )
          }

          // Cập nhật payment_status thành Refunded
          await databaseServices.orders.updateOne(
            { _id: new ObjectId(order_id) },
            { $set: { 'payment.payment_status': PaymentStatus.Refunded, updated_at: new Date() } }
          )
        } catch (refundError: unknown) {
          const msg = refundError instanceof Error ? refundError.message : String(refundError)
          logger.error(`[STRIPE REFUND ERROR] Order ${order_id}: ${msg}`)
        }
      }

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

  async getTopSellingProducts(limit = 5) {
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

  async getOrder(user_id: string, order_id: string, isAdmin = false) {
    const query: Filter<Order> = { _id: new ObjectId(order_id) }
    if (!isAdmin) {
      query.user_id = new ObjectId(user_id)
    }

    const order = await databaseServices.orders.findOne(query)
    if (!order) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.ORDER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return order
  }

  async getAllOrdersAdmin(query: GetOrdersAdminReqQuery) {
    const { page, limit, status, search } = query
    const filter: Filter<Order> = {}

    if (status !== undefined) {
      filter.status = status
    }

    if (search) {
      const searchFilter: Filter<Order>[] = [
        { 'delivery.receiver_name': { $regex: search, $options: 'i' } },
        { 'delivery.phone_number': { $regex: search, $options: 'i' } }
      ]
      if (ObjectId.isValid(search)) {
        searchFilter.push({ _id: new ObjectId(search) })
      }
      filter.$or = searchFilter
    }

    const [orders, total_count] = await Promise.all([
      databaseServices.orders
        .find(filter)
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      databaseServices.orders.countDocuments(filter)
    ])

    return {
      orders,
      pagination: {
        page,
        limit,
        total_count,
        total_pages: Math.ceil(total_count / limit)
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handleStripeWebhook(event: any) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const orderId = session.metadata.order_id

      if (orderId) {
        const order = await databaseServices.orders.findOne({ _id: new ObjectId(orderId) })

        if (order) {
          // Idempotency check: Skip if already paid
          if (order.payment.payment_status === PaymentStatus.Paid) {
            logger.info(`[STRIPE WEBHOOK] Order ${orderId} already processed (idempotency).`)
            return { received: true }
          }

          await databaseServices.orders.updateOne(
            { _id: new ObjectId(orderId) },
            {
              $set: {
                'payment.payment_status': PaymentStatus.Paid,
                'payment.payment_id': session.payment_intent as string,
                status: OrderStatus.Processing,
                updated_at: new Date()
              }
            }
          )

          // --- CẬP NHẬT SOLD_QUANTITY ---
          // Duyệt qua item trong đơn hàng để tăng số lượng đã bán
          for (const item of order.order_items) {
            await databaseServices.products.updateOne(
              { _id: new ObjectId(item.product_id) },
              { $inc: { sold_quantity: item.quantity } }
            )
            logger.info(`[INVENTORY] Incremented sold_quantity for product ${item.product_id} by ${item.quantity}`)
          }

          logger.info(`[STRIPE WEBHOOK] Order ${orderId} has been successfully paid!`)

          const user = await databaseServices.users.findOne({ _id: order.user_id })
          if (user && user.email) {
            await enqueueEmailJob({
              type: 'order-confirmation',
              to: user.email,
              orderId: orderId,
              totalAmount: order.total_amount,
              currency: session.currency || 'usd'
            })
            logger.info(`[QUEUE] Pushed task to send order confirmation email to user ${user.email}`)
          }
        }
      }
    }

    // Xử lý khi Stripe session hết hạn hoặc thanh toán thất bại
    if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object
      const orderId = session.metadata?.order_id

      if (orderId) {
        const order = await databaseServices.orders.findOne({ _id: new ObjectId(orderId) })
        if (order && order.status === OrderStatus.Pending) {
          await databaseServices.orders.updateOne(
            { _id: new ObjectId(orderId) },
            {
              $set: {
                status: OrderStatus.Cancelled,
                'payment.payment_status': PaymentStatus.Failed,
                updated_at: new Date()
              }
            }
          )

          // Restore stock
          for (const item of order.order_items) {
            await databaseServices.products.updateOne(
              { _id: new ObjectId(item.product_id) },
              { $inc: { stock_quantity: item.quantity } }
            )
          }

          logger.warn(`[STRIPE WEBHOOK] Order ${orderId} cancelled/expired. Stock restored. Event: ${event.type}`)
        }
      }
    }

    return { received: true }
  }
}

const ordersService = new OrdersService()
export default ordersService
