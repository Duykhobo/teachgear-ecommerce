import { Router } from 'express'
import {
  EmailVerifySchema,
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema
} from '~/modules/auth/auth.schema'
import { wrapAsync } from '~/common/utils/handler'
import {
  emailVerifyController,
  forgotPasswordController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resetPasswordController,
  verifyForgotPasswordTokenController,
  resendEmailVerifyController
} from '~/modules/auth/auth.controller'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordTokenValidator,
  refreshTokenValidator
} from '~/modules/auth/auth.middleware'
import { validate } from '~/common/utils/validation'
import { authLimiter, emailActionLimiter } from '~/common/middlewares/rate-limit.middleware'

const authRoutes = Router()

// 10 req / 1 phút / IP — chống brute force
authRoutes.post('/register', authLimiter, validate(RegisterSchema), wrapAsync(registerController))

authRoutes.post('/login', authLimiter, validate(LoginSchema), wrapAsync(loginController))

authRoutes.post('/refresh-token', refreshTokenValidator, wrapAsync(refreshTokenController))

authRoutes.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

authRoutes.post(
  '/verify-email',
  emailVerifyTokenValidator,
  validate(EmailVerifySchema),
  wrapAsync(emailVerifyController)
)

authRoutes.post('/verify-forgot-password', forgotPasswordTokenValidator, wrapAsync(verifyForgotPasswordTokenController))

// 5 req / 5 phút / IP — chống spam mail
authRoutes.post('/forgot-password', emailActionLimiter, validate(ForgotPasswordSchema), wrapAsync(forgotPasswordController))

authRoutes.post(
  '/reset-password',
  validate(ResetPasswordSchema),
  forgotPasswordTokenValidator,
  wrapAsync(resetPasswordController)
)

authRoutes.post('/resend-verify-email', emailActionLimiter, accessTokenValidator, wrapAsync(resendEmailVerifyController))

export default authRoutes

