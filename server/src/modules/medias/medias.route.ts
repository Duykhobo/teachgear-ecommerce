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
mediaRoute.post('/upload-user-avatar', accessTokenValidator, wrapAsync(uploadUserAvatarController))

mediaRoute.post('/upload-product-image', accessTokenValidator, adminMiddleware, wrapAsync(uploadProductImageController))

mediaRoute.post('/upload-video', accessTokenValidator, adminMiddleware, wrapAsync(uploadVideoController))

mediaRoute.get('/video-stream/:namefile', wrapAsync(serveVideoStreamController))

export default mediaRoute
