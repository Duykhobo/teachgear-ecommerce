import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { CreateOrderReqBody } from '~/modules/orders/orders.schema'
import { TokenPayload } from '~/modules/auth/auth.schema'
import ordersService from './orders.service'
import { USERS_MESSAGES } from '~/common/constants/messages'
import { envConfig } from '~/common/configs/configs'
import { stripe } from '~/common/configs/stripe.config'

/**
 * @swagger
 * /orders:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Create a new order
 *     description: Creates an order from current cart items. Returns a Stripe checkout URL if 'Stripe' is the payment method.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               receiver_name:
 *                 type: string
 *               payment_method:
 *                 type: string
 *                 example: "Stripe"
 *     responses:
 *       200:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     total_amount:
 *                       type: number
 *                     checkout_url:
 *                       type: string
 *       422:
 *         description: Validation failed (Zod error)
 */
export const createOrderController = async (
  req: Request<ParamsDictionary, any, CreateOrderReqBody>,
  res: Response,
  _next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await ordersService.createOrder(user_id, req.body)
  return res.status(HTTP_STATUS.OK).json(result)
}

export const cancelOrderController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  _next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { id } = req.params as { id: string }

  const result = await ordersService.cancelOrder(user_id, id)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.CANCEL_ORDER_SUCCESS,
    result
  })
}

export const updateOrderStatusController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  _next: NextFunction
) => {
  const { id } = req.params as { id: string }
  const { status } = req.body

  const result = await ordersService.updateOrderStatus(id, status)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.UPDATE_ORDER_STATUS_SUCCESS,
    result
  })
}

export const getRevenueController = async (req: Request, res: Response, _next: NextFunction) => {
  const { startDate, endDate } = req.query
  const result = await ordersService.getRevenue(startDate as string, endDate as string)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.GET_REVENUE_SUCCESS,
    result
  })
}

export const getTopSellingProductsController = async (req: Request, res: Response, _next: NextFunction) => {
  const { limit } = req.query
  const result = await ordersService.getTopSellingProducts(limit ? Number(limit) : 5)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.GET_TOP_SELLING_PRODUCTS_SUCCESS,
    result
  })
}

/**
 * @swagger
 * /orders/me:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get user order history
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
export const getUserOrdersController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await ordersService.getUserOrder(user_id)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.GET_ORDERS_HISTORY_SUCCESS,
    result
  })
}

export const handleStripeWebhookController = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string
  const endpointSecret = envConfig.STRIPE_WEBHOOK_SECRET as string
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err: any) {
    console.error(`[STRIPE WEBHOOK ERROR]: ${err.message}`)
    return res.status(HTTP_STATUS.BAD_REQUEST).send(`Webhook Error: ${err.message}`)
  }

  await ordersService.handleStripeWebhook(event)

  res.status(HTTP_STATUS.OK).json({ received: true })
}
