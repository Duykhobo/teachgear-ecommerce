import { Router } from 'express'
import { accessTokenValidator } from '../auth/auth.middleware'
import { wrapAsync } from '~/common/utils/handler'
import {
  serveVideoStreamController,
  uploadProductImageController,
  uploadUserAvatarController,
  uploadVideoController
} from './medias.controller'
import { adminMiddleware } from '~/common/middlewares/common.middleware'

const mediaRoute = Router()

/**
 * @swagger
 * /medias/upload-user-avatar:
 *   post:
 *     summary: Upload a single user avatar
 *     tags: [Medias]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User avatar uploaded successfully. Returns URL.
 */
mediaRoute.post('/upload-user-avatar', accessTokenValidator, wrapAsync(uploadUserAvatarController))

/**
 * @swagger
 * /medias/upload-product-image:
 *   post:
 *     summary: Upload a single product image
 *     tags: [Medias]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product image uploaded successfully. Returns URL.
 */
mediaRoute.post('/upload-product-image', accessTokenValidator, adminMiddleware, wrapAsync(uploadProductImageController))

/**
 * @swagger
 * /medias/upload-video:
 *   post:
 *     summary: Upload a single video
 *     tags: [Medias]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Video uploaded successfully. Returns URL.
 */
mediaRoute.post('/upload-video', accessTokenValidator, adminMiddleware, wrapAsync(uploadVideoController))

/**
 * @swagger
 * /medias/video-stream/{namefile}:
 *   get:
 *     summary: Stream a video file
 *     tags: [Medias]
 *     parameters:
 *       - in: path
 *         name: namefile
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       206:
 *         description: Partial content (Video streaming).
 *       404:
 *         description: Video not found.
 */
mediaRoute.get('/video-stream/:namefile', wrapAsync(serveVideoStreamController))

export default mediaRoute
