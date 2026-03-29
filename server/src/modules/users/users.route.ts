import { Router } from 'express'
import { getMeController, updateMeController } from '~/modules/users/users.controller'
import { accessTokenValidator } from '~/modules/auth/auth.middleware'
import { updateMeValidator } from '~/modules/users/users.middleware'
import { wrapAsync } from '~/common/utils/handler'

const userRoutes = Router()

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile management
 */

// Profile routes
/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user profile.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     result:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
userRoutes.get('/me', accessTokenValidator, wrapAsync(getMeController))

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     result:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
userRoutes.patch('/me', accessTokenValidator, updateMeValidator, wrapAsync(updateMeController))

export default userRoutes
