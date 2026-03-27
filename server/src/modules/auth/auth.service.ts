import { signToken } from '~/common/utils/jwt'
import databaseServices from '~/common/services/database.service'
import { TokenType, USER_ROLE, UserVerifyStatus } from '~/common/constants/enums'
import ms from 'ms'
import { ForgotPasswordReqBody, LoginReqBody, RegisterReqBody } from '~/modules/auth/auth.schema'
import { ObjectId } from 'mongodb'
import User from '~/modules/users/users.schema'
import { comparePassword, hashPassword } from '~/common/utils/crypto'
// import RefreshToken from '~/modules/auth/auth.schema'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { USERS_MESSAGES } from '~/common/constants/messages'
import { ErrorWithStatus } from '~/common/models/Errors'
import { envConfig } from '~/common/configs/configs'
import { enqueueEmailJob } from '~/common/queues/email.queue'

class AuthService {
  private signAccessToken(user_id: string, role: number) {
    return signToken({
      privateKey: envConfig.JWT_SECRET_ACCESS_TOKEN as string,
      payload: { user_id, token_type: TokenType.AccessToken, role },
      options: {
        expiresIn: envConfig.ACCESS_TOKEN_EXPIRE_IN as ms.StringValue
      }
    })
  }
  private signRefreshToken(user_id: string, role: number) {
    return signToken({
      privateKey: envConfig.JWT_SECRET_REFRESH_TOKEN as string,
      payload: { user_id, token_type: TokenType.RefreshToken, role },
      options: {
        expiresIn: envConfig.REFRESH_TOKEN_EXPIRE_IN as ms.StringValue
      }
    })
  }

