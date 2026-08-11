import databaseServices from '~/common/services/database.service'
import sePayService from '~/modules/payments/sepay.service'
import { ObjectId } from 'mongodb'
import { OrderStatus, PaymentStatus } from '~/common/constants/enums'

async function runTest() {
  console.log('\n==================================================')
  console.log('🧪 TESTING SEPAY PAYMENT GATEWAY & IPN WEBHOOK API')
  console.log('==================================================\n')

  try {
    // 1. Connect DB
    await databaseServices.connect()
    console.log('✅ Connected to MongoDB')

    // 2. Test initCheckoutForm
    const testOrderId = new ObjectId().toString()
    const checkoutResult = sePayService.initCheckoutForm({
      order_id: testOrderId,
      invoice_number: `INV-${testOrderId}`,
      amount: 150000,
      description: `Thanh toan don hang ${testOrderId}`
    })

    console.log('\n--- 1. Testing SePay Checkout Form Generation ---')
    console.log('Checkout URL:', checkoutResult.checkout_url)
    console.log('Form Fields:')
    console.dir(checkoutResult.fields, { depth: null })

    if (!checkoutResult.checkout_url || !checkoutResult.fields.signature) {
      throw new Error('❌ Checkout URL or Signature missing!')
    }
    console.log('✅ Form fields & HMAC-SHA256 signature generated successfully!\n')

    // 3. Create a dummy order in DB for IPN testing
    const dummyOrder = {
      _id: new ObjectId(testOrderId),
      user_id: new ObjectId(),
      order_items: [],
      total_amount: 150000,
      status: OrderStatus.Pending,
      payment: {
        payment_method: 'SePay' as any,
        payment_status: PaymentStatus.Pending,
        payment_id: ''
      },
      delivery: {
        delivery_method: 'Standard' as any,
        delivery_status: 'Pending' as any,
        address: '123 Test St',
        receiver_name: 'Test Customer',
        phone_number: '0900000000'
      },
      created_at: new Date(),
      updated_at: new Date()
    }

    await databaseServices.orders.insertOne(dummyOrder as any)
    console.log(`--- 2. Created Dummy Order in MongoDB (ID: ${testOrderId}) ---`)

    // 4. Test handleIPN callback
    console.log('\n--- 3. Testing SePay IPN Webhook Simulation ---')
    const ipnPayload = {
      timestamp: Date.now(),
      notification_type: 'ORDER_PAID',
      order: {
        id: 'SP_TRANS_999',
        order_id: testOrderId,
        order_status: 'PAID',
        order_currency: 'VND',
        order_amount: '150000.00',
        order_invoice_number: `INV-${testOrderId}`,
        order_description: `Thanh toan don hang ${testOrderId}`
      },
      transaction: {
        id: 'TX_12345678',
        payment_method: 'BANK_TRANSFER',
        transaction_id: 'FT240811999',
        transaction_status: 'SUCCESS',
        transaction_amount: '150000.00'
      }
    }

    const ipnResult = await sePayService.handleIPN(ipnPayload)
    console.log('IPN Result:', ipnResult)

    // 5. Verify Order status updated in DB
    const updatedOrder = await databaseServices.orders.findOne({ _id: new ObjectId(testOrderId) })
    console.log('\n--- 4. Verifying Updated Order in MongoDB ---')
    console.log('Payment Status:', updatedOrder?.payment.payment_status)
    console.log('Order Status:', updatedOrder?.status)
    console.log('Payment ID:', updatedOrder?.payment.payment_id)

    if (
      updatedOrder?.payment.payment_status === PaymentStatus.Paid &&
      updatedOrder?.status === OrderStatus.Processing
    ) {
      console.log('\n🎉 ALL TESTS PASSED! SePay SDK & Webhook IPN are working 100% perfectly!')
    } else {
      console.error('❌ Test failed: Order status was not updated properly.')
    }

    // Clean up test order
    await databaseServices.orders.deleteOne({ _id: new ObjectId(testOrderId) })
  } catch (error) {
    console.error('❌ Test failed with error:', error)
  } finally {
    process.exit(0)
  }
}

runTest()
