import { NextFunction, Request, RequestHandler, Response } from 'express'

// P: Params, ResBody: Response Body, ReqBody: Request Body, ReqQuery: Request Query
export const wrapAsync = (...funcs: RequestHandler[]) => {
  return funcs.map((func) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await func(req, res, next)
      } catch (err) {
        next(err) // Chuyển lỗi xuống error handler
      }
    }
  })
}
