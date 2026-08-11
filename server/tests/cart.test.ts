import request from 'supertest'
import app from '../src/index'
import databaseServices from '../src/common/services/database.service'
import { ObjectId } from 'mongodb'
import Product from '../src/modules/products/models/product.model'
import User from '../src/modules/users/models/user.model'
import { hashPassword } from '../src/common/utils/crypto'
import { USER_ROLE } from '../src/common/constants/enums'

describe('Cart Flow Integration Tests', () => {
  const adminUser = {
    name: 'Cart Admin',
    email: `cart_admin_${Date.now()}@example.com`,
    password: 'Password123!',
    role: USER_ROLE.Admin
  }

  let accessToken = ''
  let productId = ''

  beforeEach(async () => {
    // 1. Create a user
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
    const loginResp = await request(app).post('/auth/login').send({
      email: adminUser.email,
      password: adminUser.password
    })
    accessToken = loginResp.body.result.access_token

    // 3. Create a product
    const pId = new ObjectId()
    productId = pId.toString()
    await databaseServices.products.insertOne(
      new Product({
        _id: pId,
        name: 'Test Product',
        description: 'Desc',
        price: 100,
        stock_quantity: 10,
        images: [],
        category: new ObjectId()
      })
    )
  })

  it('Should successfully add an item to cart', async () => {
    const payload = {
      product_id: productId,
      quantity: 1
    }

    const response = await request(app).post('/carts').set('Authorization', `Bearer ${accessToken}`).send(payload)

    expect(response.status).toBe(200)
    expect(response.body.result.cart).toBeDefined()
    expect(response.body.result.cart.length).toBeGreaterThanOrEqual(1)
  })

  it('Should successfully update item quantity in cart', async () => {
    // Add first
    await request(app)
      .post('/carts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ product_id: productId, quantity: 1 })

    // Update
    const patchPayload = { quantity: 5 }
    const response = await request(app)
      .patch(`/carts/${productId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(patchPayload)

    expect(response.status).toBe(200)
    const updatedItem = response.body.result.cart.find(
      (item: { product_id: string; quantity: number }) => item.product_id === productId
    )
    expect(updatedItem.quantity).toBe(5)
  })

  it('Should successfully remove an item from cart', async () => {
    // Add first
    await request(app)
      .post('/carts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ product_id: productId, quantity: 1 })

    // Remove
    const response = await request(app).delete(`/carts/${productId}`).set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(204)
  })
  it('Should fail when adding quantity exceeding stock', async () => {
    const payload = { product_id: productId, quantity: 999 } // Stock is 10
    const response = await request(app).post('/carts').set('Authorization', `Bearer ${accessToken}`).send(payload)

    expect(response.status).toBeGreaterThanOrEqual(400)
  })
})
