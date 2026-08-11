import express from 'express'
import { sePayIPNController } from './payments.controller'
import { wrapAsync } from '~/common/utils/handler'

const paymentRoutes = express.Router()

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing and webhooks via SePay
 */

/**
 * @swagger
 * /payments/sepay/ipn:
 *   post:
 *     summary: SePay Instant Payment Notification (IPN Webhook)
 *     description: Realtime callback endpoint called by SePay Gateway when a bank transfer QR payment is completed.
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notification_type:
 *                 type: string
 *                 example: ORDER_PAID
 *               order:
 *                 type: object
 *                 properties:
 *                   order_invoice_number:
 *                     type: string
 *                     example: INV-1759134677
 *                   order_amount:
 *                     type: string
 *                     example: "100000.00"
 *     responses:
 *       200:
 *         description: IPN processed successfully.
 */
paymentRoutes.post('/sepay/ipn', wrapAsync(sePayIPNController))

export default paymentRoutes
