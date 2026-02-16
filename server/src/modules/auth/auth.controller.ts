import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import databaseServices from '~/common/services/database.service'
import { ErrorWithStatus } from '~/common/models/Errors'
import { USERS_MESSAGES } from '~/common/constants/messages'
import HTTP_STATUS from '~/common/constants/httpStatus'
import authService from '~/modules/auth/auth.service'
import { LoginInput, LogoutInput, RegisterInput } from '~/modules/auth/auth.schema'
import { TokenPayload } from '~/modules/auth/auth.interface'

//1. register controller
export const registerController = async (req: Request<ParamsDictionary, any, RegisterInput>, res: Response) => {
  const isEmailExist = await databaseServices.users.findOne({ email: req.body.email })
  if (isEmailExist) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.EMAIL_ALREADY_EXISTS,
      status: HTTP_STATUS.BAD_REQUEST
    })
  }
  const result = await authService.register(req.body)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}
// 2. login controller
export const loginController = async (req: Request<ParamsDictionary, any, LoginInput>, res: Response) => {
  const { email, password } = req.body
  const result = await authService.login(email, password)

  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutInput>, res: Response) => {
  const { user_id: user_id_ac } = req.decoded_authorization as TokenPayload
  const { user_id: user_id_rf } = req.decoded_refresh_token as TokenPayload
  if (user_id_ac !== user_id_rf) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  await authService.checkRefreshToken({ user_id: user_id_rf, refresh_token: req.body.refresh_token })
  await authService.logout(req.body.refresh_token)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.LOGOUT_SUCCESS
  })
}