  private signAccessAndRefreshToken(user_id: string, role: number) {
    return Promise.all([this.signAccessToken(user_id, role), this.signRefreshToken(user_id, role)])
  }

  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerificationToken
      },
      options: { expiresIn: envConfig.EMAIL_VERIFY_TOKEN_EXPIRE_IN as ms.StringValue },
      privateKey: envConfig.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
    })
  }

  //method tạo forgot password token
  private signForgotPasswordToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPasswordToken },
      options: { expiresIn: envConfig.FORGOT_PASSWORD_TOKEN_EXPIRE_IN as ms.StringValue },
      privateKey: envConfig.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
    })
  }
  async checkExistEmail(email: string): Promise<boolean> {
    const user = await databaseServices.users.findOne({ email })
    return Boolean(user)
  }

  async register(payload: RegisterReqBody): Promise<{
    access_token: string
    refresh_token: string
  }> {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
    await databaseServices.users.insertOne(
      new User({
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: await hashPassword(payload.password),
        name: payload.name,
        email: payload.email
      })
    )
    const role = USER_ROLE.User
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id.toString(), role)
    await databaseServices.refreshTokens.updateOne(
      { token: refresh_token },
      {
        $set: {
          user_id: new ObjectId(user_id.toString()),
          token: refresh_token,
          created_at: new Date()
        }
      },
      { upsert: true }
    )
    await enqueueEmailJob({
      type: 'verify-email',
      to: payload.email,
      token: email_verify_token
    })

    return {
      access_token,
      refresh_token
    }
  }

  async checkEmailVerifyToken({ user_id, email_verify_token }: { user_id: string; email_verify_token: string }) {
    const result = await databaseServices.users.findOne({
      _id: new ObjectId(user_id),
      email_verify_token
    })
    if (!result) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return result
  }

  async login(payload: LoginReqBody) {
    const email = payload.email.trim()
    const password = payload.password.trim()
    const user = await databaseServices.users.findOne({ email })
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.EMAIL_NOT_FOUND,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }
    const isMatch = await comparePassword(password, user.password)
    if (!isMatch) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }
    const user_id = user._id.toString()
    const role = user.role
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id, role)
    
    // Sử dụng updateOne với upsert: true để tránh lỗi 11000 (duplicate key) 
    // nếu login quá nhanh trong cùng 1 giây dẫn đến trùng token iat.
    await databaseServices.refreshTokens.updateOne(
      { token: refresh_token },
      {
        $set: {
          user_id: new ObjectId(user_id),
          token: refresh_token,
          created_at: new Date()
        }
      },
      { upsert: true }
    )
    return {
      access_token,
      refresh_token
    }
  }
  async refreshToken({ user_id, refresh_token, role }: { user_id: string; refresh_token: string; role: number }) {
    // 2. Check DB
    const refreshToken = await databaseServices.refreshTokens.findOne({ token: refresh_token })
    if (!refreshToken) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.REFRESH_TOKEN_IS_USED_OR_NOT_EXIST,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }

    // 3. Xoay vòng token
    const [new_access_token, new_refresh_token] = await this.signAccessAndRefreshToken(user_id, role)
    await databaseServices.refreshTokens.deleteOne({ token: refresh_token })
    await databaseServices.refreshTokens.updateOne(
      { token: new_refresh_token },
      {
        $set: {
          user_id: new ObjectId(user_id),
          token: new_refresh_token,
          created_at: new Date()
        }
      },
      { upsert: true }
    )
    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token
    }
  }

  async logout({ user_id, refresh_token }: { user_id: string; refresh_token: string }) {
    // Optional: Verify refresh_token again if strictness is needed,
    // but at minimum check existence and ownership
    const tokenDoc = await databaseServices.refreshTokens.findOne({ token: refresh_token })
    if (!tokenDoc) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.REFRESH_TOKEN_IS_USED_OR_NOT_EXIST,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }
    // ownership check
    if (tokenDoc.user_id.toString() !== user_id) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }
    await databaseServices.refreshTokens.deleteOne({ token: refresh_token })
    return true
  }

  async checkRefreshToken({ user_id, refresh_token }: { user_id: string; refresh_token: string }) {
    const result = await databaseServices.refreshTokens.findOne({
      user_id: new ObjectId(user_id),
      token: refresh_token
    })
    if (!result) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }
    return result
  }

  async getUserStatus(user_id: string) {
    const user = await databaseServices.users.findOne({ _id: new ObjectId(user_id) })
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return user.verify
  }

  async forgotPassword(payload: ForgotPasswordReqBody) {
    const user = await databaseServices.users.findOne({ email: payload.email })
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const forgot_password_token = await this.signForgotPasswordToken(user._id.toString())
    await databaseServices.users.updateOne(
      { _id: user._id },
      {
        $set: {
          forgot_password_token
        },
        $currentDate: { updated_at: true }
      }
    )
    await enqueueEmailJob({
      type: 'forgot-password',
      to: payload.email,
      token: forgot_password_token
    })
    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }

  async resetPassword({
    user_id,
    password,
    forgot_password_token
  }: {
    user_id: string
    password: string
    forgot_password_token: string
  }) {
    const user = await databaseServices.users.findOne({
      _id: new ObjectId(user_id),
      forgot_password_token: forgot_password_token
    })
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    await databaseServices.users.updateOne(
      { _id: user._id },
      {
        $set: {
          password: await hashPassword(password)
        },
        $unset: {
          forgot_password_token: ''
        },
        $currentDate: { updated_at: true }
      }
    )
    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }
  async verifyEmail(user_id: string) {
    const user = await databaseServices.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          verify: UserVerifyStatus.Verified
        },
        $unset: {
          email_verify_token: ''
        },
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const role = user.role
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id, role)
    await databaseServices.refreshTokens.updateOne(
      { token: refresh_token },
      {
        $set: {
          user_id: new ObjectId(user_id),
          token: refresh_token,
          created_at: new Date()
        }
      },
      { upsert: true }
    )
    return {
      access_token,
      refresh_token
    }
  }
  async resendEmailVerify(user_id: string) {
    const user = await databaseServices.users.findOne({ _id: new ObjectId(user_id) })
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    if (user.verify === UserVerifyStatus.Verified) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.EMAIL_HAS_BEEN_VERIFIED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    const email_verify_token = await this.signEmailVerifyToken(user_id)
    await databaseServices.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          email_verify_token,
          updated_at: '$$NOW'
        }
      }
    ])
    await enqueueEmailJob({
      type: 'verify-email',
      to: user.email,
      token: email_verify_token
    })
    return {
      message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }
}

const authService = new AuthService()
export default authService
