import logger from './src/common/utils/logger'

console.log('--- Bắt đầu Test Senior Logger (Bản Pro) ---')

// Giả lập log từ Middleware/Controller
const requestId = 'req-550e8400-e29b-41d4-a716-446655440000'
const userId = 'user_67890'

logger.info('User placed an order', {
  requestId,
  userId,
  status: 201,
  orderId: 'ORD-12345'
})

logger.http('GET /products', {
  requestId,
  status: 200
})

logger.error('Payment Gateway Timeout', {
  requestId,
  userId,
  status: 500,
  gateway: 'Stripe'
})

console.log('\n--- Kết thúc Test Senior Logger ---')
console.log('Bạn có thể chạy server (npm run dev) và gọi thử API để thấy ID thực tế nhé!')
