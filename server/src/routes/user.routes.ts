import { Router } from 'express'
import { addToCartController, getCartController } from '~/controllers/user.controllers'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { wrapAsync } from '~/utils/handler'

const userRoutes = Router()

userRoutes.post('/cart', wrapAsync(accessTokenValidator, addToCartController))

userRoutes.get('/me/cart', wrapAsync(accessTokenValidator, getCartController))

export default userRoutes
