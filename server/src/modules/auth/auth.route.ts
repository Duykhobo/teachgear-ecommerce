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

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and session management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, confirm_password, date_of_birth]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nguyen Van A
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: P@ssw0rd123!
 *               confirm_password:
 *                 type: string
 *                 example: P@ssw0rd123!
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: "1999-01-15"
 *     responses:
 *       201:
 *         description: Registration successful. Returns access_token and refresh_token.
 *       400:
 *         description: Validation error or email already exists.
 *       429:
 *         description: Too many requests.
 */
authRoutes.post('/register', authLimiter, validate(RegisterSchema), wrapAsync(registerController))

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: P@ssw0rd123!
 *     responses:
 *       200:
 *         description: Login successful. Returns access_token and refresh_token.
 *       401:
 *         description: Invalid email or password.
 *       429:
 *         description: Too many requests.
 */
authRoutes.post('/login', authLimiter, validate(LoginSchema), wrapAsync(loginController))

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Get a new access token using a refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refresh_token]
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns new access_token and refresh_token.
 *       401:
 *         description: Refresh token is invalid or expired.
 */
authRoutes.post('/refresh-token', refreshTokenValidator, wrapAsync(refreshTokenController))

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout and invalidate the refresh token
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refresh_token]
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful.
 *       401:
 *         description: Unauthorized.
 */
authRoutes.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify user email using the token from the verification email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email_verify_token]
 *             properties:
 *               email_verify_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully. Returns new tokens.
 *       404:
 *         description: User not found or token is invalid.
 */
authRoutes.post(
  '/verify-email',
  emailVerifyTokenValidator,
  validate(EmailVerifySchema),
  wrapAsync(emailVerifyController)
)

/**
 * @swagger
 * /auth/verify-forgot-password:
 *   post:
 *     summary: Verify forgot password token before allowing reset
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid.
 *       401:
 *         description: Token is invalid or expired.
 */
authRoutes.post('/verify-forgot-password', forgotPasswordTokenValidator, wrapAsync(verifyForgotPasswordTokenController))

// 5 req / 5 phút / IP — chống spam mail
/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent.
 *       404:
 *         description: Email not found.
 *       429:
 *         description: Too many requests.
 */
authRoutes.post('/forgot-password', emailActionLimiter, validate(ForgotPasswordSchema), wrapAsync(forgotPasswordController))

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset the user's password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [forgot_password_token, password, confirm_password]
 *             properties:
 *               forgot_password_token:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               confirm_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully.
 *       401:
 *         description: Token is invalid or expired.
 */
authRoutes.post(
  '/reset-password',
  validate(ResetPasswordSchema),
  forgotPasswordTokenValidator,
  wrapAsync(resetPasswordController)
)

/**
 * @swagger
 * /auth/resend-verify-email:
 *   post:
 *     summary: Resend the email verification link
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Verification email resent.
 *       400:
 *         description: Email is already verified or account is banned.
 */
authRoutes.post('/resend-verify-email', emailActionLimiter, accessTokenValidator, wrapAsync(resendEmailVerifyController))

export default authRoutes
