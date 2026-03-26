import { Collection, Db, MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import User from '~/modules/users/users.schema'
import RefreshToken from '~/modules/auth/auth.schema'
import Product from '~/modules/products/products.schema'
import { envConfig } from '~/common/configs/configs'
import Order from '~/modules/orders/orders.schema'
import Category from '~/modules/categories/category.schema'
import Cart from '~/modules/cart/cart.schema'

dotenv.config()

const uri = envConfig.MONGODB_URI

class DatabaseService {
  public client: MongoClient
  private db: Db //tạo thành thuộc tình db
  constructor() {
    this.client = new MongoClient(uri)
    // nạp giá trị cho thuộc tình db thông qua constructor
    this.db = this.client.db(envConfig.DB_NAME)
  }
  async connect() {
    try {
      await this.db.command({ ping: 1 }) //đổi cách xài
      console.log('Pinged your deployment. You successfully connected to MongoDB!')

      // Create indexes
      await this.categories.createIndex({ slug: 1 }, { unique: true })

      // Products: text search index (thay thế regex full scan)
      await this.products.createIndex({ name: 'text' }, { background: true })

      // Orders: compound index user_id + created_at cho GET /orders/me (sort mới nhất trước)
      await this.orders.createIndex({ user_id: 1, created_at: -1 }, { background: true })
      await this.orders.createIndex({ status: 1 }, { background: true })

      // Refresh tokens: unique index trên token để lookup O(log n) khi logout / refresh
      await this.refreshTokens.createIndex({ token: 1 }, { unique: true, background: true })

      // Carts: unique index trên user_id — mỗi user chỉ có 1 cart
      await this.carts.createIndex({ user_id: 1 }, { unique: true, background: true })

    } catch (error) {
      console.log(error)
      throw error
    }
  }

  get users(): Collection<User> {
    return this.db.collection(envConfig.DB_USERS_COLLECTION as string)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(envConfig.DB_REFRESH_TOKENS_COLLECTION as string)
  }

  get products(): Collection<Product> {
    return this.db.collection(envConfig.DB_PRODUCTS_COLLECTION as string)
  }

  get orders(): Collection<Order> {
    return this.db.collection(envConfig.DB_ORDERS_COLLECTION as string)
  }

  get categories(): Collection<Category> {
    return this.db.collection(envConfig.DB_CATEGORIES_COLLECTION as string)
  }

  get carts(): Collection<Cart> {
    return this.db.collection('carts')
  }
}

const databaseServices = new DatabaseService()
export default databaseServices
