import { NextFunction, Request, Response } from 'express'
import { USERS_MESSAGES } from '~/common/constants/messages'
import { ErrorWithStatus } from '~/common/models/Errors'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { verifyToken } from '~/common/utils/jwt'
import { envConfig } from '~/common/configs/configs'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import databaseServices from '~/common/services/database.service'
import { ParamsDictionary } from 'express-serve-static-core'
import { LogoutReqBody } from '~/modules/auth/auth.interface'

export const accessTokenValidator = async (req: Request, _res: Response, next: NextFunction) => {
  const { authorization } = req.headers

  // 1. Check tồn tại và format cơ bản
  if (!authorization?.trim()) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }

  try {
    // 2. Tách token an toàn hơn
    const parts = authorization.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED, // Hoặc định nghĩa INVALID_TOKEN_FORMAT
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }

    const token = parts[1]
    const decoded_authorization = await verifyToken({
      token,
      privateKey: envConfig.JWT_SECRET_ACCESS_TOKEN as string
    })
    ;(req as any).decoded_authorization = decoded_authorization
    next()
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new ErrorWithStatus({
        message: capitalize(error.message),
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }
    next(error)
  }
}

export const refreshTokenValidator = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  _res: Response,
  next: NextFunction
) => {
  const { refresh_token } = req.body
  if (!refresh_token) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }

  try {
    const [decoded_refresh_token, refreshToken] = await Promise.all([
      verifyToken({ token: refresh_token, privateKey: envConfig.JWT_SECRET_REFRESH_TOKEN as string }),
      databaseServices.refreshTokens.findOne({ token: refresh_token })
    ])

    if (decoded_refresh_token === null) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }
    if (refreshToken === null) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.REFRESH_TOKEN_IS_USED_OR_NOT_EXIST,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }

    ;(req as Request).decoded_refresh_token = decoded_refresh_token
    next()
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new ErrorWithStatus({
        message: capitalize(error.message),
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }
    next(error)
  }
}
