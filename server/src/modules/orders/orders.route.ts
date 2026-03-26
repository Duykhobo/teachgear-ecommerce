import { Router } from 'express'
import { accessTokenValidator } from '~/modules/auth/auth.middleware'
import { adminMiddleware } from '~/common/middlewares/common.middleware'
import { createOrderValidator, updateOrderStatusValidator } from '~/modules/orders/orders.middleware'
import {
  createOrderController,
  cancelOrderController,
  updateOrderStatusController,
  getRevenueController,
  getTopSellingProductsController,
  getUserOrdersController
} from '~/modules/orders/orders.controller'
import { wrapAsync } from '~/common/utils/handler'

const orderRoutes = Router()

// Public User Routes
orderRoutes.post('/', accessTokenValidator, createOrderValidator, wrapAsync(createOrderController))
orderRoutes.patch('/:id/cancel', accessTokenValidator, wrapAsync(cancelOrderController))

// Admin Analytics Routes (MUST be placed before dynamic /:id to prevent matching conflicts)
orderRoutes.get('/admin/analytics/revenue', accessTokenValidator, adminMiddleware, wrapAsync(getRevenueController))
orderRoutes.get(
  '/admin/analytics/top-products',
  accessTokenValidator,
  adminMiddleware,
  wrapAsync(getTopSellingProductsController)
)

// Admin Routes (Can be prefixed with /admin or handled here with middleware)
orderRoutes.patch(
  '/admin/orders/:id/status',
  accessTokenValidator,
  adminMiddleware,
  updateOrderStatusValidator,
  wrapAsync(updateOrderStatusController)
)

orderRoutes.get('/me', accessTokenValidator, wrapAsync(getUserOrdersController))

export default orderRoutes
