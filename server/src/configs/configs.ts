import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
import { z } from 'zod'

// Load biến môi trường từ file .env
const env = process.env.NODE_ENV
const envFilename = `.env${env ? `.${env}` : ''}`

if (!env) {
  console.log(`Bạn chưa cung cấp biến môi trường NODE_ENV (ví dụ: development, production)`)
  console.log(`Phát hiện NODE_ENV = ${env}`)
  console.log(`Hệ thống sẽ tự động sử dụng file .env`)
}

if (!fs.existsSync(path.resolve(envFilename))) {
  console.log(`Không tìm thấy file ${envFilename}`)
  console.log(`Lưu ý: App không dùng file .env, vui lòng tạo file ${envFilename}`)
  console.log(`Vui lòng tham khảo file .env.example`)
  process.exit(1)
}

config({
  path: envFilename
})

// Định nghĩa Schema validation cho biến môi trường
// Zod sẽ kiểm tra xem các biến này có tồn tại và đúng kiểu dữ liệu không
export const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string(),

  MONGODB_URI: z.string(),
  DB_USERNAME: z.string(),
  DB_NAME: z.string(),
  DB_USERS_COLLECTION: z.string(),
  DB_REFRESH_TOKENS_COLLECTION: z.string(),
  DB_PRODUCTS_COLLECTION: z.string(),
  DB_ORDERS_COLLECTION: z.string(),

  PASSWORD_SECRET: z.string(),

  JWT_SECRET_ACCESS_TOKEN: z.string(),
  JWT_SECRET_REFRESH_TOKEN: z.string(),
  JWT_SECRET_EMAIL_VERIFY_TOKEN: z.string(),
  JWT_SECRET_FORGOT_PASSWORD_TOKEN: z.string(),

  ACCESS_TOKEN_EXPIRE_IN: z.string(),
  REFRESH_TOKEN_EXPIRE_IN: z.string(),
  EMAIL_VERIFY_TOKEN_EXPIRE_IN: z.string(),
  FORGOT_PASSWORD_TOKEN_EXPIRE_IN: z.string(),

  // Client URL để gửi mail link verify (tránh hardcode localhost)
  CLIENT_URL: z.string().default('http://localhost:3000')
})

// Validate process.env
const configServer = configSchema.safeParse(process.env)

if (!configServer.success) {
  console.error('❌ Các biến môi trường khai báo trong file .env không hợp lệ:')
  console.error(configServer.error.issues)
  throw new Error('Các biến môi trường khai báo trong file .env không hợp lệ')
}

// Export ra object đã validate xong
// Các file khác trong dự án sẽ dùng biến này thay vì process.env
export const envConfig = configServer.data
