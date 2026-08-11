import { Router } from 'express'
import { accessTokenValidator } from '~/modules/auth/auth.middleware'
import { adminMiddleware } from '~/common/middlewares/common.middleware'
import {
  createOrderValidator,
  updateOrderStatusValidator,
  getOrdersAdminValidator
} from '~/modules/orders/orders.middleware'
import {
  createOrderController,
  cancelOrderController,
  updateOrderStatusController,
  getRevenueController,
  getTopSellingProductsController,
  getUserOrdersController,
  getOrderController,
  getAllOrdersAdminController,
  handleStripeWebhookController
} from '~/modules/orders/orders.controller'
import { wrapAsync } from '~/common/utils/handler'

const orderRoutes = Router()

/**
 * @swagger
 * /orders/webhook:
 *   post:
 *     summary: Stripe Webhook (Hệ thống tự gọi, không dành cho User)
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Webhook received.
 */
orderRoutes.post('/webhook', wrapAsync(handleStripeWebhookController))

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management and analytics
 */

// Public User Routes
/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order (Checkout)
 *     description: Converts the user's current shopping cart into a new order and clears the cart.
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shipping_address, payment_method]
 *             properties:
 *               shipping_address:
 *                 type: string
 *               payment_method:
 *                 type: string
 *                 description: PaymentMethod enum (e.g., Stripe, COD)
 *     responses:
 *       201:
 *         description: Order created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     result:
 *                       $ref: '#/components/schemas/Order'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
orderRoutes.post('/', accessTokenValidator, createOrderValidator, wrapAsync(createOrderController))

/**
 * @swagger
 * /orders/{id}/cancel:
 *   patch:
 *     summary: Cancel an existing order
 *     description: Only possible if the order is still pending. User must own the order.
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled successfully.
 *       400:
 *         description: Cannot cancel order in current state.
 *       401:
 *         description: Unauthorized.
 */
orderRoutes.patch('/:id/cancel', accessTokenValidator, wrapAsync(cancelOrderController))

// Admin Analytics Routes
/**
 * @swagger
 * /orders/admin/analytics/revenue:
 *   get:
 *     summary: Get order analytics (Admin only)
 *     tags: [Admin - Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns revenue statistics.
 */
orderRoutes.get('/admin/analytics/revenue', accessTokenValidator, adminMiddleware, wrapAsync(getRevenueController))

/**
 * @swagger
 * /orders/admin/analytics/top-products:
 *   get:
 *     summary: Get top selling products analytics (Admin only)
 *     tags: [Admin - Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns top products analytics data.
 */
orderRoutes.get(
  '/admin/analytics/top-products',
  accessTokenValidator,
  adminMiddleware,
  wrapAsync(getTopSellingProductsController)
)

// Admin Routes
/**
 * @swagger
 * /orders/admin/orders/{id}/status:
 *   patch:
 *     summary: Update order status (Admin only)
 *     tags: [Admin - Orders]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 description: OrderStatus enum value (e.g., Pending, Processing)
 *     responses:
 *       200:
 *         description: Order status updated successfully.
 */
orderRoutes.patch(
  '/admin/orders/:id/status',
  accessTokenValidator,
  adminMiddleware,
  updateOrderStatusValidator,
  wrapAsync(updateOrderStatusController)
)

/**
 * @swagger
 * /orders/admin/orders:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Admin - Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           description: Filter by OrderStatus enum (e.g., Pending, Processing)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           description: Search by name, phone or ID
 *     responses:
 *       200:
 *         description: Success
 */
orderRoutes.get(
  '/admin/orders',
  accessTokenValidator,
  adminMiddleware,
  getOrdersAdminValidator,
  wrapAsync(getAllOrdersAdminController)
)

/**
 * @swagger
 * /orders/me:
 *   get:
 *     summary: Get current user's order history
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user's list of orders.
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
 *                         $ref: '#/components/schemas/Order'
 */
orderRoutes.get('/me', accessTokenValidator, wrapAsync(getUserOrdersController))

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get specific order details
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     result:
 *                       $ref: '#/components/schemas/Order'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
orderRoutes.get('/:id', accessTokenValidator, wrapAsync(getOrderController))

export default orderRoutes
