import { Collection, Db, MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import User from '~/modules/users/users.schema'
import RefreshToken from '~/modules/auth/auth.schema'
import Product from '~/models/schemas/Product.shemas'
import { envConfig } from '~/common/configs/configs'
import Order from '~/models/schemas/Order.schemas'
import Category from '~/models/schemas/Category.schemas'

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
}

const databaseServices = new DatabaseService()
export default databaseServices
