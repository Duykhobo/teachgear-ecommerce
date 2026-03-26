import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { USERS_MESSAGES } from '~/common/constants/messages'
import { ErrorWithStatus } from '~/common/models/Errors'
import databaseServices from '~/common/services/database.service'
import { UpdateMeReqBody } from '~/modules/users/users.schema'

// Gợi ý khung code
class UsersService {
  async findUserById(user_id: string) {
    const user = await databaseServices.users.findOne({
      _id: new ObjectId(user_id)
    })
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return user
  }

  // 5. Get current user profile (strip sensitive fields)
  async getMe(user_id: string) {
    const user = await databaseServices.users.findOne(
      { _id: new ObjectId(user_id) },
      { projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } }
    )
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return user
  }

  // 6. Update current user profile
  async updateMe(user_id: string, payload: UpdateMeReqBody) {
    const { date_of_birth, ...rest } = payload
    const updatedUser = await databaseServices.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          ...rest,
          ...(date_of_birth ? { date_of_birth: new Date(date_of_birth) } : {}),
          updated_at: new Date()
        }
      },
      {
        returnDocument: 'after',
        projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 }
      }
    )
    if (!updatedUser) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return updatedUser
  }
}

const usersService = new UsersService()
export default usersService
