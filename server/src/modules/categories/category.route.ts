import { Router } from 'express'
import {
  createCategoryController,
  deleteCategoryController,
  getAllCategoriesController,
  updateCategoryController
} from './category.controller'
import { wrapAsync } from '~/common/utils/handler'
import { adminMiddleware } from '~/common/middlewares/common.middleware'
import { accessTokenValidator } from '~/modules/auth/auth.middleware'
import { validate } from '~/common/utils/validation'
import { CategoryParamsSchema, CreateCategorySchema, UpdateCategoryBodySchema } from './category.schema'

const categoryRoutes = Router()

categoryRoutes.post(
  '/',
  accessTokenValidator,
  adminMiddleware,
  validate(CreateCategorySchema),
  wrapAsync(createCategoryController)
)

categoryRoutes.get('/', wrapAsync(getAllCategoriesController))

categoryRoutes.patch(
  '/:id',
  accessTokenValidator,
  adminMiddleware,
  validate(CategoryParamsSchema),
  validate(UpdateCategoryBodySchema),
  wrapAsync(updateCategoryController)
)

categoryRoutes.delete(
  '/:id',
  accessTokenValidator,
  adminMiddleware,
  validate(CategoryParamsSchema),
  wrapAsync(deleteCategoryController)
)

export default categoryRoutes
