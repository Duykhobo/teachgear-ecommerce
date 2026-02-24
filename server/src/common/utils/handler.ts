import { NextFunction, Request, RequestHandler, Response } from 'express'

// P: Params, ResBody: Response Body, ReqBody: Request Body, ReqQuery: Request Query
export const wrapAsync = <
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
  Locals extends Record<string, any> = Record<string, any>
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
