import request from 'supertest'
import app from '../src/index'
import databaseServices from '../src/common/services/database.service'
import { USER_ROLE } from '~/common/constants/enums'
import { hashPassword } from '~/common/utils/crypto'
import User from '~/modules/users/models/user.model'
import { ObjectId } from 'mongodb'

describe('Categories Flow Integration Tests', () => {
  const adminUser = {
    name: 'Admin User',
    email: 'admin_test@example.com',
    password: 'Password123!'
  }

  let adminAccessToken = ''

  beforeEach(async () => {
    // 1. Create an admin user directly in DB
    const userId = new ObjectId()
    await databaseServices.users.insertOne(
      new User({
        _id: userId,
        email: adminUser.email,
        password: await hashPassword(adminUser.password),
        name: adminUser.name,
        role: USER_ROLE.Admin,
        date_of_birth: new Date()
      })
    )

    // 2. Login to get token
    const response = await request(app).post('/auth/login').send({
      email: adminUser.email,
      password: adminUser.password
    })

    if (response.status !== 200 || !response.body.result) {
      throw new Error(`Admin login failed: ${JSON.stringify(response.body)}`)
    }

    adminAccessToken = response.body.result.access_token
  })

  it('Should successfully create a category as admin', async () => {
    const categoryData = {
      name: 'Test Category',
      slug: 'test-category',
      description: 'Test Description'
    }

    const response = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send(categoryData)

    if (response.status !== 201) {
      console.log('Expected 201 but got:', response.status, response.body)
    }
    expect(response.status).toBe(201)
    expect(response.body.result.name).toBe(categoryData.name)

    const catInDb = await databaseServices.categories.findOne({ slug: categoryData.slug })
    expect(catInDb).not.toBeNull()
  })

  it('Should prevent creating a category with existing slug', async () => {
    const categoryData = {
      name: 'Duplicate Category',
      slug: 'test-category'
    }

    // 1. Create first one
    await request(app).post('/categories').set('Authorization', `Bearer ${adminAccessToken}`).send(categoryData)

    // 2. Try to create again
    const response = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send(categoryData)

    expect(response.status).toBe(400)
  })
})
