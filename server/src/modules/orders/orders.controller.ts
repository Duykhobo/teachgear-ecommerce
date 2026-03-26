import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { CreateOrderReqBody } from '~/modules/orders/orders.schema'
import { TokenPayload } from '~/modules/auth/auth.schema'
import ordersService from './orders.service'
import { USERS_MESSAGES } from '~/common/constants/messages'

export const createOrderController = async (
  req: Request<ParamsDictionary, any, CreateOrderReqBody>,
  res: Response,
  _next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await ordersService.createOrder(user_id, req.body)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.CREATE_ORDER_SUCCESS,
    result
  })
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

export const getUserOrdersController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await ordersService.getUserOrder(user_id)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.GET_ORDERS_HISTORY_SUCCESS,
    result
  })
}
