import express, { Request, Response } from 'express'
import { stripe } from '~/common/configs/stripe.config'
import { envConfig } from '~/common/configs/configs'
import databaseServices from '~/common/services/database.service'
import { ObjectId } from 'mongodb'
import { OrderStatus } from '~/common/constants/enums'
import logger from '~/common/utils/logger'

const paymentRoutes = express.Router()

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing and webhooks
 */

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Stripe Webhook (Hệ thống tự gọi, không dành cho User)
 *     description: Handles Stripe payment events like checkout.session.completed, checkout.session.expired, etc.
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Webhook received correctly.
 *       400:
 *         description: Invalid signature or error.
 */
paymentRoutes.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, envConfig.STRIPE_WEBHOOK_SECRET)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error(`Webhook Error: ${message}`)
    res.status(400).send(`Webhook Error: ${message}`)
    return
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const session = event.data.object as any
      const orderId = session.metadata.order_id

      logger.info(`Payment successful for Order: ${orderId}`)

      // Update Order Status in MongoDB
      await databaseServices.orders.updateOne(
        { _id: new ObjectId(orderId) },
        {
          $set: {
            status: OrderStatus.Processing,
            'payment.payment_status': 'Paid',
            'payment.payment_id': session.payment_intent,
            updated_at: new Date()
          }
        }
      )
      break
    }

    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const failedSession = event.data.object as any
      const failedOrderId = failedSession.metadata.order_id

      logger.warn(`Payment failed or expired for Order: ${failedOrderId}`)

      await databaseServices.orders.updateOne(
        { _id: new ObjectId(failedOrderId) },
        {
          $set: {
            status: OrderStatus.Cancelled,
            'payment.payment_status': 'Failed',
            updated_at: new Date()
          }
        }
      )
      break
    }

    default:
      logger.info(`Unhandled event type ${event.type}`)
  }

  res.json({ received: true })
})

export default paymentRoutes
