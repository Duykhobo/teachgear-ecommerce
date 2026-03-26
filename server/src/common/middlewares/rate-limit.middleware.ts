import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import HTTP_STATUS from '~/common/constants/httpStatus'

/**
 * Rate limiter cho các endpoint nhạy cảm Auth.
 * Mục đích: ngăn Brute Force login và Email Spamming qua forgot-password.
 */

// Login / Register — 10 request / 1 phút / IP
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 10,
  standardHeaders: 'draft-7', // trả `RateLimit-*` headers theo RFC chuẩn
  legacyHeaders: false,
  message: {
    message: 'Too many requests, please try again after 1 minute.',
    status: HTTP_STATUS.TOO_MANY_REQUESTS
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  keyGenerator: (req) => {
    // Ưu tiên dùng IP thật (nếu đứng sau reverse proxy như nginx)
    const forwarded = req.headers['x-forwarded-for']
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : (req.ip ?? '::1')
    // ipKeyGenerator chuẩn hoá IPv6 — bắt buộc dùng với custom keyGenerator trong v7+
    return ipKeyGenerator(ip)
  }
})

// Forgot Password / Resend Email — giới hạn chặt hơn: 5 request / 5 phút / IP
// Tránh spam bắn mail tốn SMTP quota
export const emailActionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 phút
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    message: 'Too many email requests, please try again after 5 minutes.',
    status: HTTP_STATUS.TOO_MANY_REQUESTS
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  keyGenerator: (req) => {
    const forwarded = req.headers['x-forwarded-for']
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : (req.ip ?? '::1')
    return ipKeyGenerator(ip)
  }
})
