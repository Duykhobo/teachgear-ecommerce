import { Request, Response, NextFunction } from 'express'
import { PaginationQuerySchema } from './schemas/product.validation'
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
  // Use res.locals instead of req.query for Express 5 compatibility
  ;(req as { parsedQuery?: unknown } & Request).parsedQuery = result.data
  next()
}
