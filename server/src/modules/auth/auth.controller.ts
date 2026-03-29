import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import databaseServices from '~/common/services/database.service'
import { ErrorWithStatus } from '~/common/models/Errors'
import { USERS_MESSAGES } from '~/common/constants/messages'
import HTTP_STATUS from '~/common/constants/httpStatus'
import authService from '~/modules/auth/auth.service'
import {
  ForgotPasswordReqBody,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  EmailVerifyReqBody
} from './types/auth.types'
import { UserVerifyStatus } from '~/common/constants/enums'

//1. register controller
export const registerController = async (req: Request<ParamsDictionary, unknown, RegisterReqBody>, res: Response) => {
  const isEmailExist = await databaseServices.users.findOne({ email: req.body.email })
  if (isEmailExist) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.EMAIL_ALREADY_EXISTS,
      status: HTTP_STATUS.BAD_REQUEST
    })
  }
  const result = await authService.register(req.body)
  return res.status(HTTP_STATUS.CREATED).json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}
// 2. login controller
export const loginController = async (req: Request<ParamsDictionary, unknown, LoginReqBody>, res: Response) => {
  const result = await authService.login(req.body)

  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, unknown, RefreshTokenReqBody>,
  res: Response
) => {
  const { user_id, role } = req.decoded_refresh_token as TokenPayload
  const { refresh_token } = req.body
  const result = await authService.refreshToken({ user_id, refresh_token, role })
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, unknown, LogoutReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { refresh_token } = req.body
  await authService.logout({ user_id, refresh_token })
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.LOGOUT_SUCCESS
  })
}

export const emailVerifyController = async (
  req: Request<ParamsDictionary, unknown, EmailVerifyReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const email_verify_token =
    (req.body.email_verify_token as string) || (req.query.token as string) || (req.query.email_verify_token as string)

  await authService.checkEmailVerifyToken({ user_id, email_verify_token })
  const result = await authService.verifyEmail(user_id)

  if (req.method === 'GET') {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verified - TechGear</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
          <style>
              body { font-family: 'Inter', sans-serif; background-color: #f4f7f6; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
              .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); text-align: center; max-width: 400px; }
              .icon { font-size: 64px; color: #10b981; margin-bottom: 20px; }
              h1 { color: #1f2937; margin: 0 0 10px; font-size: 24px; }
              p { color: #6b7280; line-height: 1.5; margin: 0 0 25px; }
              .btn { background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; transition: background 0.2s; }
              .btn:hover { background-color: #2563eb; }
          </style>
      </head>
      <body>
          <div class="card">
              <div class="icon">✅</div>
              <h1>Email Verified!</h1>
              <p>${USERS_MESSAGES.EMAIL_VERIFY_SUCCESS}</p>
              <p>You can now close this window and return to the application.</p>
              <a href="postman://open" class="btn">Return to App</a>
          </div>
      </body>
      </html>
    `)
  }

  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const verifyForgotPasswordTokenController = async (
  _req: Request<ParamsDictionary, unknown, unknown>,
  res: Response
) => {
  // Logic verify done in middleware
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, unknown, ForgotPasswordReqBody>,
  res: Response
) => {
  const result = await authService.forgotPassword(req.body)
  return res.status(HTTP_STATUS.OK).json(result)
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, unknown, ResetPasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password, forgot_password_token } = req.body
  const result = await authService.resetPassword({ user_id, password, forgot_password_token })
  return res.status(HTTP_STATUS.OK).json(result)
}

export const resendEmailVerifyController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const verifyStatus = await authService.getUserStatus(user_id)
  if (verifyStatus === UserVerifyStatus.Verified) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_VERIFIED
    })
  } else if (verifyStatus === UserVerifyStatus.Banned) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: USERS_MESSAGES.ACCOUNT_HAS_BEEN_BANNED
    })
  } else {
    const result = await authService.resendEmailVerify(user_id)
    return res.status(HTTP_STATUS.OK).json(result)
  }
}
