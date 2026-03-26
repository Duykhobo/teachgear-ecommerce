import winston from 'winston'
import 'winston-daily-rotate-file'
import path from 'path'
import fs from 'fs'

// Đảm bảo thư mục logs tồn tại
const logDir = 'logs'
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

const { combine, timestamp, printf, colorize, json } = winston.format

// Định nghĩa màu sắc cho từng loại log
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
}

// Áp dụng màu sắc vào winston
winston.addColors(colors)

// Định dạng log cho Console (dễ đọc cho DEV)
const consoleFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  colorize({ all: true }), // Tô màu toàn bộ dòng log
  printf(({ level, message, timestamp, status, requestId, userId, ...meta }) => {
    const reqId = requestId ? `[${requestId}]` : ''
    const uId = userId ? `[User:${userId}]` : ''
    const statusPart = status ? `[${status}]` : ''
    const metaPart = Object.keys(meta).length ? `\n   ↪ Meta: ${JSON.stringify(meta)}` : ''

    // Format: [Timestamp] [Level] [Request-ID] [User-ID] [Status]: Message
    return `${timestamp} ${level} ${reqId}${uId} ${statusPart}: ${message} ${metaPart}`
  })
)

// Định dạng log cho File (JSON để dễ parse)
const fileFormat = combine(timestamp(), json())

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: fileFormat,
  transports: [
    // 1. Ghi log ra Console
    new winston.transports.Console({
      format: consoleFormat,
      silent: process.env.NODE_ENV === 'test' // Tắt log console khi chạy test để output sạch
    }),

    // 2. Ghi log Error ra file (xoay vòng mỗi ngày)
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d', // Giữ log trong 14 ngày
      zippedArchive: true
    }),

    // 3. Ghi toàn bộ log ra file (xoay vòng mỗi ngày)
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      zippedArchive: true
    })
  ]
})

export default logger
