import { NextFunction, Request, Response } from 'express'
import { AddToCartReqBody } from '~/modules/users/users.schema'

import usersService from '~/modules/users/users.service'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { USERS_MESSAGES } from '~/common/constants/messages'
import { TokenPayload } from '~/modules/auth/auth.schema'
// 1. Add to cart Controller
export const addToCartController = async (
  req: Request<ParamsDictionary, any, AddToCartReqBody>,
  res: Response,
  _next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await usersService.addToCart(user_id, req.body)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.ADD_TO_CART_SUCCESS,
    data: result
  })
}

// 2. Get cart Controller
export const getCartController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  _next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await usersService.getCart(user_id)
  return res.status(HTTP_STATUS.OK).json({ data: result })
}
