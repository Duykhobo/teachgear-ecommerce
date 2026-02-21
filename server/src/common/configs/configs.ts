import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
import { z } from 'zod'

// Load biến môi trường từ file .env
// Thứ tự ưu tiên: .env.{NODE_ENV}.local > .env.{NODE_ENV} > .env.local > .env
const env = process.env.NODE_ENV || 'development'
const envFiles = [
  `.env.${env}.local`, // .env.development.local (dev), .env.production.local (prod)
  `.env.${env}`, // .env.development (dev), .env.production (prod)
  `.env.local`, // Luôn load, trừ khi test
  `.env` // Fallback mặc định
]

const envFilename = envFiles.find((file) => fs.existsSync(path.resolve(file)))

if (!envFilename) {
  console.error('❌ Không tìm thấy file env nào trong danh sách:', envFiles.join(', '))
  console.error('Vui lòng tạo ít nhất 1 file, tham khảo file .env.example')
  process.exit(1)
}

console.log(`✅ Đang sử dụng file: ${envFilename} (NODE_ENV=${env})`)

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
  DB_CATEGORIES_COLLECTION: z.string(),

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
  CLIENT_URL: z.string().default('http://localhost:3000'),

  // Email Service (AWS SES or Gmail)
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USERNAME: z.string(),
  SMTP_PASSWORD: z.string(),
  EMAIL_FROM_ADDRESS: z.string(),
  EMAIL_FROM_NAME: z.string(),
  AWS_SES_REGION: z.string().optional()
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
