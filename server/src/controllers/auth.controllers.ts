import { RegisterReqBody } from '~/models/requests/auth.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import databaseServices from '~/services/database.services'
import { ErrorWithStatus } from '~/models/Errors'
import { USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import authService from '~/services/auth.services'

//1. register controller
export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const isEmailExist = await databaseServices.users.findOne({ email: req.body.email })
  if (isEmailExist) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.EMAIL_ALREADY_EXISTS,
      status: HTTP_STATUS.BAD_REQUEST
    })
  }
  const result = await authService.register(req.body)
  return res.status(HTTP_STATUS.CREATED).json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}
