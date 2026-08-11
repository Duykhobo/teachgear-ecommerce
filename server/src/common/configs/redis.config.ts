import Redis from 'ioredis'
import { envConfig } from './configs'

// Cấu hình Redis chống lặp log ECONNREFUSED & hỗ trợ REDIS_URL cloud
export const redisConnection = envConfig.REDIS_URL
  ? new Redis(envConfig.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      retryStrategy(times) {
        if (times > 5) return null
        return Math.min(times * 500, 3000)
      }
    })
  : new Redis({
      host: envConfig.REDIS_HOST,
      port: envConfig.REDIS_PORT,
      password: envConfig.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      retryStrategy(times) {
        if (times > 5) return null
        return Math.min(times * 500, 3000)
      }
    })

redisConnection.on('connect', () => {
  console.log('✅ Redis connected successfully!')
})

redisConnection.on('error', (err) => {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg.includes('ECONNREFUSED')) {
    console.warn('⚠️ [Redis Warning] Unable to connect to Redis. Cache & Queue will run in fallback mode.')
  } else {
    console.error('⚠️ [Redis Error]:', msg)
  }
})
