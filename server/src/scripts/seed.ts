import { ObjectId } from 'mongodb'
import databaseServices from '../common/services/database.service'
import Category from '../modules/categories/models/category.model'
import Product from '../modules/products/models/product.model'
import User from '../modules/users/models/user.model'
import { ProductType } from '../modules/products/types/product.types'
import { hashPassword } from '../common/utils/crypto'
import { USER_ROLE, UserVerifyStatus } from '../common/constants/enums'

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
  const users = [
    new User({
      _id: new ObjectId(),
      name: 'Admin TechGear',
      email: 'admin@techgear.com',
      password,
      role: USER_ROLE.Admin,
      verify: UserVerifyStatus.Verified,
      created_at: new Date(),
      updated_at: new Date()
    }),
    new User({
      _id: new ObjectId(),
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
      stock_quantity: 5,
      category: categories[0]._id,
      description: 'Apple M3 Max chip, 14-core CPU, 30-core GPU, 36GB Unified Memory, 1TB SSD Storage.',
      images: [{ url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8' }],
      sold_quantity: 0,
      is_active: true
    },
    {
      name: 'Razer Blade 16',
      price: 2999,
      stock_quantity: 8,
      category: categories[0]._id,
      description: 'Intel Core i9-13950HX, RTX 4090, 16" QHD+ 240Hz, 32GB RAM, 1TB SSD.',
      images: [{ url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45' }],
      sold_quantity: 0,
      is_active: true
    },
    // Keyboards
    {
      name: 'Keychron Q1 Pro',
      price: 199,
      stock_quantity: 15,
      category: categories[1]._id,
      description: 'Wireless Custom Mechanical Keyboard with CNC Aluminum Body.',
      images: [{ url: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae' }],
      sold_quantity: 0,
      is_active: true
    },
    {
      name: 'Glorious GMMK Pro',
      price: 169,
      stock_quantity: 20,
      category: categories[1]._id,
      description: '75% Gasket Mount Modular Mechanical Gaming Keyboard.',
      images: [{ url: 'https://images.unsplash.com/photo-1595225476474-87563907a212' }],
      sold_quantity: 0,
      is_active: true
    },
    // Mice
    {
      name: 'Logitech G Pro X Superlight 2',
      price: 159,
      stock_quantity: 30,
      category: categories[2]._id,
      description: 'Lightspeed Wireless Gaming Mouse, Ultra-Lightweight 60g.',
      images: [{ url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7' }],
      sold_quantity: 0,
      is_active: true
    },
    {
      name: 'Razer DeathAdder V3 Pro',
      price: 149,
      stock_quantity: 25,
      category: categories[2]._id,
      description: 'High-speed wireless esports gaming mouse.',
      images: [{ url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf' }],
      sold_quantity: 0,
      is_active: true
    },
    // Monitors
    {
      name: 'Dell UltraSharp U2723QE',
      price: 649,
      stock_quantity: 12,
      category: categories[3]._id,
      description: '27-inch 4K USB-C Hub Monitor with IPS Black Technology.',
      images: [{ url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf' }],
      sold_quantity: 0,
      is_active: true
    },
    {
      name: 'Samsung Odyssey Neo G9',
      price: 1799,
      stock_quantity: 4,
      category: categories[3]._id,
      description: '49-inch Curved Gaming Monitor with Mini-LED.',
      images: [{ url: 'https://images.unsplash.com/photo-1551645120-d70bfe84c826' }],
      sold_quantity: 0,
      is_active: true
    },
    // Audio
    {
      name: 'Sony WH-1000XM5',
      price: 399,
      stock_quantity: 40,
      category: categories[4]._id,
      description: 'Premium Noise Cancelling Wireless Headphones.',
      images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e' }],
      sold_quantity: 0,
      is_active: true
    },
    {
      name: 'SteelSeries Arctis Nova Pro',
      price: 349,
      stock_quantity: 20,
      category: categories[4]._id,
      description: 'Premium Gaming Headset for Multi-System Support.',
      images: [{ url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df' }],
      sold_quantity: 0,
      is_active: true
    }
  ]

  await databaseServices.products.insertMany(
    productsData.map((p) => new Product(p as unknown as ProductType)) as unknown as Product[]
  )

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
