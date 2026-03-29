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

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management for products
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category (Admin only)
 *     tags: [Admin - Categories]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     result:
 *                       $ref: '#/components/schemas/Category'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
categoryRoutes.post(
  '/',
  accessTokenValidator,
  adminMiddleware,
  validate(CreateCategorySchema),
  wrapAsync(createCategoryController)
)

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Returns a list of categories.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     result:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Category'
 */
categoryRoutes.get('/', wrapAsync(getAllCategoriesController))

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: Update a category (Admin only)
 *     tags: [Admin - Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated successfully.
 *       403:
 *         description: Forbidden.
 */
categoryRoutes.patch(
  '/:id',
  accessTokenValidator,
  adminMiddleware,
  validate(CategoryParamsSchema),
  validate(UpdateCategoryBodySchema),
  wrapAsync(updateCategoryController)
)

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category (Admin only)
 *     tags: [Admin - Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Category deleted successfully.
 *       403:
 *         description: Forbidden.
 */
categoryRoutes.delete(
  '/:id',
  accessTokenValidator,
  adminMiddleware,
  validate(CategoryParamsSchema),
  wrapAsync(deleteCategoryController)
)

export default categoryRoutes
