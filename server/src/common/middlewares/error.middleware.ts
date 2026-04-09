import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { ErrorWithStatus } from '~/common/models/Errors'
import logger from '~/common/utils/logger'

import { ZodError } from 'zod'
import { formatZodErrors } from '~/common/utils/zod'

export const defaultErrorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  // 1. Handle Zod Validation Errors (422)
  if (err instanceof ZodError) {
    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      message: 'Validation failed',
      errors: formatZodErrors(err)
    })
  }

  // 2. Handle Custom ErrorWithStatus or generic Error
  const status = err instanceof ErrorWithStatus ? err.status : HTTP_STATUS.INTERNAL_SERVER_ERROR
  const message = err instanceof Error ? err.message : 'Internal Server Error'

  // 3. Log errors
  if (status >= 500) {
    logger.error(`[SERVER ERROR] ${message}`, {
      status,
      stack: err instanceof Error ? err.stack : undefined,
      method: _req.method,
      url: _req.originalUrl,
      body: _req.body
    })
  } else {
    logger.warn(`[CLIENT ERROR] ${message}`, {
      status,
      method: _req.method,
      url: _req.originalUrl
    })
  }

  // 4. Send Response
  if (err instanceof ErrorWithStatus) {
    return res.status(status).json(omit(err, ['status']))
  }

  return res.status(status).json({
    message,
    errorInfor: err instanceof Error ? omit(err, ['stack']) : err
  })
}
