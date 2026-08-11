import { ObjectId } from 'mongodb'
import databaseServices from '../common/services/database.service'
import Category from '../modules/categories/models/category.model'
import Product from '../modules/products/models/product.model'
import User from '../modules/users/models/user.model'
import Cart from '../modules/cart/models/cart.model'
import Order from '../modules/orders/models/orders.model'
import { ProductType } from '../modules/products/types/product.types'
import { hashPassword } from '../common/utils/crypto'
import {
  USER_ROLE,
  UserVerifyStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  DeliveryMethod,
  DeliveryStatus
} from '../common/constants/enums'

async function seed() {
  await databaseServices.connect()

  console.log('Cleaning up existing data...')
  await databaseServices.users.deleteMany({})
  await databaseServices.categories.deleteMany({})
  await databaseServices.products.deleteMany({})
  await databaseServices.refreshTokens.deleteMany({})
  await databaseServices.carts.deleteMany({})
  await databaseServices.orders.deleteMany({})

  console.log('Seeding Users...')
  const password = await hashPassword('Password123!')
  const adminId = new ObjectId()
  const userId = new ObjectId()

  const users = [
    new User({
      _id: adminId,
      name: 'Admin TechGear',
      email: 'admin@techgear.com',
      password,
      role: USER_ROLE.Admin,
      verify: UserVerifyStatus.Verified,
      created_at: new Date(),
      updated_at: new Date()
    }),
    new User({
      _id: userId,
      name: 'John Doe',
      email: 'user@techgear.com',
      password,
      role: USER_ROLE.User,
      verify: UserVerifyStatus.Verified,
      created_at: new Date(),
      updated_at: new Date()
    })
  ]
  await databaseServices.users.insertMany(users)

  console.log('Seeding Categories...')
  const categoryData = [
    { name: 'Laptops', slug: 'laptops', description: 'High-performance laptops for work and play' },
    { name: 'Mechanical Keyboards', slug: 'mechanical-keyboards', description: 'Premium tactile typing experience' },
    { name: 'Gaming Mice', slug: 'gaming-mice', description: 'Precision and speed in your palms' },
    { name: 'Monitors', slug: 'monitors', description: 'Crystal clear high-refresh displays' },
    { name: 'Audio & Headsets', slug: 'audio-headsets', description: 'Immersive sound for gaming and music' }
  ]

  const categories = categoryData.map((c) => ({
    ...c,
    _id: new ObjectId(),
    created_at: new Date(),
    updated_at: new Date()
  }))
  await databaseServices.categories.insertMany(categories as unknown as Category[])

  console.log('Seeding Products...')
  const productsData = [
    // Laptops
    {
      name: 'MacBook Pro M3 Max',
      price: 3499,
      stock_quantity: 50,
      category: categories[0]._id,
      description: 'Apple M3 Max chip, 14-core CPU, 30-core GPU, 36GB Unified Memory, 1TB SSD Storage.',
      images: [{ url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8' }],
      sold_quantity: 12,
      is_active: true
    },
    {
      name: 'Razer Blade 16',
      price: 2999,
      stock_quantity: 30,
      category: categories[0]._id,
      description: 'Intel Core i9-13950HX, RTX 4090, 16" QHD+ 240Hz, 32GB RAM, 1TB SSD.',
      images: [{ url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45' }],
      sold_quantity: 5,
      is_active: true
    },
    // Keyboards
    {
      name: 'Keychron Q1 Pro',
      price: 199,
      stock_quantity: 100,
      category: categories[1]._id,
      description: 'Wireless Custom Mechanical Keyboard with CNC Aluminum Body.',
      images: [{ url: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae' }],
      sold_quantity: 45,
      is_active: true
    },
    {
      name: 'Logitech G Pro X Superlight 2',
      price: 159,
      stock_quantity: 150,
      category: categories[2]._id,
      description: 'Lightspeed Wireless Gaming Mouse, Ultra-Lightweight 60g.',
      images: [{ url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7' }],
      sold_quantity: 80,
      is_active: true
    }
  ]

  const seededProducts = productsData.map((p) => new Product(p as unknown as ProductType))
  await databaseServices.products.insertMany(seededProducts)

  console.log('Seeding Carts...')
  const userCart = new Cart({
    user_id: userId,
    items: [
      {
        product_id: seededProducts[2]._id,
        quantity: 1
      }
    ]
  })
  await databaseServices.carts.insertOne(userCart)

  console.log('Seeding Orders...')
  const orders = [
    // 1. Pending Order
    new Order({
      user_id: userId,
      order_items: [
        {
          product_id: seededProducts[0]._id,
          name: seededProducts[0].name,
          price: seededProducts[0].price,
          quantity: 1,
          image: seededProducts[0].images?.[0].url || ''
        }
      ],
      total_amount: seededProducts[0].price,
      status: OrderStatus.Pending,
      payment: {
        payment_method: PaymentMethod.SePay,
        payment_status: PaymentStatus.Pending,
        payment_id: ''
      },
      delivery: {
        delivery_method: DeliveryMethod.Standard,
        delivery_status: DeliveryStatus.Pending,
        address: '123 Tech St, Silicon Valley, USA',
        receiver_name: 'John Doe',
        phone_number: '0987654321',
        shipping_fee: 10
      }
    }),
    // 2. Paid & Delivered Order (For Revenue testing)
    new Order({
      user_id: userId,
      order_items: [
        {
          product_id: seededProducts[3]._id,
          name: seededProducts[3].name,
          price: seededProducts[3].price,
          quantity: 2,
          image: seededProducts[3].images?.[0].url || ''
        }
      ],
      total_amount: seededProducts[3].price * 2 + 5,
      status: OrderStatus.Delivered,
      payment: {
        payment_method: PaymentMethod.SePay,
        payment_status: PaymentStatus.Paid,
        payment_id: 'sample_stripe_id_123',
        paid_at: new Date(Date.now() - 86400000) // Yesterday
      } as any,
      delivery: {
        delivery_method: DeliveryMethod.Express,
        delivery_status: DeliveryStatus.Delivered,
        address: '123 Tech St, Silicon Valley, USA',
        receiver_name: 'John Doe',
        phone_number: '0987654321',
        shipping_fee: 5
      },
      created_at: new Date(Date.now() - 86400000)
    }),
    // 3. Cancelled Order
    new Order({
      user_id: userId,
      order_items: [
        {
          product_id: seededProducts[1]._id,
          name: seededProducts[1].name,
          price: seededProducts[1].price,
          quantity: 1,
          image: seededProducts[1].images?.[0].url || ''
        }
      ],
      total_amount: seededProducts[1].price,
      status: OrderStatus.Cancelled,
      payment: {
        payment_method: PaymentMethod.COD,
        payment_status: PaymentStatus.Pending,
        payment_id: ''
      },
      delivery: {
        delivery_method: DeliveryMethod.Standard,
        delivery_status: DeliveryStatus.Cancelled,
        address: '123 Tech St, Silicon Valley, USA',
        receiver_name: 'John Doe',
        phone_number: '0987654321',
        shipping_fee: 10
      }
    })
  ]
  await databaseServices.orders.insertMany(orders)

  console.log('✅ Seeding completed successfully!')
  console.log('-----------------------------------')
  console.log('Admin Account: admin@techgear.com / Password123!')
  console.log('User Account: user@techgear.com  / Password123!')
  console.log('-----------------------------------')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err)
  process.exit(1)
})
