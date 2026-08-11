import { SePayPgClient } from 'sepay-pg-node'
import { ObjectId } from 'mongodb'
import { envConfig } from '~/common/configs/configs'
import databaseServices from '~/common/services/database.service'
import { OrderStatus, PaymentStatus } from '~/common/constants/enums'
import logger from '~/common/utils/logger'
import { enqueueEmailJob } from '~/common/queues/email.queue'

export interface SePayIPNPayload {
  timestamp: number
  notification_type: string
  order: {
    id: string
    order_id: string
    order_status: string
    order_currency: string
    order_amount: string
    order_invoice_number: string
    order_description: string
  }
  transaction?: {
    id: string
    payment_method: string
    transaction_id: string
    transaction_status: string
    transaction_amount: string
  }
}

class SePayService {
  /**
   * Khởi tạo Form Fields để Submit sang SePay Checkout (dùng official SDK)
   */
  public initCheckoutForm({
    order_id,
    invoice_number,
    amount,
    description
  }: {
    order_id: string
    invoice_number: string
    amount: number
    description: string
  }) {
    const env = (envConfig.SEPAY_ENV === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production'
    const merchant_id = envConfig.SEPAY_MERCHANT_ID || 'DEMO_MERCHANT'
    const secret_key = envConfig.SEPAY_SECRET_KEY || 'DEMO_SECRET'
    const baseUrl = envConfig.CLIENT_URL || 'http://localhost:3000'

    const client = new SePayPgClient({
      env,
      merchant_id,
      secret_key
    })

    const checkout_url = client.checkout.initCheckoutUrl()
    const checkout_fields = client.checkout.initOneTimePaymentFields({
      operation: 'PURCHASE',
      payment_method: 'BANK_TRANSFER',
      order_invoice_number: invoice_number || `INV-${order_id}`,
      order_amount: Math.round(amount),
      currency: 'VND',
      order_description: description || `Thanh toan don hang ${order_id}`,
      success_url: `${baseUrl}/order/${order_id}?payment=success`,
      error_url: `${baseUrl}/order/${order_id}?payment=error`,
      cancel_url: `${baseUrl}/order/${order_id}?payment=cancel`
    })

    return {
      checkout_url,
      fields: checkout_fields
    }
  }

  /**
   * Xử lý Webhook / IPN từ SePay khi có thanh toán chuyển khoản thành công
   */
  public async handleIPN(payload: SePayIPNPayload) {
    logger.info(`[SEPAY IPN] Received notification: ${JSON.stringify(payload)}`)

    if (payload.notification_type === 'ORDER_PAID' && payload.order) {
      const invoiceNumber = payload.order.order_invoice_number

      // 1. Tìm đơn hàng theo invoice_number hoặc id
      let order = await databaseServices.orders.findOne({
        'delivery.phone_number': invoiceNumber // hoặc kiểm tra trong database theo _id
      })

      if (!order && ObjectId.isValid(invoiceNumber.replace('INV-', ''))) {
        const orderId = invoiceNumber.replace('INV-', '')
        order = await databaseServices.orders.findOne({ _id: new ObjectId(orderId) })
      }

      if (order) {
        // Idempotency check: Skip if already paid
        if (order.payment.payment_status === PaymentStatus.Paid) {
          logger.info(`[SEPAY IPN] Order ${order._id} already marked as Paid. Skipping.`)
          return { success: true }
        }

        // 2. Cập nhật trạng thái đơn hàng -> Paid & Processing
        await databaseServices.orders.updateOne(
          { _id: order._id },
          {
            $set: {
              'payment.payment_status': PaymentStatus.Paid,
              'payment.payment_id': payload.transaction?.transaction_id || payload.order.id,
              status: OrderStatus.Processing,
              updated_at: new Date()
            }
          }
        )

        // 3. Tăng sold_quantity sản phẩm
        for (const item of order.order_items) {
          await databaseServices.products.updateOne(
            { _id: new ObjectId(item.product_id) },
            { $inc: { sold_quantity: item.quantity } }
          )
        }

        logger.info(`[SEPAY IPN] Order ${order._id} marked as Paid via SePay QR Code.`)

        // 4. Gửi email thông báo đơn hàng thành công
        const user = await databaseServices.users.findOne({ _id: order.user_id })
        if (user) {
          await enqueueEmailJob({
            type: 'order-confirmation',
            to: user.email,
            orderId: order._id.toString()
          })
        }
      }
    }

    return { success: true }
  }
}

const sePayService = new SePayService()
export default sePayService
