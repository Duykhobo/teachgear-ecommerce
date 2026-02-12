import { NextFunction, Request, RequestHandler, Response } from 'express'

// P: Params, ResBody: Response Body, ReqBody: Request Body, ReqQuery: Request Query
export const wrapAsync = <P = any, ResBody = any, ReqBody = any, ReqQuery = any>(
  func: RequestHandler<P, ResBody, ReqBody, ReqQuery>
) => {
  return async (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (err) {
      next(err)
    }
  }
}
