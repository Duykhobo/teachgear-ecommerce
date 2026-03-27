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

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product catalog management
 */

/**
 * @swagger
 * /products/top-selling:
 *   get:
 *     summary: Get top-selling products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Returns a list of the top-selling products.
 */
productsRoutes.get('/top-selling', optionalAccessTokenValidator, wrapAsync(getTopSellingProductsController))

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with pagination and filtering
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 16
 *         description: Number of items per page
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search products by name
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns a paginated list of products.
 */
productsRoutes.get('/', optionalAccessTokenValidator, paginationValidator, wrapAsync(getAllProducts))

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a specific product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Returns the product details.
 *       404:
 *         description: Product not found.
 */
productsRoutes.get('/:id', optionalAccessTokenValidator, wrapAsync(getProduct))

// Admin routes
/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, category, description, quantity]
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               price_before_discount:
 *                 type: number
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Product created successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden. Admin access required.
 */
productsRoutes.post(
  '/',
  accessTokenValidator,
  adminMiddleware,
  validate(CreateProductSchema),
  wrapAsync(createProductController)
)

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product (Admin only)
 *     tags: [Products]
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
 *         description: Product deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
productsRoutes.delete('/:id', accessTokenValidator, adminMiddleware, wrapAsync(deleteProductController))

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update an existing product (Admin only)
 *     tags: [Products]
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
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product updated successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
productsRoutes.patch(
  '/:id',
  accessTokenValidator,
  adminMiddleware,
  validate(ProductParamsSchema),
  validate(UpdateProductBodySchema),
  wrapAsync(updateProductController)
)

export default productsRoutes
