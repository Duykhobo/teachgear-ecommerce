import { ObjectId } from 'mongodb'
import databaseServices from '../common/services/database.service'
import Category from '../modules/categories/models/category.model'
import Product from '../modules/products/models/product.model'
import { ProductType } from '../modules/products/types/product.types'

async function seed() {
  await databaseServices.connect()

  console.log('Cleaning up existing data...')
  await databaseServices.categories.deleteMany({})
  await databaseServices.products.deleteMany({})

  console.log('Seeding Categories...')
  const categories = [
    {
      _id: new ObjectId(),
      name: 'Laptops',
      slug: 'laptops',
      description: 'High performance laptops and notebooks',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      _id: new ObjectId(),
      name: 'Keyboards',
      slug: 'keyboards',
      description: 'Mechanical and wireless keyboards',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      _id: new ObjectId(),
      name: 'Mice',
      slug: 'mice',
      description: 'Gaming and productivity mice',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      _id: new ObjectId(),
      name: 'Monitors',
      slug: 'monitors',
      description: '4K and high refresh rate displays',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]
  await databaseServices.categories.insertMany(categories as unknown as Category[])

  console.log('Seeding Products...')
  const products = [
    {
      name: 'MacBook Pro M3',
      price: 1999,
      stock_quantity: 10,
      category: categories[0]._id,
      description: 'Apple MacBook Pro with M3 chip, 16GB RAM, 512GB SSD',
      images: [{ url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8' }],
      sold_quantity: 0,
      is_active: true
    },
    {
      name: 'Dell XPS 15',
      price: 1799,
      stock_quantity: 5,
      category: categories[0]._id,
      description: 'Powerful Dell laptop with infinity edge display',
      images: [{ url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45' }],
      sold_quantity: 0,
      is_active: true
    },
    {
      name: 'Keychron K2 V2',
      price: 89,
      stock_quantity: 25,
      category: categories[1]._id,
      description: '75% wireless mechanical keyboard with RGB',
      images: [{ url: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae' }],
      sold_quantity: 0,
      is_active: true
    },
    {
      name: 'Logitech G Pro X Superlight',
      price: 149,
      stock_quantity: 15,
      category: categories[2]._id,
      description: 'Ultralight wireless gaming mouse for pros',
      images: [{ url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7' }],
      sold_quantity: 0,
      is_active: true
    },
    {
      name: 'ASUS ROG Swift PG279QM',
      price: 799,
      stock_quantity: 8,
      category: categories[3]._id,
      description: '27-inch 1440p 240Hz G-SYNC gaming monitor',
      images: [{ url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf' }],
      sold_quantity: 0,
      is_active: true
    }
  ]
  await databaseServices.products.insertMany(
    products.map((p) => new Product(p as unknown as ProductType)) as unknown as Product[]
  )

  console.log('✅ Seeding completed successfully!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err)
  process.exit(1)
})
