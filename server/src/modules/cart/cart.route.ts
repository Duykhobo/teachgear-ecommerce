import { Router } from 'express'
import { accessTokenValidator } from '../auth/auth.middleware'
import { addToCartValidator, updateCartValidator } from './cart.middleware'
import { wrapAsync } from '~/common/utils/handler'
import {
  addToCartController,
  getCartController,
  removeFromCartController,
  updateCartItemController
} from './cart.controller'

const cartRoutes = Router()

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management
 */

// Cart routes
/**
 * @swagger
 * /carts:
 *   post:
 *     summary: Add an item to the cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id, quantity]
 *             properties:
 *               product_id:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Item added successfully. Returns updated cart.
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
 *                         $ref: '#/components/schemas/CartItem'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
cartRoutes.post('/', accessTokenValidator, addToCartValidator, wrapAsync(addToCartController))

/**
 * @swagger
 * /carts/me:
 *   get:
 *     summary: Get the current user's cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the user's cart items.
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
 *                         $ref: '#/components/schemas/CartItem'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
cartRoutes.get('/me', accessTokenValidator, wrapAsync(getCartController))

/**
 * @swagger
 * /carts/{product_id}:
 *   patch:
 *     summary: Update the quantity of an item in the cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The API uses the item's custom generated CartItem _id or the Product ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Quantity updated successfully. Returns updated cart.
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
 *                         $ref: '#/components/schemas/CartItem'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
cartRoutes.patch('/:product_id', accessTokenValidator, updateCartValidator, wrapAsync(updateCartItemController))

/**
 * @swagger
 * /carts/{product_id}:
 *   delete:
 *     summary: Remove an item from the cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The CartItem _id or Product ID.
 *     responses:
 *       204:
 *         description: Item removed successfully.
 *       401:
 *         description: Unauthorized.
 */
cartRoutes.delete('/:product_id', accessTokenValidator, wrapAsync(removeFromCartController))

export default cartRoutes
