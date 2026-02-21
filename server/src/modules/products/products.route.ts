import { Router } from 'express'
import { getAllProducts, getProduct, createProductController, deleteProductController } from './products.controller'
import { wrapAsync } from '~/common/utils/handler'
import { paginationValidator } from './products.middleware'
import { adminMiddleware } from '~/common/middlewares/common.middleware'
import { accessTokenValidator } from '~/modules/auth/auth.middleware'
import { CreateProductSchema } from './products.schema'
import { validate } from '~/common/utils/validation'

const productsRoutes = Router()

productsRoutes.get('/', paginationValidator, wrapAsync(getAllProducts))
productsRoutes.get('/:id', wrapAsync(getProduct))

// Admin routes
productsRoutes.post(
  '/',
  accessTokenValidator,
  adminMiddleware,
  validate(CreateProductSchema as any),
  wrapAsync(createProductController)
)
productsRoutes.delete('/:id', accessTokenValidator, adminMiddleware, wrapAsync(deleteProductController))

export default productsRoutes
