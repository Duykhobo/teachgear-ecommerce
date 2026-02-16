import { NextFunction, Request, Response } from 'express'
import { USERS_MESSAGES } from '~/common/constants/messages'
import { ErrorWithStatus } from '~/common/models/Errors'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { verifyToken } from '~/common/utils/jwt'
import { envConfig } from '~/common/configs/configs'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { ParamsDictionary } from 'express-serve-static-core'
import { RefreshTokenSchema } from '~/modules/auth/auth.schema'
import { validate } from '~/common/utils/validation'

export const accessTokenValidator = async (
  req: Request<ParamsDictionary, any, any>,
  _res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers

  if (!authorization?.trim()) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }

  try {
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
export const refreshTokenValidator = validate(RefreshTokenSchema)

