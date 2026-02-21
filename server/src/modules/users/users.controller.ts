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

// 3. Update cart item Controller
export const updateCartItemController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  _next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { product_id } = req.params as { product_id: string }
  const { quantity } = req.body

  const result = await usersService.updateCartItem(user_id, product_id, quantity)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Cart item updated successfully',
    data: result
  })
}

// 4. Remove from cart Controller
export const removeFromCartController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  _next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { product_id } = req.params as { product_id: string }

  const result = await usersService.removeFromCart(user_id, product_id)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Item removed from cart successfully',
    data: result
  })
}
