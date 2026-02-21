import { Router } from 'express'
import { createCategoryController } from './category.controller'
import { wrapAsync } from '~/common/utils/handler'
import { adminMiddleware } from '~/common/middlewares/common.middleware'
import { accessTokenValidator } from '~/modules/auth/auth.middleware'
import { validate } from '~/common/utils/validation'
import { CreateCategorySchema } from './category.schema'

const categoryRoutes = Router()

categoryRoutes.post(
  '/',
  accessTokenValidator,
  adminMiddleware,
  validate(CreateCategorySchema),
  wrapAsync(createCategoryController)
)

export default categoryRoutes
