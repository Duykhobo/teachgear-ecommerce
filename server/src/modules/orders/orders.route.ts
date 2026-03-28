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
  getUserOrdersController,
  handleStripeWebhookController
} from '~/modules/orders/orders.controller'
import { wrapAsync } from '~/common/utils/handler'
import express from 'express'

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
orderRoutes.post(
  '/webhook',
  express.raw({ type: 'application/json' }), // Giữ nguyên dạng raw buffer
  wrapAsync(handleStripeWebhookController)
)

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
 *                 type: integer
 *                 description: Payment enum (e.g., 0 = COD, 1 = Online)
 *     responses:
 *       201:
 *         description: Order created successfully.
 *       400:
 *         description: Missing information or empty cart.
 *       401:
 *         description: Unauthorized.
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
 *     summary: Get revenue analytics (Admin only)
 *     tags: [Orders]
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
 *     tags: [Orders]
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
 *     tags: [Orders]
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
 *                 type: integer
 *                 description: OrderStatus enum value
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
 * /orders/me:
 *   get:
 *     summary: Get current user's order history
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user's list of orders.
 */
orderRoutes.get('/me', accessTokenValidator, wrapAsync(getUserOrdersController))

export default orderRoutes
