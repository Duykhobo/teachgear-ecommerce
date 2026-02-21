import { Request, Response, NextFunction } from 'express'
import { PaginationQuerySchema } from './products.schema'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { ErrorWithStatus } from '~/common/models/Errors'

export const paginationValidator = (req: Request, _res: Response, next: NextFunction) => {
  const result = PaginationQuerySchema.safeParse(req.query)
  if (!result.success) {
    return next(
      new ErrorWithStatus({
        message: result.error.issues[0].message,
        status: HTTP_STATUS.BAD_REQUEST
      })
    )
  }
  req.query = result.data as any
  next()
}
