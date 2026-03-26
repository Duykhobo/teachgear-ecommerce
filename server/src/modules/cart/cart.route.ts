import { Router } from 'express'
import { accessTokenValidator } from '../auth/auth.middleware'
import { addToCartValidator, updateCartValidator } from './cart.middleware'
import { wrapAsync } from '~/common/utils/handler'
import {
  addToCartController,
  getCartController,
  removeFromCartController,
  updateCartItemController
} from './cart.controller'

const cartRoutes = Router()

// Cart routes
cartRoutes.post('/', accessTokenValidator, addToCartValidator, wrapAsync(addToCartController))

cartRoutes.get('/me', accessTokenValidator, wrapAsync(getCartController))

cartRoutes.patch('/:product_id', accessTokenValidator, updateCartValidator, wrapAsync(updateCartItemController))

cartRoutes.delete('/:product_id', accessTokenValidator, wrapAsync(removeFromCartController))

export default cartRoutes
