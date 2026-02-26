import { Router } from 'express'
import { accessTokenValidator } from '../auth/auth.middleware'
import { wrapAsync } from '~/common/utils/handler'
import { serveVideoStreamController, uploadImageController, uploadVideoController } from './medias.controller'

const mediaRoute = Router()
mediaRoute.post('/upload-image', accessTokenValidator, wrapAsync(uploadImageController))

mediaRoute.post('/upload-video', accessTokenValidator, wrapAsync(uploadVideoController))

mediaRoute.get('/video-stream/:namefile', wrapAsync(serveVideoStreamController))

export default mediaRoute
