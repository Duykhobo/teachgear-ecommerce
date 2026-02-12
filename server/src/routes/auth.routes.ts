import { Router } from 'express'

import { LoginSchema, RegisterSchema } from '../models/schemas/auth.schemas'
import { wrapAsync } from '~/utils/handler'
import { loginController, logoutController, registerController } from '~/controllers/auth.controllers'
import { accessTokenValidator, refreshTokenValidator } from '~/middlewares/auth.middlewares'
import { validate } from '~/utils/validation'

const authRoutes = Router()

authRoutes.post('/register', validate(RegisterSchema), wrapAsync(registerController))

authRoutes.post('/login', validate(LoginSchema), wrapAsync(loginController))

authRoutes.post('/logout', wrapAsync(accessTokenValidator, refreshTokenValidator, logoutController))

export default authRoutes
