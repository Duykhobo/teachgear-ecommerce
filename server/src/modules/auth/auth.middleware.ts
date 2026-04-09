import { NextFunction, Request, Response } from 'express'
import { USERS_MESSAGES } from '~/common/constants/messages'
import { ErrorWithStatus } from '~/common/models/Errors'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { verifyToken } from '~/common/utils/jwt'
import { envConfig } from '~/common/configs/configs'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'

export const accessTokenValidator = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers

    if (!authorization?.trim()) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }

    const parts = authorization.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }

    const token = parts[1]
    const decoded_authorization = await verifyToken({
      token,
      privateKey: envConfig.JWT_SECRET_ACCESS_TOKEN as string
    })
    ;(req as Request).decoded_authorization = decoded_authorization
    next()
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      next(
        new ErrorWithStatus({
          message: capitalize(error.message),
          status: HTTP_STATUS.UNAUTHORIZED
        })
      )
    } else {
      next(error)
    }
  }
}

export const optionalAccessTokenValidator = async (req: Request, _res: Response, next: NextFunction) => {
  const { authorization } = req.headers
  if (!authorization) {
    return next()
  }

  try {
    const parts = authorization.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next() // Token sai định dạng thì coi như Guest
    }

    const token = parts[1]
    const decoded_authorization = await verifyToken({
      token,
      privateKey: envConfig.JWT_SECRET_ACCESS_TOKEN as string
    })
    ;(req as Request).decoded_authorization = decoded_authorization
    next()
  } catch {
    // Token lỗi (hết hạn, sai key) thì coi như Guest cho các route Optional
    next()
  }
}

export const refreshTokenValidator = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { refresh_token } = req.body

    if (!refresh_token) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }

    const decoded_refresh_token = await verifyToken({
      token: refresh_token,
      privateKey: envConfig.JWT_SECRET_REFRESH_TOKEN as string
    })
    ;(req as Request).decoded_refresh_token = decoded_refresh_token
    next()
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      next(
        new ErrorWithStatus({
          message: capitalize(error.message),
          status: HTTP_STATUS.UNAUTHORIZED
        })
      )
    } else {
      next(error)
    }
  }
}

export const emailVerifyTokenValidator = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const email_verify_token =
      (req.body?.email_verify_token as string) || (req.query.token as string) || (req.query.email_verify_token as string)

    if (!email_verify_token) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }

    const decoded_email_verify_token = await verifyToken({
      token: email_verify_token as string,
      privateKey: envConfig.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
    })
    ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
    next()
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      next(
        new ErrorWithStatus({
          message: capitalize(error.message),
          status: HTTP_STATUS.UNAUTHORIZED
        })
      )
    } else {
      next(error)
    }
  }
}

export const forgotPasswordTokenValidator = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { forgot_password_token } = req.body

    if (!forgot_password_token) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }

    const decoded_forgot_password_token = await verifyToken({
      token: forgot_password_token,
      privateKey: envConfig.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
    })
    ;(req as Request).decoded_forgot_password_token = decoded_forgot_password_token
    next()
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      next(
        new ErrorWithStatus({
          message: capitalize(error.message),
          status: HTTP_STATUS.UNAUTHORIZED
        })
      )
    } else {
      next(error)
    }
  }
}
