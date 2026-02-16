import { Router } from 'express'
import { addToCartController, createOrderController, getCartController } from '~/modules/users/users.controller'
import { accessTokenValidator } from '~/modules/auth/auth.middleware'
import { createOrderValidator } from '~/modules/users/users.middleware'
import { wrapAsync } from '~/common/utils/handler'

const userRoutes = Router()

userRoutes.post('/cart', wrapAsync(accessTokenValidator, addToCartController))

userRoutes.get('/me/cart', wrapAsync(accessTokenValidator, getCartController))

userRoutes.post('/orders', accessTokenValidator, createOrderValidator, wrapAsync(createOrderController))
export default userRoutes
