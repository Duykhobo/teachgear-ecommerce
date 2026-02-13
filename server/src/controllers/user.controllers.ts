import { NextFunction, Request, Response } from 'express'
import { AddToCartReqBody } from '~/models/requests/user.requests'
import { TokenPayload } from '~/models/requests/auth.requests'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
// 1. Add to cart Controller
export const addToCartController = async (
  req: Request<ParamsDictionary, any, AddToCartReqBody>,
  res: Response,
  next: NextFunction
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
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await usersService.getCart(user_id)
  return res.status(HTTP_STATUS.OK).json({ data: result })
}
