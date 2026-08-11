import request, { Response } from 'supertest'
import app from '../src/index'
import databaseServices from '../src/common/services/database.service'
import { USER_ROLE } from '../src/common/constants/enums'
import { ObjectId } from 'mongodb'
import { signToken } from '../src/common/utils/jwt'
import { envConfig } from '../src/common/configs/configs'

describe('Orders Flow Integration Tests', () => {
  let userToken = ''
  let productId = ''

  beforeEach(async () => {
    // 1. Tạo User mua hàng
    const userId = new ObjectId()
    await databaseServices.users.insertOne({
      _id: userId,
      name: 'Test Buyer',
      email: `buyer_${Date.now()}@example.com`,
      password: 'hashedpassword',
      role: USER_ROLE.User,
      verify: 1,
      date_of_birth: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    } as any)

    userToken = await signToken({
      payload: { user_id: userId.toString(), role: USER_ROLE.User, verify: 1 },
      privateKey: envConfig.JWT_SECRET_ACCESS_TOKEN as string,
      options: { expiresIn: envConfig.ACCESS_TOKEN_EXPIRE_IN as any }
    })

    // 2. Tạo một Category hợp lệ
    const categoryId = new ObjectId()
    await databaseServices.categories.insertOne({
      _id: categoryId,
      name: 'Test Category',
      description: 'Desc'
    } as any)

    // 3. Tạo Product với tồn kho = 10
    const pId = new ObjectId()
    productId = pId.toString()
    await databaseServices.products.insertOne({
      _id: pId,
      name: 'Checkout Product',
      price: 500000,
      stock_quantity: 10, // Quan trọng: dùng để test Stock Management
      sold_quantity: 0,
      images: [],
      category: categoryId,
      is_active: true
    } as any)

    // 4. Thêm Product vào giỏ hàng của User với số lượng 2
    await request(app)
      .post('/carts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ product_id: productId, quantity: 2 })
  })

  it('Should successfully checkout an order from the cart', async () => {
    const payload = {
      address: '123 E-commerce St, VN',
      phone_number: '0912345678',
      receiver_name: 'Test Buyer',
      payment_method: 'COD'
    }

    const response = await request(app).post('/orders').set('Authorization', `Bearer ${userToken}`).send(payload)

    expect(response.status).toBe(200)
    expect(response.body.data).toBeDefined()
    expect(response.body.data.total_amount).toBe(1000000) // 500k * 2
  })

  it('Should correctly update Product Stock Management after checkout', async () => {
    // Checkout
    await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ address: '123 St, HCM', phone_number: '0912345678', receiver_name: 'Test Buyer', payment_method: 'COD' })

    // Query DB to check stock
    const dbProduct = await databaseServices.products.findOne({ _id: new ObjectId(productId) })

    expect(dbProduct).toBeDefined()
    expect(dbProduct?.stock_quantity).toBe(8) // 10 Ban đầu - 2 Đã mua
  })

  it('Should throw 400 when checking out an empty cart', async () => {
    // Tạo 1 User khác có giỏ hàng rỗng
    const emptyUserId = new ObjectId()
    await databaseServices.users.insertOne({
      _id: emptyUserId,
      email: `empty_${Date.now()}@test.com`,
      role: USER_ROLE.User,
      verify: 1
    } as any)

    const emptyToken = await signToken({
      payload: { user_id: emptyUserId.toString(), role: USER_ROLE.User, verify: 1 },
      privateKey: envConfig.JWT_SECRET_ACCESS_TOKEN as string,
      options: { expiresIn: '1d' }
    })

    const response: Response = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${emptyToken}`)
      .send({ address: '123 St, HCM', phone_number: '0912345678', receiver_name: 'Test Buyer', payment_method: 'COD' })

    expect(response.status).toBe(400) // Giỏ rỗng => Không thể checkout
  })

  it('Should show the new order in User Order History', async () => {
    // 1. Checkout
    await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ address: '123 St, HCM', phone_number: '0912345678', receiver_name: 'Test Buyer', payment_method: 'COD' })

    // 2. Fetch history
    const response = await request(app).get('/orders/me').set('Authorization', `Bearer ${userToken}`)

    expect(response.status).toBe(200)
    expect(response.body.result).toBeInstanceOf(Array)
    expect(response.body.result.length).toBeGreaterThanOrEqual(1)
  })
})
