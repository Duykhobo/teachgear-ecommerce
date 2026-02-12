import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { EntityError } from '~/models/Errors'

export const validate = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Chạy parse dữ liệu (Body, Query, Params)
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      })

      // Nếu không lỗi thì đi tiếp
      return next()
    } catch (error) {
      // 2. Khai báo EntityError để gom lỗi 422
      const entityError = new EntityError({ errors: {} })

      if (error instanceof ZodError) {
        // Duyệt qua từng lỗi mà Zod phát hiện được
        for (const issue of error.issues) {
          // Zod trả về path là một mảng, ví dụ: ["body", "email"]
          // Ta lấy phần tử thứ 2 làm key (tên field bị lỗi)
          const key = issue.path[1] as string
          const message = issue.message

          // Logic xử lý lỗi đặc biệt (giống đoạn bạn viết)
          // Nếu trong Zod refine/superRefine bạn quăng ra ErrorWithStatus (401, 403...)
          if (message.includes('STATUS:') || (issue as any).params?.isCustomError) {
            // Lưu ý: Với Zod, việc check msg instanceof ErrorWithStatus hơi khác một chút
            // Thường ta sẽ xử lý custom error trong catch này
          }

          entityError.errors[key] = {
            msg: message
          }
        }
        return next(entityError)
      }

      // Nếu là lỗi khác (không phải ZodError) thì quăng tiếp cho Error Handler
      next(error)
    }
  }
}
