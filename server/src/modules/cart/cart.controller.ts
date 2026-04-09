import { NextFunction, Request, Response } from 'express'
import { TokenPayload } from '../auth/types/auth.types'
import { ParamsDictionary } from 'express-serve-static-core'
import cartService from './cart.service'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { USERS_MESSAGES } from '~/common/constants/messages'
import { AddToCartReqBody } from './schemas/cart.schema'

// 1. Add to cart Controller
export const addToCartController = async (
  req: Request<ParamsDictionary, unknown, AddToCartReqBody>,
  res: Response,
  _next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await cartService.addToCart(user_id, req.body)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.ADD_TO_CART_SUCCESS,
    result
  })
}

// 2. Get cart Controller
export const getCartController = async (
  req: Request<ParamsDictionary, unknown, unknown>,
  res: Response,
  _next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await cartService.getCart(user_id)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.GET_CART_SUCCESS,
    result
  })
}

// 3. Update cart item Controller
export const updateCartItemController = async (
  req: Request<ParamsDictionary, unknown, { quantity: number }>,
  res: Response,
  _next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { product_id } = req.params as { product_id: string }
  const { quantity } = req.body

  const result = await cartService.updateCartItem(user_id, product_id, quantity)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.UPDATE_CART_ITEM_SUCCESS,
    result
  })
}

// 4. Remove from cart Controller
export const removeFromCartController = async (
  req: Request<ParamsDictionary, unknown, unknown>,
  res: Response,
  _next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { product_id } = req.params as { product_id: string }

  await cartService.removeFromCart(user_id, product_id)
  return res.status(HTTP_STATUS.NO_CONTENT).send()
}
