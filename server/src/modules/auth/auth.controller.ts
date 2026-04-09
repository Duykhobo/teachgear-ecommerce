import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import databaseServices from '~/common/services/database.service'
import { ErrorWithStatus } from '~/common/models/Errors'
import { USERS_MESSAGES } from '~/common/constants/messages'
import HTTP_STATUS from '~/common/constants/httpStatus'
import authService from '~/modules/auth/auth.service'
import { envConfig } from '~/common/configs/configs'
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

  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const emailVerifyGetController = async (req: Request<ParamsDictionary, unknown, unknown>, res: Response) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const email_verify_token = req.query.token as string
  await authService.checkEmailVerifyToken({ user_id, email_verify_token })
  await authService.verifyEmail(user_id)
  return res.redirect(`${envConfig.CLIENT_URL || 'http://localhost:5173'}/login?status=success`)
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
