import { Queue, Worker, Job } from 'bullmq'
import { redisConnection } from '../configs/redis.config'
import emailService from '../services/email.service'

// 1. Định nghĩa kiểu dữ liệu cho Job
export interface EmailJobPayload {
  type: 'verify-email' | 'forgot-password' | 'order-confirmation'
  to: string
  token?: string
  orderId?: string
  totalAmount?: number
  currency?: string
}

const QUEUE_NAME = 'email-queue'

// 2. Khởi tạo Thùng chứa Job (Queue) - Luôn cần để add job
export const emailQueue = new Queue<EmailJobPayload>(QUEUE_NAME, {
  connection: redisConnection
})

// 3. Khởi tạo Công nhân (Worker) - CHỈ CHẠY KHI KHÔNG PHẢI MÔI TRƯỜNG TEST
// Chúng ta dùng let để có thể gán lại giá trị tùy môi trường
let emailWorker: any

if (process.env.NODE_ENV !== 'test') {
  emailWorker = new Worker<EmailJobPayload>(
    QUEUE_NAME,
    async (job: Job<EmailJobPayload>) => {
      const { type, to, token, orderId, totalAmount } = job.data
      console.log(`[Worker] Processing [${type}] to: ${to}`)

      if (type === 'verify-email') {
        await emailService.sendVerifyEmail(to, token!)
      } else if (type === 'forgot-password') {
        await emailService.sendForgotPasswordEmail(to, token!)
      } else if (type === 'order-confirmation') {
        await emailService.sendOrderConfirmationEmail(to, orderId!, totalAmount!, job.data.currency)
      }
    },
    {
      connection: redisConnection,
      concurrency: 5
    }
  )

  // Chỉ lắng nghe sự kiện khi worker thực sự tồn tại
  emailWorker.on('completed', (job: Job) => {
    console.log(`Job ${job.id} sent successfully!`)
  })

  emailWorker.on('failed', (job: Job | undefined, err: Error) => {
    console.log(`Job ${job?.id} failed. Reason: ${err.message}`)
  })
} else {
  // Môi trường TEST: Tạo một Mock Worker để index.ts gọi .close() không bị crash
  emailWorker = {
    close: async () => Promise.resolve(),
    on: () => {},
    terminate: async () => Promise.resolve()
  }
}

export { emailWorker }

// 4. Hàm helper bọc Job (Giữ nguyên logic của em)
export const enqueueEmailJob = async (payload: EmailJobPayload) => {
  try {
    await emailQueue.add(`send-email-${payload.type}`, payload, {
      attempts: 3,
      removeOnComplete: true,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    })
  } catch (error: any) {
    console.error(`[Queue] Failed to enqueue email job [${payload.type}] to ${payload.to}:`, error.message)
  }
}
