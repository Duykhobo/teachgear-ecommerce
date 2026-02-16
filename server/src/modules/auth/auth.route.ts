import { Router } from 'express'

import { LoginSchema, RegisterSchema } from '~/modules/auth/auth.schema'
import { wrapAsync } from '~/common/utils/handler'
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController
} from '~/modules/auth/auth.controller'
import { accessTokenValidator, refreshTokenValidator } from '~/modules/auth/auth.middleware'
import { validate } from '~/common/utils/validation'

const authRoutes = Router()

authRoutes.post('/register', validate(RegisterSchema), wrapAsync(registerController))

authRoutes.post('/login', validate(LoginSchema), wrapAsync(loginController))

authRoutes.post('/refresh-token', refreshTokenValidator, wrapAsync(refreshTokenController))

authRoutes.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

export default authRoutes
