import { NextFunction, Request, Response } from 'express'
import { UserVerifyStatus } from '~/common/constants/enums'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { USERS_MESSAGES } from '~/common/constants/messages'
import { ErrorWithStatus } from '~/common/models/Errors'
import { validate } from '~/common/utils/validation'
import { TokenPayload } from '~/modules/auth/auth.schema'

import {
  AddToCartSchema,
  ChangePasswordSchema,
  UpdateMeSchema,
  UpdateCartReqBodySchema
} from '~/modules/users/users.schema'

export const addToCartValidator = validate(AddToCartSchema)
export const updateCartValidator = validate(UpdateCartReqBodySchema)
export const updateMeValidator = validate(UpdateMeSchema)
export const changePasswordValidator = validate(ChangePasswordSchema)

export const verifiedUserValidator = (req: Request, _res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization as TokenPayload
  if (verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}
