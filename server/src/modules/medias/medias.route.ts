import { Router } from 'express'
import { accessTokenValidator } from '../auth/auth.middleware'
import { wrapAsync } from '~/common/utils/handler'
import { serveVideoStreamController, uploadImageController, uploadVideoController } from './medias.controller'

const mediaRoute = Router()

/**
 * @swagger
 * tags:
 *   name: Medias
 *   description: Media upload and streaming
 */

/**
 * @swagger
 * /medias/upload-image:
 *   post:
 *     summary: Upload one or multiple images
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
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded successfully. Returns URLs.
 */
mediaRoute.post('/upload-image', accessTokenValidator, wrapAsync(uploadImageController))

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
mediaRoute.post('/upload-video', accessTokenValidator, wrapAsync(uploadVideoController))

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
