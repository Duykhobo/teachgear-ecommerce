import { Router } from 'express'
import { getMeController, updateMeController } from '~/modules/users/users.controller'
import { accessTokenValidator } from '~/modules/auth/auth.middleware'
import { updateMeValidator } from '~/modules/users/users.middleware'
import { wrapAsync } from '~/common/utils/handler'

const userRoutes = Router()

// Profile routes
userRoutes.get('/me', accessTokenValidator, wrapAsync(getMeController))
userRoutes.patch('/me', accessTokenValidator, updateMeValidator, wrapAsync(updateMeController))

export default userRoutes
