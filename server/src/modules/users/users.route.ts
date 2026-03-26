import { Router } from 'express'
import {
  addToCartController,
  getCartController,
  updateCartItemController,
  removeFromCartController,
  getMeController,
  updateMeController
} from '~/modules/users/users.controller'
import { accessTokenValidator } from '~/modules/auth/auth.middleware'
import { addToCartValidator, updateCartValidator, updateMeValidator } from '~/modules/users/users.middleware'
import { wrapAsync } from '~/common/utils/handler'

const userRoutes = Router()

// Profile routes
userRoutes.get('/me', accessTokenValidator, wrapAsync(getMeController))
userRoutes.patch('/me', accessTokenValidator, updateMeValidator, wrapAsync(updateMeController))

// Cart routes
userRoutes.post('/cart', accessTokenValidator, addToCartValidator, wrapAsync(addToCartController))

userRoutes.get('/me/cart', accessTokenValidator, wrapAsync(getCartController))

userRoutes.patch('/cart/:product_id', accessTokenValidator, updateCartValidator, wrapAsync(updateCartItemController))

userRoutes.delete('/cart/:product_id', accessTokenValidator, wrapAsync(removeFromCartController))

export default userRoutes
