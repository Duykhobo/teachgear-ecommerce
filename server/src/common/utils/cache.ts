import { redisConnection } from '~/common/configs/redis.config'

export const cacheData = async <T>(key: string, fetcher: () => Promise<T>, ttl: number = 300): Promise<T> => {
  // 1. Cố gắng lấy từ Cache
  try {
    const cached = await redisConnection.get(key)
    if (cached) {
      console.log(`[Cache HIT] Key: ${key}`)
      return JSON.parse(cached)
    }
  } catch (err: any) {
    console.error(`[Cache Error] Redis is down: ${err.message}`)
  }

  // 2. Cache Miss hoặc Redis lỗi -> Chọc vào DB
  const data = await fetcher()

  // 3. Cố gắng lưu lại vào Cache (nếu Redis sống)
  try {
    if (data) {
      await redisConnection.set(key, JSON.stringify(data), 'EX', ttl)
    }
  } catch (err: any) {
    // Chỉ log, không làm ảnh hưởng đến dữ liệu trả về cho user
    console.error(`[Cache Error] Failed to set key ${key}: ${err.message}`)
  }

  return data
}
