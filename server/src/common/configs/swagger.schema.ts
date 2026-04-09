/**
 * @swagger
 * components:
 *   schemas:
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Operation successful"
 *         result:
 *           type: object
 *           description: The actual data returned by the API
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "An error occurred"
 *         errors:
 *           type: object
 *           description: Detailed validation errors if any
 *
 *     Address:
 *       type: object
 *       properties:
 *         street:
 *           type: string
 *         ward:
 *           type: string
 *         district:
 *           type: string
 *         city:
 *           type: string
 *         country:
 *           type: string
 *         is_default:
 *           type: boolean
 *
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: integer
 *           description: "0: Admin, 1: User"
 *         verify:
 *           type: integer
 *           description: "0: Unverified, 1: Verified, 2: Banned"
 *         date_of_birth:
 *           type: string
 *           format: date-time
 *         avatar:
 *           type: string
 *         addresses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Address'
 *
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         slug:
 *           type: string
 *
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         price:
 *           type: number
 *         description:
 *           type: string
 *         stock_quantity:
 *           type: integer
 *         sold_quantity:
 *           type: integer
 *         category:
 *           type: string
 *           description: Category ID
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *         is_active:
 *           type: boolean
 *
 *     OrderItem:
 *       type: object
 *       properties:
 *         product_id:
 *           type: string
 *         name:
 *           type: string
 *         image:
 *           type: string
 *         quantity:
 *           type: integer
 *         price:
 *           type: number
 *
 *     OrderPayment:
 *       type: object
 *       properties:
 *         payment_method:
 *           type: string
 *         payment_status:
 *           type: string
 *         payment_id:
 *           type: string
 *
 *     OrderDelivery:
 *       type: object
 *       properties:
 *         delivery_method:
 *           type: string
 *         delivery_status:
 *           type: string
 *         address:
 *           type: string
 *         phone_number:
 *           type: string
 *         receiver_name:
 *           type: string
 *         shipping_fee:
 *           type: number
 *
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user_id:
 *           type: string
 *         total_amount:
 *           type: number
 *         status:
 *           type: integer
 *           description: Order status enum
 *         order_items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         payment:
 *           $ref: '#/components/schemas/OrderPayment'
 *         delivery:
 *           $ref: '#/components/schemas/OrderDelivery'
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     CartItem:
 *       type: object
 *       properties:
 *         product_id:
 *           type: string
 *         quantity:
 *           type: integer
 *
 *   responses:
 *     BadRequestError:
 *       description: "Invalid request parameters or body"
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     UnauthorizedError:
 *       description: "Access token is missing or invalid"
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     ForbiddenError:
 *       description: "Access denied (Insufficient permissions)"
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     NotFoundError:
 *       description: "Resource not found"
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     InternalServerError:
 *       description: "A server-side error occurred"
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 */
