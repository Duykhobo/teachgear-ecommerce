import { Router } from 'express'
import {
  ForgotPasswordSchema,
  GoogleLoginSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema
} from './schemas/auth.validation'
import { wrapAsync } from '~/common/utils/handler'
import {
  emailVerifyController,
  emailVerifyGetController,
  forgotPasswordController,
  googleLoginController,
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
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     result:
 *                       type: object
 *                       properties:
 *                         access_token:
 *                           type: string
 *                         refresh_token:
 *                           type: string
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
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
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     result:
 *                       type: object
 *                       properties:
 *                         access_token:
 *                           type: string
 *                         refresh_token:
 *                           type: string
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         description: Too many requests.
 */
authRoutes.post('/login', authLimiter, validate(LoginSchema), wrapAsync(loginController))

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Login or Register with Google OAuth (ID Token)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_token]
 *             properties:
 *               id_token:
 *                 type: string
 *                 description: Google ID Token obtained from Google One Tap / Google Sign-In SDK
 *                 example: eyJhbGciOiJSUzI1NiIsImtpZCI6...
 *     responses:
 *       200:
 *         description: Login successful. Returns access_token and refresh_token.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     result:
 *                       type: object
 *                       properties:
 *                         access_token:
 *                           type: string
 *                         refresh_token:
 *                           type: string
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid Google Token.
 *       429:
 *         description: Too many requests.
 */
authRoutes.post('/google', authLimiter, validate(GoogleLoginSchema), wrapAsync(googleLoginController))

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
 *       401:
 *         description: Invalid or expired token.
 */
authRoutes.post('/verify-email', emailVerifyTokenValidator, wrapAsync(emailVerifyController))

/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     summary: Verify email via click link (Browser support)
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: HTML page confirming success.
 */
authRoutes.get('/verify-email', emailVerifyTokenValidator, wrapAsync(emailVerifyGetController))

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
authRoutes.post(
  '/forgot-password',
  emailActionLimiter,
  validate(ForgotPasswordSchema),
  wrapAsync(forgotPasswordController)
)

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
authRoutes.post(
  '/resend-verify-email',
  emailActionLimiter,
  accessTokenValidator,
  wrapAsync(resendEmailVerifyController)
)

export default authRoutes
