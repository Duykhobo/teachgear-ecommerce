import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { CreateOrderReqBody } from '~/modules/orders/orders.schema'
import { TokenPayload } from '~/modules/auth/auth.schema'
import ordersService from './orders.service'

export const createOrderController = async (
  req: Request<ParamsDictionary, any, CreateOrderReqBody>,
  res: Response,
  _next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await ordersService.createOrder(user_id, req.body)
  return res.status(HTTP_STATUS.OK).json({ result })
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
    message: 'Order cancelled successfully',
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
    message: 'Order status updated successfully',
    result
  })
}
