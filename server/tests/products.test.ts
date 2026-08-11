import request from 'supertest'
import app from '../src/index'
import databaseServices from '../src/common/services/database.service'
import { USER_ROLE } from '../src/common/constants/enums'
import { ObjectId } from 'mongodb'
import { signToken } from '../src/common/utils/jwt'
import { envConfig } from '../src/common/configs/configs'
import ms from 'ms'

describe('Products Flow Integration Tests', () => {
  let adminToken = ''

  beforeEach(async () => {
    const adminId = new ObjectId()
    await databaseServices.users.insertOne({
      _id: adminId,
      name: 'Admin User',
      email: 'admin_products@example.com',
      password: 'hashedpassword123',
      date_of_birth: new Date('1990-01-01'),
      role: USER_ROLE.Admin,
      verify: 1,
      forgot_password_token: '',
      created_at: new Date(),
      updated_at: new Date()
    } as any)

    // Tạo sẵn một category mẫu để pass qua validate CATEGORY_NOT_FOUND trong service
    await databaseServices.categories.insertOne({
      _id: new ObjectId('123456789012345678901234'),
      name: 'Test Category',
      description: 'Test Category description'
    } as any)

    adminToken = await signToken({
      payload: { user_id: adminId.toString(), role: USER_ROLE.Admin, verify: 1 },
      privateKey: envConfig.JWT_SECRET_ACCESS_TOKEN as string,
      options: { expiresIn: envConfig.ACCESS_TOKEN_EXPIRE_IN as ms.StringValue }
    })
  })

  // ===================== ADMIN API =====================
  it('Should successfully create a product (Admin)', async () => {
    const payload = {
      name: 'Test Product 1',
      price: 1500000,
      stock_quantity: 10,
      category_id: '123456789012345678901234',
      description: 'Test product description',
      images: [{ url: 'http://example.com/image1.jpg' }]
    }

    const response = await request(app).post('/products').set('Authorization', `Bearer ${adminToken}`).send(payload)

    expect(response.status).toBe(201)
    expect(response.body.result).toBeDefined()
    expect(response.body.result.name).toBe(payload.name)
  })

  // ===================== PUBLIC API =====================
  it('Should get product list with default pagination', async () => {
    const payload1 = {
      name: 'Test Product A',
      price: 1000,
      description: 'Desc A',
      images: [{ url: 'http://example.com/image1.jpg' }],
      category_id: '123456789012345678901234',
      stock_quantity: 5
    }
    const payload2 = {
      name: 'Test Product B',
      price: 2000,
      description: 'Desc B',
      images: [{ url: 'http://example.com/image1.jpg' }],
      category_id: '123456789012345678901234',
      stock_quantity: 5
    }

    await request(app).post('/products').set('Authorization', `Bearer ${adminToken}`).send(payload1)
    await request(app).post('/products').set('Authorization', `Bearer ${adminToken}`).send(payload2)

    const response = await request(app).get('/products')

    expect(response.status).toBe(200)
    expect(response.body.result.products.length).toBeGreaterThanOrEqual(2)
  })

  it('Should successfully get a single product details', async () => {
    const payload = {
      name: 'Test Single Product',
      price: 500,
      description: 'Desc',
      images: [{ url: 'http://example.com/image1.jpg' }],
      category_id: '123456789012345678901234',
      stock_quantity: 1
    }
    const createRes = await request(app).post('/products').set('Authorization', `Bearer ${adminToken}`).send(payload)
    const productId = createRes.body.result._id

    const response = await request(app).get(`/products/${productId}`)

    expect(response.status).toBe(200)
    expect(response.body.result.name).toBe(payload.name)
  })

  it('Should return 404 for invalid product ID', async () => {
    const invalidId = '111111111111111111111111'
    const response = await request(app).get(`/products/${invalidId}`)
    expect(response.status).toBe(404)
  })

  // ===================== ADMIN API UPDATE/DELETE =====================
  it('Should successfully update a product (Admin)', async () => {
    const payload = {
      name: 'Product to Update',
      price: 500,
      description: 'Desc',
      images: [{ url: 'http://example.com/image1.jpg' }],
      category_id: '123456789012345678901234',
      stock_quantity: 1
    }
    const createRes = await request(app).post('/products').set('Authorization', `Bearer ${adminToken}`).send(payload)
    const productId = createRes.body.result._id

    const updateResponse = await request(app)
      .patch(`/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 1000 })

    expect(updateResponse.status).toBe(200)

    const getResponse = await request(app).get(`/products/${productId}`)
    expect(getResponse.body.result.price).toBe(1000)
  })

  it('Should successfully delete a product (Admin)', async () => {
    const payload = {
      name: 'Product to Delete',
      price: 500,
      description: 'Desc',
      images: [{ url: 'http://example.com/image1.jpg' }],
      category_id: '123456789012345678901234',
      stock_quantity: 1
    }
    const createRes = await request(app).post('/products').set('Authorization', `Bearer ${adminToken}`).send(payload)
    const productId = createRes.body.result._id

    const deleteResponse = await request(app)
      .delete(`/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(deleteResponse.status).toBe(200)

    const getResponse = await request(app).get(`/products/${productId}`)
    expect(getResponse.status).toBe(404)
  })
})
