import { NextFunction, Request, RequestHandler, Response } from 'express'

// P: Params, ResBody: Response Body, ReqBody: Request Body, ReqQuery: Request Query
export const wrapAsync = <
  P = unknown,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = unknown,
  Locals extends Record<string, unknown> = Record<string, unknown>
>(
  func: RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>
) => {
  return async (
    req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
    res: Response<ResBody, Locals>,
    next: NextFunction
  ) => {
    try {
      await func(req, res, next)
    } catch (err) {
      next(err) // Chuyển lỗi xuống error handler
    }
  }
}
