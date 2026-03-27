import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './common/configs/swagger.config'
import databaseServices from './common/services/database.service'
import { defaultErrorHandler } from './common/middlewares/error.middleware'
// import dotenv from 'dotenv' - Đã gỡ
import authRoutes from './modules/auth/auth.route'
import userRoutes from './modules/users/users.route'
import orderRoutes from './modules/orders/orders.route'
import productsRoutes from './modules/products/products.route'

import categoryRoutes from './modules/categories/category.route'
import mediaRoute from './modules/medias/medias.route'
import cartRoutes from './modules/cart/cart.route'
import { initFolder } from './common/utils/file'
import { emailWorker } from '~/common/queues/email.queue'
import { redisConnection } from './common/configs/redis.config'
import morgan from 'morgan'
import logger from '~/common/utils/logger'
import { requestIdMiddleware } from './common/middlewares/requestId.middleware'
import { TokenPayload } from './modules/auth/auth.schema'

// dotenv.config() - Đã load ở configs.ts, không cần gọi lại nữa

initFolder()

const app = express() //tạo server

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Chào mừng bạn đến với Hệ thống Backend của TechGear!',
    status: 'Server đang hoạt động rất tốt!'
  })
})

const PORT = process.env.PORT || 3000 //server chạy trên cổng port 3000

app.use(requestIdMiddleware) // Gán Request ID sớm nhất có thể
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Morgan middleware: Ghi log request thông minh
app.use(
  morgan((tokens, req: any, res) => {
    const status = Number(tokens.status(req, res))
    const message = [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      '-',
      tokens['response-time'](req, res),
      'ms'
    ].join(' ')

    const requestId = req.id // Lấy ID từ middleware
    const userId = (req.decoded_authorization as TokenPayload)?.user_id // Lấy User ID nếu đã login

    // Gửi log qua winston kèm theo metadata
    logger.http(message.trim(), { status, requestId, userId })
    return null
  })
)

//tạo router

app.use('/auth', authRoutes)
app.use('/users', userRoutes)
app.use('/carts', cartRoutes)
app.use('/orders', orderRoutes)
app.use('/products', productsRoutes)
app.use('/categories', categoryRoutes)
app.use('/medias', mediaRoute)

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Health Check Endpoint
app.get('/health', async (_req, res) => {
  const healthStatus = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    services: {
      mongodb: 'unknown',
      redis: 'unknown'
    }
  }

  try {
    // Check MongoDB
    await databaseServices.db.command({ ping: 1 })
    healthStatus.services.mongodb = 'healthy'

    // Check Redis
    await redisConnection.ping()
    healthStatus.services.redis = 'healthy'

    res.status(200).json(healthStatus)
  } catch (error) {
    healthStatus.message = 'unhealthy'
    res.status(503).json(healthStatus)
  }
})

app.use(defaultErrorHandler)

let server: any
if (process.env.NODE_ENV !== 'test') {
  databaseServices.connect().then(() => {
    server = app.listen(PORT, () => {
      logger.info(`Server is running at http://localhost:${PORT}`)
    })
  })
}

const gracefulShutdown = async (signal: string) => {
  logger.info(`Received shutdown signal (${signal}), initiating graceful shutdown...`)

  // 1. ÁN TỬ 10 GIÂY
  setTimeout(() => {
    logger.error('Timeout 10s! System is stuck, force exit!')
    process.exit(1)
  }, 10000)

  // 2. KHÓA CỔNG API
  if (server) {
    logger.info('Closing HTTP server, rejecting new requests...')
    server.close()
  }

  // 3. DỌN DẸP TỪNG THÀNH PHẦN ĐỘC LẬP
  try {
    logger.info('Closing Email Worker...')
    await emailWorker.close()
  } catch (error: any) {
    logger.error('Error closing Worker:', { error: error.message })
  }

  try {
    logger.info('Closing MongoDB connection...')
    await databaseServices.client.close()
  } catch (error: any) {
    logger.error('Error closing MongoDB:', { error: error.message })
  }

  try {
    logger.info('Disconnecting Redis...')
    redisConnection.disconnect()
  } catch (error: any) {
    logger.error('Lỗi khi đóng Redis:', { error: error.message })
  }

  // 4. THÀNH CÔNG RÚT LUI
  logger.info('Graceful shutdown completed! See you later, TechGear!')
  process.exit(0)
}

// Lắng nghe lệnh tắt máy (Chỉ khi không phải môi trường test)
if (process.env.NODE_ENV !== 'test') {
  // Bắt thêm 2 cái sự kiện văng lỗi bất thình lình để Server không chết yểu
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', {
      message: err.message,
      stack: err.stack
    })
    gracefulShutdown('uncaughtException')
  })

  process.on('unhandledRejection', (reason: any) => {
    logger.error('Unhandled Rejection:', {
      reason: reason?.message || reason,
      stack: reason?.stack
    })
    gracefulShutdown('unhandledRejection')
  })

  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
}

export default app
