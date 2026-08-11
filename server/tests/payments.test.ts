import request from 'supertest'
import app from '../src/index'
import databaseServices from '../src/common/services/database.service'
import { OrderStatus, PaymentStatus } from '../src/common/constants/enums'
import { ObjectId } from 'mongodb'
import Order from '../src/modules/orders/models/orders.model'

describe('SePay IPN Webhook Integration Tests', () => {
  let orderId: string

  beforeEach(async () => {
    // Create a test order
    const testOrder = {
      user_id: new ObjectId(),
      order_items: [
        {
          product_id: new ObjectId(),
          quantity: 2,
          price: 1000
        }
      ],
      total_amount: 2000,
      status: OrderStatus.Pending,
      payment: {
        payment_status: PaymentStatus.Pending,
        payment_method: 'SePay',
        payment_id: ''
      },
      delivery: {
        address: '123 Test St, Test City',
        phone_number: '1234567890'
      },
      created_at: new Date(),
      updated_at: new Date()
    }

    const result = await databaseServices.orders.insertOne(testOrder as unknown as Order)
    orderId = result.insertedId.toString()
  })

  afterEach(async () => {
    await databaseServices.orders.deleteMany({})
  })

  it('Should process SePay ORDER_PAID IPN notification and update order status', async () => {
    const ipnPayload = {
      timestamp: Date.now(),
      notification_type: 'ORDER_PAID',
      order: {
        id: 'SP_TRANS_100',
        order_id: orderId,
        order_status: 'PAID',
        order_currency: 'VND',
        order_amount: '2000.00',
        order_invoice_number: `INV-${orderId}`,
        order_description: `Thanh toan don hang ${orderId}`
      },
      transaction: {
        id: 'TX_987654',
        payment_method: 'BANK_TRANSFER',
        transaction_id: 'FT240811999',
        transaction_status: 'SUCCESS',
        transaction_amount: '2000.00'
      }
    }

    const response = await request(app).post('/payments/sepay/ipn').send(ipnPayload)

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)

    // Verify order status updated in DB
    const updatedOrder = await databaseServices.orders.findOne({ _id: new ObjectId(orderId) })
    expect(updatedOrder?.status).toBe(OrderStatus.Processing)
    expect(updatedOrder?.payment.payment_status).toBe(PaymentStatus.Paid)
    expect(updatedOrder?.payment.payment_id).toBe('FT240811999')
  })

  it('Should handle IPN gracefully when order is not found', async () => {
    const fakeId = new ObjectId().toString()
    const ipnPayload = {
      timestamp: Date.now(),
      notification_type: 'ORDER_PAID',
      order: {
        id: 'SP_TRANS_101',
        order_id: fakeId,
        order_status: 'PAID',
        order_currency: 'VND',
        order_amount: '5000.00',
        order_invoice_number: `INV-${fakeId}`,
        order_description: `Thanh toan don hang ${fakeId}`
      }
    }

    const response = await request(app).post('/payments/sepay/ipn').send(ipnPayload)

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
  })
})
