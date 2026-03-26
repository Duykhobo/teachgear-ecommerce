import { NextFunction, Request, Response } from 'express'
import { UpdateMeReqBody } from '~/modules/users/users.schema'

import usersService from '~/modules/users/users.service'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { USERS_MESSAGES } from '~/common/constants/messages'
import { TokenPayload } from '~/modules/auth/auth.schema'



// 1. Get current user profile Controller
export const getMeController = async (req: Request, res: Response, _next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await usersService.getMe(user_id)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result
  })
}

// 2. Update current user profile Controller
export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>,
  res: Response,
  _next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await usersService.updateMe(user_id, req.body)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
    result
  })
}
