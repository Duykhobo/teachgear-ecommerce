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
  colorize({ all: true }),
  printf(({ level, message, timestamp, status, requestId, userId, ...meta }) => {
    // 1. Rút gọn Request ID (lấy 8 ký tự đầu)
    const reqId = requestId ? `[${requestId.toString().substring(0, 8)}]` : ''
    
    // 2. Định dạng User ID
    const uId = userId ? `[User:${userId}]` : ''

    // 3. Tô màu Status Code dựa trên dải số (2xx, 4xx, 5xx)
    let statusPart = ''
    if (status) {
      const s = Number(status)
      if (s >= 500) statusPart = `\x1b[31m[${s}]\x1b[0m` // Red for 5xx
      else if (s >= 400) statusPart = `\x1b[33m[${s}]\x1b[0m` // Yellow for 4xx
      else statusPart = `\x1b[32m[${s}]\x1b[0m` // Green for 2xx/others
    }

    const metaPart = Object.keys(meta).length ? `\n   ↪ Meta: ${JSON.stringify(meta)}` : ''

    // Format: [Timestamp] [Level] [Short-ReqID] [User-ID] [Status]: Message
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
      maxFiles: '14d',
      maxSize: '20m',
      zippedArchive: true
    }),

    // 3. Ghi toàn bộ log ra file (xoay vòng mỗi ngày)
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '7d',
      maxSize: '20m',
      zippedArchive: true
    })
  ]
})

export default logger
