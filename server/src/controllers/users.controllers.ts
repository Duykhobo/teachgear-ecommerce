import { Request, Response, NextFunction } from 'express'
import usersServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  ChangePasswordReqBody,
  EmailVerifyReqQuery,
  ForgotPasswordReqBody,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  UpdateMeReqBody,
  VerifyForgotPasswordTokenReqBody
} from '~/models/requests/user.requests'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { UserVerifyStatus } from '~/constants/enums'
import usersService from '~/services/users.services'
import { pick } from 'lodash'
//1. login controller
export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const { email, password } = req.body
  const result = await usersServices.login(email, password)
  return res.status(200).json({
    message: 'Login success',
    result: result
  })
}

//2. register controller
export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const isEmailExist = await usersServices.checkEmailExist(req.body.email)
  if (isEmailExist) {
    throw new ErrorWithStatus({
      message: 'Email is already exist',
      status: HTTP_STATUS.UNPROCESSABLE_ENTITY
    })
  }
  //  - tạo user trên database
  const result = await usersServices.register(req.body)
  //response đóng gói kết quả
  return res.status(200).json({
    message: 'Register success',
    result: result
  })
}

//3. logout controller
export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { user_id: user_id_ac } = req.decoded_authorization as TokenPayload
  const { user_id: user_id_rf } = req.decoded_refresh_token as TokenPayload
  if (user_id_ac !== user_id_rf) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  await usersServices.checkRefreshToken({ user_id: user_id_rf, refresh_token: req.body.refresh_token })
  await usersServices.logout(req.body.refresh_token)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.LOGOUT_SUCCESS
  })
}
//4. email verify controller
export const emailVerifyController = async (
  req: Request<ParamsDictionary, any, any, EmailVerifyReqQuery>,
  res: Response
) => {
  const { email_verify_token } = req.query //query chưa đc định nghĩa, ta sẽ định nghĩa
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  //kiểm tra email_verify_token này còn tồn tại trong user tìm đc qua user_id không
  await usersServices.checkEmailVerifyToken({ user_id, email_verify_token })
  //nếu không còn thì nói rằng nó đã được verify từ trước rồi
  await usersServices.verifyEmail(user_id)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS
  })
}

// 5. resend email verify controller
export const resendEmailVerifyController = async (req: Request, res: Response) => {
  //vì trước đó kiểm tra access_token nên chắc chắn đã verify jwt đó nên có decoded_authorization
  const { user_id } = req.decoded_authorization as TokenPayload
  //hàm findUserById: dùng user_id để tìm user | hàm chưa viết
  const verifyStatus = await usersService.getUserVerifyStatus(user_id)
  //nếu đã verify rồi thì thông báo rồi
  if (verifyStatus === UserVerifyStatus.Verified) {
    return res.status(200).json({
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_VERIFIED
    })
  }
  //nếu chưa verify thì tiến hành gữi lại email verify
  if (verifyStatus === UserVerifyStatus.Unverified) {
    const result = await usersService.resendEmailVerify(user_id)
    return res.status(200).json(result)
  }

  //nếu user bị banned thì thông báo bị banned
  if (verifyStatus === UserVerifyStatus.Banned) {
    return res.status(403).json({
      message: USERS_MESSAGES.ACCOUNT_HAS_BEEN_BANNED
    })
  }
}

// 6. forgot password controller
export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
) => {
  const { email } = req.body
  const hasUser = await usersService.checkEmailExist(email)
  if (!hasUser) {
    //nếu không có user nào từ email này thì thông báo lỗi
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  } else {
    //nếu có thì tạo forgot_password_token và gữi email cho người dùng
    const result = await usersService.forgotPassword(email)
    return res.status(HTTP_STATUS.OK).json(result)
  }
}

