import { Router } from 'express'
import { validate } from '~/middlewares/validation.middlewares'
import { RegisterSchema } from '../models/schemas/auth.schemas'

const authRoutes = Router()

authRoutes.post('/register', validate(RegisterSchema))

export default authRoutes
