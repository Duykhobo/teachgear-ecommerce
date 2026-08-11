import { SePayPgClient } from 'sepay-pg-node'
import crypto from 'crypto'
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
   * Khởi tạo Form Fields để Submit sang SePay Checkout.
   * Hỗ trợ ĐỒNG THỜI cả môi trường Sandbox (Test) và Production (Live)
   */
  public initCheckoutForm({
    order_id,
    invoice_number,
    amount,
    description,
    is_sandbox
  }: {
    order_id: string
    invoice_number: string
    amount: number
    description: string
    is_sandbox?: boolean
  }) {
    // Tự động xác định Sandbox hay Live dựa trên tham số hoặc cấu hình mặc định
    const useSandbox = is_sandbox !== undefined ? is_sandbox : envConfig.SEPAY_ENV === 'sandbox'
    const env: 'sandbox' | 'production' = useSandbox ? 'sandbox' : 'production'

    // Lấy cặp key tương ứng cho từng môi trường
    const merchant_id = useSandbox
      ? envConfig.SEPAY_SANDBOX_MERCHANT_ID || envConfig.SEPAY_MERCHANT_ID || 'SP-TEST-NT942323'
      : envConfig.SEPAY_LIVE_MERCHANT_ID || envConfig.SEPAY_MERCHANT_ID || 'SP-LIVE-NT588865'

    const secret_key = useSandbox
      ? envConfig.SEPAY_SANDBOX_SECRET_KEY || envConfig.SEPAY_SECRET_KEY || 'spsk_test_hZXd1g3X82pifpXQtdY8vhxYkES54gJ4'
      : envConfig.SEPAY_LIVE_SECRET_KEY || envConfig.SEPAY_SECRET_KEY || 'spsk_live_bg8L3Co4xRrcj5V7TPqC94YnY5kFdfWp'

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
      order_invoice_number: invoice_number || `INV${order_id}`,
      order_amount: Math.round(amount),
      currency: 'VND',
      order_description: description || `Thanh toan don hang ${order_id}`,
      success_url: `${baseUrl}/order/${order_id}?payment=success`,
      error_url: `${baseUrl}/order/${order_id}?payment=error`,
      cancel_url: `${baseUrl}/order/${order_id}?payment=cancel`
    })

    return {
      checkout_url,
      fields: checkout_fields,
      env
    }
  }

  /**
   * Xác thực chữ ký HMAC-SHA256 bảo mật từ SePay Webhook (X-SePay-Signature & X-SePay-Timestamp)
   */
  public verifyHMACSignature(payload: unknown, signature?: string, timestamp?: string): boolean {
    if (!signature) return true

    const payloadStr = JSON.stringify(payload)
    const signString = timestamp ? `${timestamp}.${payloadStr}` : payloadStr

    // Check với Live Secret Key
    const liveSecret = envConfig.SEPAY_LIVE_SECRET_KEY || envConfig.SEPAY_SECRET_KEY || 'spsk_live_bg8L3Co4xRrcj5V7TPqC94YnY5kFdfWp'
    const expectedLive = 'sha256=' + crypto.createHmac('sha256', liveSecret).update(signString).digest('hex')
    if (signature === expectedLive || signature === expectedLive.replace('sha256=', '')) return true

    // Check với Sandbox Secret Key
    const sandboxSecret = envConfig.SEPAY_SANDBOX_SECRET_KEY || 'spsk_test_hZXd1g3X82pifpXQtdY8vhxYkES54gJ4'
    const expectedSandbox = 'sha256=' + crypto.createHmac('sha256', sandboxSecret).update(signString).digest('hex')
    if (signature === expectedSandbox || signature === expectedSandbox.replace('sha256=', '')) return true

    return false
  }

  /**
   * Xử lý Webhook / IPN từ SePay khi có thanh toán chuyển khoản thành công (hỗ trợ cả Sandbox lẫn Production)
   */
  public async handleIPN(payload: SePayIPNPayload, signature?: string) {
    logger.info(`[SEPAY IPN] Received notification. Signature: ${signature || 'None'}`)

    if (payload.notification_type === 'ORDER_PAID' && payload.order) {
      const invoiceNumber = payload.order.order_invoice_number

      // 1. Tìm đơn hàng theo invoice_number hoặc id
      let order = await databaseServices.orders.findOne({
        'delivery.phone_number': invoiceNumber
      })

      const cleanId = invoiceNumber.replace(/^INV-?/i, '')
      if (!order && ObjectId.isValid(cleanId)) {
        order = await databaseServices.orders.findOne({ _id: new ObjectId(cleanId) })
      }

      if (order) {
        // Idempotency check: Skip if already paid
        if (order.payment.payment_status === PaymentStatus.Paid) {
          logger.info(`[SEPAY IPN] Order ${order._id} already marked as Paid. Skipping.`)
          return { success: true }
        }

        const paidAmount = Number(
          payload.transaction?.transaction_amount ||
            payload.order?.order_amount ||
            (payload as any).transferAmount ||
            0
        )

        // Cảnh báo nếu khách hàng chuyển THIẾU TIỀN đơn hàng
        if (paidAmount > 0 && paidAmount < order.total_amount) {
          logger.warn(`[SEPAY IPN] Order ${order._id} underpaid. Expected ${order.total_amount}, received ${paidAmount}`)

          const botToken = (envConfig as any).TELEGRAM_BOT_TOKEN || '8874098441:AAEQET7toAgwEZwRP70lLwElqrawF7glwQg'
          const chatId = (envConfig as any).TELEGRAM_CHAT_ID || '-1004294239186'

          if (botToken && chatId) {
            try {
              await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  parse_mode: 'HTML',
                  text: `⚠️ <b>TECHGEAR PAYMENT ALERT - KHÁCH CHUYỂN THIẾU TIỀN!</b>\n\n📦 <b>Mã đơn hàng:</b> <code>${order._id}</code>\n💵 <b>Giá trị đơn:</b> <code>${Number(order.total_amount).toLocaleString('vi-VN')} đ</code>\n🔻 <b>Số tiền chuyển:</b> <code>${paidAmount.toLocaleString('vi-VN')} đ</code> (Thiếu ${(order.total_amount - paidAmount).toLocaleString('vi-VN')} đ)\n📝 <b>Mã hóa đơn:</b> <code>${invoiceNumber}</code>\n\n🚨 <i>Đơn chưa được tự động duyệt. Vui lòng kiểm tra!</i>`
                })
              })
            } catch (err) {
              logger.error('[SEPAY IPN] Failed to send Telegram alert for underpaid order', err)
            }
          }
          return { success: false, message: 'Số tiền thanh toán chưa đủ' }
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
  /**
   * Tạo URL ảnh VietQR chuẩn SePay / VietQR Quick Link
   */
  public generateVietQRUrl({
    bank = 'Sacombank',
    acc = '070148520060',
    template = 'compact2',
    amount,
    des,
    holder = 'VO QUOC G',
    store = 'TechGear Store',
    fullacc = true
  }: {
    bank?: string
    acc?: string
    template?: 'compact' | 'compact2' | 'qr_only' | 'print'
    amount: number
    des: string
    holder?: string
    store?: string
    fullacc?: boolean
  }) {
    const params = new URLSearchParams({
      bank,
      acc,
      template,
      amount: String(amount),
      des,
      holder,
      store,
      fullacc: String(fullacc)
    })
    return `https://qr.sepay.vn/img?${params.toString()}`
  }
}

const sePayService = new SePayService()
export default sePayService
