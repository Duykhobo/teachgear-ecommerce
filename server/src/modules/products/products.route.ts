import { Router } from 'express'
import {
  getAllProducts,
  getProduct,
  createProductController,
  deleteProductController,
  updateProductController,
  getTopSellingProductsController
} from './products.controller'
import { wrapAsync } from '~/common/utils/handler'
import { paginationValidator } from './products.middleware'
import { adminMiddleware } from '~/common/middlewares/common.middleware'
import { accessTokenValidator, optionalAccessTokenValidator } from '~/modules/auth/auth.middleware'
import { CreateProductSchema, ProductParamsSchema, UpdateProductBodySchema } from './products.schema'
import { validate } from '~/common/utils/validation'

const productsRoutes = Router()

productsRoutes.get('/top-selling', optionalAccessTokenValidator, wrapAsync(getTopSellingProductsController))
productsRoutes.get('/', optionalAccessTokenValidator, paginationValidator, wrapAsync(getAllProducts))
productsRoutes.get('/:id', optionalAccessTokenValidator, wrapAsync(getProduct))

// Admin routes
productsRoutes.post(
  '/',
  accessTokenValidator,
  adminMiddleware,
  validate(CreateProductSchema),
  wrapAsync(createProductController)
)
productsRoutes.delete('/:id', accessTokenValidator, adminMiddleware, wrapAsync(deleteProductController))

productsRoutes.patch(
  '/:id',
  accessTokenValidator,
  adminMiddleware,
  validate(ProductParamsSchema),
  validate(UpdateProductBodySchema),
  wrapAsync(updateProductController)
)

export default productsRoutes
