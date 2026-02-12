import { signToken } from '~/utils/jwt'
import databaseServices from './database.services'
import { TokenType } from '~/constants/enums'
import ms from 'ms'
import { RegisterReqBody } from '~/models/requests/auth.requests'
import { ObjectId } from 'mongodb'
import User from '~/models/schemas/user.schemas'
import { comparePassword, hashPassword } from '~/utils/crypto'
import RefreshToken from '~/models/schemas/requestToken.schemas'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { envConfig } from '~/configs/configs'

class AuthService {
  private signAccessToken(user_id: string) {
    return signToken({
      privateKey: envConfig.JWT_SECRET_ACCESS_TOKEN as string,
      payload: { user_id, token_type: TokenType.AccessToken },
      options: {
        expiresIn: envConfig.ACCESS_TOKEN_EXPIRE_IN as ms.StringValue
      }
    })
  }
  private signRefreshToken(user_id: string) {
    return signToken({
      privateKey: envConfig.JWT_SECRET_REFRESH_TOKEN as string,
      payload: { user_id, token_type: TokenType.RefreshToken },
      options: {
        expiresIn: envConfig.REFRESH_TOKEN_EXPIRE_IN as ms.StringValue
      }
    })
  }

  private signAccessAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
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
      privateKey: envConfig.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string //thêm
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
        ...payload,
        _id: user_id,
        email_verify_token,
        username: `user_${user_id.toString().slice(-4)}`,
        date_of_birth: new Date(payload.date_of_birth),
        password: await hashPassword(payload.password)
      })
    )
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id.toString())
    await databaseServices.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id.toString()),
        token: refresh_token
      })
    )
    // TODO: Gửi email thật ở đây (Sẽ làm ở bài Mail Service)
    console.log(`Link xác thực: ${envConfig.CLIENT_URL}/verify-email?token=${email_verify_token}`)
    return {
      access_token,
      refresh_token
    }
  }

  async checkEmailVerifyToken({ user_id, email_verify_token }: { user_id: string; email_verify_token: string }) {
    const user = await databaseServices.users.findOne({
      email_verify_token,
      _id: new ObjectId(user_id)
    })
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_INVALID,
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY
      })
    }
    return user
  }

  async login(email: string, password: string) {
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
        message: USERS_MESSAGES.PASSWORD_IS_INCORRECT,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }
    const user_id = user._id.toString()
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
    await databaseServices.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    return {
      access_token,
      refresh_token
    }
  }
}

const authService = new AuthService()
export default authService
