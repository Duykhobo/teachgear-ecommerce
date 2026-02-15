import { Router } from 'express'
import { addToCartController, createOrderController, getCartController } from '~/controllers/user.controllers'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { createOrderValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

const userRoutes = Router()

userRoutes.post('/cart', wrapAsync(accessTokenValidator, addToCartController))

userRoutes.get('/me/cart', wrapAsync(accessTokenValidator, getCartController))

userRoutes.post('/orders', accessTokenValidator, createOrderValidator, wrapAsync(createOrderController))
export default userRoutes
