import { Router } from 'express'
import { accessTokenValidator } from '~/modules/auth/auth.middleware'
import { createOrderValidator } from '~/modules/orders/orders.middleware'
import { createOrderController } from '~/modules/orders/orders.controller'
import { wrapAsync } from '~/common/utils/handler'

const orderRoutes = Router()

orderRoutes.post('/', accessTokenValidator, createOrderValidator, wrapAsync(createOrderController))

export default orderRoutes
