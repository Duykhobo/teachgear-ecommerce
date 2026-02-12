import { Router } from 'express'
import { validate } from '~/utils/validation.middlewares'
import { LoginSchema, RegisterSchema } from '../models/schemas/auth.schemas'
import { wrapAsync } from '~/utils/handler'
import { loginController, registerController } from '~/controllers/auth.controllers'

const authRoutes = Router()

authRoutes.post('/register', validate(RegisterSchema), wrapAsync(registerController))

authRoutes.post('/login', validate(LoginSchema), wrapAsync(loginController))

export default authRoutes
