import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { CreateOrderReqBody, GetOrdersAdminReqQuery } from './schemas/orders.schema'
import { TokenPayload } from '~/modules/auth/types/auth.types'
import ordersService from './orders.service'
import { USERS_MESSAGES } from '~/common/constants/messages'
import { USER_ROLE, OrderStatus } from '~/common/constants/enums'

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
  req: Request<ParamsDictionary, unknown, CreateOrderReqBody>,
  res: Response,
  _next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await ordersService.createOrder(user_id, req.body)
  return res.status(HTTP_STATUS.OK).json(result)
}

export const cancelOrderController = async (
  req: Request<ParamsDictionary, unknown, unknown>,
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
  req: Request<ParamsDictionary, unknown, { status: OrderStatus }>,
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

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get specific order details
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
export const getOrderController = async (req: Request, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const { id } = req.params as { id: string }
  const isAdmin = role === USER_ROLE.Admin
  const result = await ordersService.getOrder(user_id, id, isAdmin)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.GET_ORDER_SUCCESS,
    result
  })
}

/**
 * @swagger
 * /orders/admin:
 *   get:
 *     tags:
 *       - Orders
 *     summary: List all orders for admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *       - name: status
 *         in: query
 *         schema:
 *           type: integer
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
export const getAllOrdersAdminController = async (req: Request, res: Response) => {
  const result = await ordersService.getAllOrdersAdmin(req.query as unknown as GetOrdersAdminReqQuery)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.GET_ORDERS_HISTORY_SUCCESS,
    result
  })
}
