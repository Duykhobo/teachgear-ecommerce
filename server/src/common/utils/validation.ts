import { NextFunction, Request, Response } from 'express'
import { ZodError, ZodTypeAny } from 'zod' // Sử dụng ZodTypeAny
import { EntityError } from '~/common/models/Errors'

// Thay AnyZodObject bằng ZodTypeAny để chấp nhận mọi loại Zod Schema
export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // 1. Chạy parse dữ liệu
      const result = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers
      })
      Object.assign(req, result)

      return next()
    } catch (error) {
      if (error instanceof ZodError) {
        const entityError = new EntityError({ errors: {} })
        for (const issue of error.issues) {
          const key = issue.path[issue.path.length - 1] as string
          const message = issue.message

          entityError.errors[key] = {
            msg: message
          }
        }
        return next(entityError)
      }

      next(error)
    }
  }
}
