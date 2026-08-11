import request, { Response } from 'supertest'
import app from '../src/index'
import databaseServices from '../src/common/services/database.service'

describe('Auth Flow Integration Tests', () => {
  const testUser = {
    name: 'Test Auth User',
    password: 'Password123!',
    confirm_password: 'Password123!',
    date_of_birth: '1990-01-01'
  }

  it('Should successfully register a new user', async () => {
    const email = 'register@example.com'
    const response: Response = await request(app)
      .post('/auth/register')
      .send({ ...testUser, email })

    expect(response.status).toBe(201)
    expect(response.body.result).toBeDefined()

    const userInDb = await databaseServices.users.findOne({ email })
    expect(userInDb).not.toBeNull()
  })

  it('Should fail login with wrong password (valid format)', async () => {
    const email = 'login_fail@example.com'
    // 1. Register first
    await request(app)
      .post('/auth/register')
      .send({ ...testUser, email })

    // 2. Try login
    const response: Response = await request(app).post('/auth/login').send({
      email,
      password: 'WrongPassword123!'
    })

    expect(response.status).toBe(401)
  })

  it('Should successfully login', async () => {
    const email = 'login_success@example.com'
    // 1. Register first
    await request(app)
      .post('/auth/register')
      .send({ ...testUser, email })

    // Đợi 1.1s để iat của JWT khác đi, tránh trùng token gây lỗi Duplicate Key
    await new Promise((resolve) => setTimeout(resolve, 1100))

    // 2. Login
    const response: Response = await request(app).post('/auth/login').send({
      email,
      password: testUser.password
    })

    expect(response.status).toBe(200)
    expect(response.body.result.access_token).toBeDefined()
  })

  it('Should logout successfully', async () => {
    const email = 'logout@example.com'
    // 1. Register
    const regResp: Response = await request(app)
      .post('/auth/register')
      .send({ ...testUser, email })
    const { access_token, refresh_token } = regResp.body.result

    // 2. Logout
    const response: Response = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${access_token}`)
      .send({ refresh_token })

    expect(response.status).toBe(200)
  })
})
