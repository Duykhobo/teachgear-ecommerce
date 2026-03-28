import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { ErrorWithStatus } from '~/common/models/Errors'
import logger from '~/common/utils/logger'

import { ZodError } from 'zod'
import { formatZodErrors } from '~/common/utils/zod'

export const defaultErrorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  // 1. Handle Zod Validation Errors (422)
  if (err instanceof ZodError) {
    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      message: 'Validation failed',
      errors: formatZodErrors(err)
    })
  }

  // 2. Handle JSON parse errors from express.json() (400)
  if (err instanceof SyntaxError && 'body' in err && (err as any).type === 'entity.parse.failed') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: 'Invalid JSON format. Please check your request body for missing quotes or syntax errors.',
      errorInfor: omit(err, ['stack'])
    })
  }

  // 3. Chuẩn hóa các thuộc tính của Error để có thể lấy được các key ẩn
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })

  // 4. Xác định HTTP Status Code
  const status = err instanceof ErrorWithStatus ? err.status : HTTP_STATUS.INTERNAL_SERVER_ERROR

  // 5. Ghi Log ra hệ thống
  if (status >= 500) {
    logger.error(`[SERVER ERROR] ${err.message}`, {
      status,
      stack: err.stack,
      method: _req.method,
      url: _req.originalUrl,
      body: _req.body
    })
  } else {
    logger.warn(`[CLIENT ERROR] ${err.message}`, {
      status,
      method: _req.method,
      url: _req.originalUrl
    })
  }

  // 6. Trả Response về cho Client
  if (err instanceof ErrorWithStatus) {
    return res.status(status).json(omit(err, ['status']))
  }

  return res.status(status).json({
    message: err.message,
    errorInfor: omit(err, ['stack']) // Ẩn stack trace ở môi trường thực tế
  })
}
