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

const authRoutes = Router()

authRoutes.post('/register', validate(RegisterSchema), wrapAsync(registerController))

authRoutes.post('/login', validate(LoginSchema), wrapAsync(loginController))

authRoutes.post('/refresh-token', refreshTokenValidator, wrapAsync(refreshTokenController))

authRoutes.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

authRoutes.get(
  '/verify-email',
  emailVerifyTokenValidator,
  validate(EmailVerifySchema),
  wrapAsync(emailVerifyController)
)

authRoutes.post('/verify-forgot-password', forgotPasswordTokenValidator, wrapAsync(verifyForgotPasswordTokenController))

authRoutes.post('/forgot-password', validate(ForgotPasswordSchema), wrapAsync(forgotPasswordController))

authRoutes.post(
  '/reset-password',
  validate(ResetPasswordSchema),
  forgotPasswordTokenValidator,
  wrapAsync(resetPasswordController)
)

authRoutes.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendEmailVerifyController))

export default authRoutes
