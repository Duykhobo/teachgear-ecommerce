import { NextFunction, Request, Response } from 'express'
import { ZodError, ZodTypeAny } from 'zod' // Sử dụng ZodTypeAny
import { EntityError } from '~/common/models/Errors'

// Thay AnyZodObject bằng ZodTypeAny để chấp nhận mọi loại Zod Schema
export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // 1. Chạy parse dữ liệu
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      })

      return next()
    } catch (error) {
      const entityError = new EntityError({ errors: {} })

      if (error instanceof ZodError) {
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