// 7. verify forgot password token controller
export const verifyForgotPasswordTokenController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordTokenReqBody>,
  res: Response
) => {
  //lấy user_id từ req.decoded_forgot_password_token và forgot_password_token từ req.body
  const { forgot_password_token } = req.body
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const verifyStatus = await usersService.getUserVerifyStatus(user_id)
  const user_forgot_passwordt_token = await usersService.getUserForgotPasswordToken(user_id)
  //account có bị banned không
  if (verifyStatus === UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.ACCOUNT_HAS_BEEN_BANNED,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  //kiểm tra xem forgot_password_token này có đúng với user này không
  if (user_forgot_passwordt_token !== forgot_password_token) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_NOT_MATCH,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  //nếu đúng thì trả về thông báo cho FE
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}

//8. reset password controller
export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  //[giống flow của verifyForgotPasswordTokenController]
  //lấy user_id từ req.decoded_forgot_password_token và forgot_password_token từ req.body
  const { forgot_password_token } = req.body
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const verifyStatus = await usersService.getUserVerifyStatus(user_id)
  const user_forgot_passwordt_token = await usersService.getUserForgotPasswordToken(user_id)
  //account có bị banned không
  if (verifyStatus === UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.ACCOUNT_HAS_BEEN_BANNED,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  //kiểm tra xem forgot_password_token này có đúng với user này không
  if (user_forgot_passwordt_token !== forgot_password_token) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_NOT_MATCH,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  //[thêm khúc này]nếu đúng thì vào database cập nhật thông tin cho user
  const { password } = req.body
  await usersService.resetPassword(user_id, password)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
  })
}

//9. get me controller
export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  //thông qua user_id để kiếm user trong database và nhớ giấu những thông tin nhạy cảm
  const { user_id } = req.decoded_authorization as TokenPayload
  const userInfo = await usersService.getMe(user_id)
  return res.json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result: userInfo
  })
}

//
export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>,
  res: Response,
  next: NextFunction
) => {
  //middleware accessTokenValidator đã chạy rồi, nên ta có thể lấy đc user_id từ decoded_authorization
  const { user_id } = req.decoded_authorization as TokenPayload
  //user_id để biết phải cập nhật ai
  //lấy thông tin mới từ req.body
  const req_body = pick(req.body, [
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'avatar',
    'username',
    'cover_photo'
  ])
  //user_id để biết phải cập nhật ai
  const user = await usersService.findUserById(user_id)
  //kiểm tra user đã verify email chưa, nếu chưa thì không cho cập nhật
  if (user.verify === UserVerifyStatus.Unverified) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_VERIFIED,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  //bị banned thì cũng không cho cập nhật
  if (user.verify === UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.ACCOUNT_HAS_BEEN_BANNED,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  //lấy thông tin mới từ req.body
  const { body } = req
  //lấy các property mà client muốn cập nhật
  //ta sẽ viết hàm updateMe trong user.services
  //nhận vào user_id và body để cập nhật
  const result = await usersService.updateMe(user_id, req_body)
  return res.json({
    message: USERS_MESSAGES.UPDATE_PROFILE_SUCCESS, //meesage.ts thêm  UPDATE_ME_SUCCESS: 'Update me success'
    result
  })
}

//10. change password controller
export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload //lấy user_id từ decoded_authorization của access_token
  const { password, old_password } = req.body //lấy old_password và password từ req.body
  //kiểm tra xem old_password có đúng với password có trong database không trong db không
  //vừa tìm vừa update nếu có
  const result = await usersService.changePassword({
    user_id,
    old_password,
    password
  }) //chưa code changePassword
  return res.json(result)
}

//11. refresh token controller
export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response,
  next: NextFunction
) => {
  // khi qua middleware refreshTokenValidator thì ta đã có decoded_refresh_token
  //chứa user_id và token_type
  //ta sẽ lấy user_id để tạo ra access_token và refresh_token mới
  const { user_id } = req.decoded_refresh_token as TokenPayload //lấy refresh_token từ req.body
  const { refresh_token } = req.body
  const isRefreshTokenValid = await usersService.checkRefreshToken({
    user_id,
    refresh_token
  })
  if (!isRefreshTokenValid) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  const result = await usersService.refreshToken(user_id, refresh_token) //refreshToken chưa code
  return res.json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS, //message.ts thêm  REFRESH_TOKEN_SUCCESS: 'Refresh token success',
    result
  })
}
