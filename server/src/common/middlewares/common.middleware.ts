import { Response, Request, NextFunction } from 'express'
import { pick } from 'lodash'
import { USER_ROLE } from '~/common/constants/enums'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { ErrorWithStatus } from '~/common/models/Errors'
import { TokenPayload } from '~/modules/auth/auth.schema'

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
  const { role } = (req as Request).decoded_authorization as TokenPayload
  if (role !== USER_ROLE.Admin) {
    return next(
      new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: 'Forbidden: Admin access required'
      })
    )
  }
  next()
}
