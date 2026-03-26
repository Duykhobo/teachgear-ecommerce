import Redis from 'ioredis'
import { envConfig } from './configs'

// Kết nối tới Redis chạy trên Docker (localhost:6379)
export const redisConnection = new Redis({
  host: envConfig.REDIS_HOST,
  port: envConfig.REDIS_PORT,
  maxRetriesPerRequest: null // Bắt buộc phải là null theo tài liệu của BullMQ
})

redisConnection.on('connect', () => {
  console.log('Redis connected successfully for BullMQ!')
})

redisConnection.on('error', (err) => {
  console.error('Redis connection error:', err)
})
