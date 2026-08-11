import request from 'supertest'
import app from '../src/index'
import databaseServices from '../src/common/services/database.service'
import { USER_ROLE } from '../src/common/constants/enums'
import { ObjectId } from 'mongodb'
import { signToken } from '../src/common/utils/jwt'
import { envConfig } from '../src/common/configs/configs'
import { hashPassword } from '../src/common/utils/crypto'
import ms from 'ms'

describe('Users Flow Integration Tests', () => {
  let userToken = ''
  let userId = new ObjectId()
  const plainPassword = 'OldPassword123!'

  beforeEach(async () => {
    // Tạo 1 User hợp lệ
    const hashedPassword = await hashPassword(plainPassword)
    await databaseServices.users.insertOne({
      _id: userId,
      name: 'Old Name',
      email: `user_${Date.now()}@example.com`,
      password: hashedPassword,
      role: USER_ROLE.User,
      verify: 1,
      date_of_birth: new Date('1990-01-01'),
      created_at: new Date(),
      updated_at: new Date()
    } as any)

    userToken = await signToken({
      payload: { user_id: userId.toString(), role: USER_ROLE.User, verify: 1 },
      privateKey: envConfig.JWT_SECRET_ACCESS_TOKEN as string,
      options: { expiresIn: envConfig.ACCESS_TOKEN_EXPIRE_IN as ms.StringValue }
    })
  })

  it('Should successfully fetch user profile (GET /users/me)', async () => {
    const response = await request(app).get('/users/me').set('Authorization', `Bearer ${userToken}`)

    expect(response.status).toBe(200)
    expect(response.body.result).toBeDefined()
    expect(response.body.result.name).toBe('Old Name')
  })

  it('Should successfully update user profile (PATCH /users/me)', async () => {
    const payload = {
      name: 'New Name',
      date_of_birth: '1995-12-31'
    }

    const response = await request(app).patch('/users/me').set('Authorization', `Bearer ${userToken}`).send(payload)

    expect(response.status).toBe(200)

    // Xác minh DB
    const updatedDbUser = await databaseServices.users.findOne({ _id: userId })
    expect(updatedDbUser?.name).toBe('New Name')
  })
})
