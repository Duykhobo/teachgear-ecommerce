import { Db, MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const uri = process.env.MONGODB_URI as string

class DatabaseService {
  private client: MongoClient
  private db: Db //tạo thành thuộc tình db
  constructor() {
    this.client = new MongoClient(uri)
    // nạp giá trị cho thuộc tình db thông qua constructor
    this.db = this.client.db(process.env.DB_NAME)
  }
  async connect() {
    try {
      await this.db.command({ ping: 1 }) //đổi cách xài
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}

const databaseServices = new DatabaseService()
export default databaseServices
