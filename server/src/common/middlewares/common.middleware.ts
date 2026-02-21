import { Response, Request, NextFunction } from 'express'
import { pick } from 'lodash'
import { USER_ROLE } from '~/common/constants/enums'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { ErrorWithStatus } from '~/common/models/Errors'
import { TokenPayload } from '~/modules/auth/auth.schema'
import { USERS_MESSAGES } from '../constants/messages'

//ta đang dùng generic để khi dùng hàm filterMiddleware nó sẽ nhắc ta nên bỏ property nào vào mảng
//FilterKeys là mảng các key của object T nào đó
type FilterKeys<T> = Array<keyof T>

export const filterMiddleware =
  <T>(filterKey: FilterKeys<T>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKey)
    next()
  }

export const adminMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const decodedToken = (req as Request).decoded_authorization as TokenPayload
  if (!decodedToken) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.UNAUTHORIZED,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    )
  }
  if (decodedToken.role !== USER_ROLE.Admin) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.FORBIDDEN,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}
