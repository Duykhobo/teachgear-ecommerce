import { Router } from 'express'
import { addToCartController, getCartController } from '~/modules/users/users.controller'
import { accessTokenValidator } from '~/modules/auth/auth.middleware'
import { addToCartValidator } from '~/modules/users/users.middleware'
import { wrapAsync } from '~/common/utils/handler'

const userRoutes = Router()

userRoutes.post('/cart', accessTokenValidator, addToCartValidator, wrapAsync(addToCartController))

userRoutes.get('/me/cart', accessTokenValidator, wrapAsync(getCartController))
export default userRoutes
